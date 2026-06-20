const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let backendProcess = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 1420;

// ─── Datos de usuario (BD + uploads en carpeta escribible) ────────────────────

/**
 * En el .exe empaquetado, los recursos (BD semilla y uploads) van dentro de la
 * instalación (solo lectura). Los copiamos a userData (escribible) en el primer
 * arranque para que los datos persistan y se puedan modificar.
 * Devuelve { dbPath, uploadsPath }.
 */
function setupUserData() {
  const userData = app.getPath('userData');
  const dbPath = path.join(userData, 'lcd_projects.db');
  const uploadsPath = path.join(userData, 'uploads');

  const resBackend = path.join(process.resourcesPath, 'backend');
  const seedDb = path.join(resBackend, 'prisma', 'lcd_projects.db');
  const seedUploads = path.join(resBackend, 'uploads');

  // Copiar BD semilla si aún no existe
  if (!fs.existsSync(dbPath) && fs.existsSync(seedDb)) {
    fs.copyFileSync(seedDb, dbPath);
    console.log('[Electron] BD inicial copiada a', dbPath);
  }

  // Copiar uploads semilla si aún no existen
  if (!fs.existsSync(uploadsPath) && fs.existsSync(seedUploads)) {
    copyDir(seedUploads, uploadsPath);
    console.log('[Electron] Uploads iniciales copiados a', uploadsPath);
  }
  fs.mkdirSync(uploadsPath, { recursive: true });

  return { dbPath, uploadsPath };
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ─── Backend ──────────────────────────────────────────────────────────────────

function startBackend() {
  if (isDev) return Promise.resolve(); // En dev el backend lo arranca el .bat / npm

  const { dbPath, uploadsPath } = setupUserData();
  const backendDir = path.join(process.resourcesPath, 'backend');

  console.log('[Electron] Arrancando backend en:', backendDir);

  backendProcess = spawn(process.execPath, ['dist/main.js'], {
    cwd: backendDir,
    env: {
      ...process.env,
      // Ejecuta el binario de Electron como Node puro (no abre otra ventana)
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: 'production',
      PORT: String(BACKEND_PORT),
      DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`,
      UPLOADS_ROOT: uploadsPath,
    },
    stdio: 'pipe',
  });

  backendProcess.stdout.on('data', (d) => console.log('[Backend]', d.toString().trim()));
  backendProcess.stderr.on('data', (d) => console.error('[Backend ERR]', d.toString().trim()));
  backendProcess.on('close', (code) => console.log('[Backend] salió con código', code));

  return waitForBackend(BACKEND_PORT, 40);
}

function waitForBackend(port, retriesLeft) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http
        .get(`http://localhost:${port}/api/users`, (res) => {
          res.resume();
          if (res.statusCode < 500) resolve();
          else retry();
        })
        .on('error', retry);
    };
    const retry = () => {
      if (retriesLeft-- <= 0) return reject(new Error('El backend no respondió a tiempo'));
      setTimeout(attempt, 1000);
    };
    attempt();
  });
}

function stopBackend() {
  if (backendProcess) {
    try { backendProcess.kill(); } catch (_) {}
    backendProcess = null;
  }
}

// ─── Ventana principal ───────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'LCD Projects Hub',
    backgroundColor: '#0A0A0A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  const url = isDev
    ? `http://localhost:${FRONTEND_PORT}`
    : `file://${path.join(__dirname, '..', 'dist', 'index.html')}`;

  mainWindow.loadURL(url);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── Ciclo de vida ───────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    await startBackend();
  } catch (err) {
    console.error('Error al arrancar el backend:', err);
    dialog.showErrorBox(
      'LCD Projects Hub',
      'No se pudo iniciar el servidor interno.\n\n' + (err && err.message ? err.message : ''),
    );
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', stopBackend);
