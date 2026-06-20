@echo off
title LCD Projects Hub — Electron
chcp 65001 >nul

echo.
echo  ========================================
echo    LCD Projects Hub — Modo Electron
echo  ========================================
echo.

cd /d "%~dp0"

:: Verificar dependencias
if not exist "apps\desktop\node_modules\electron" (
    echo [!] Instalando dependencias de Electron...
    cd /d "%~dp0apps\desktop"
    call npm install
    cd /d "%~dp0"
)

:: Arrancar backend
echo [1/3] Arrancando backend (puerto 3001)...
start "LCD Backend" cmd /k "cd /d "%~dp0apps\backend" && npm run dev"

timeout /t 4 /nobreak >nul

:: Arrancar frontend Vite (necesario en modo dev)
echo [2/3] Arrancando frontend (puerto 1420)...
start "LCD Frontend" cmd /k "cd /d "%~dp0apps\desktop" && npm run dev"

:: Dar tiempo al frontend para compilar
echo  Compilando frontend...
timeout /t 8 /nobreak >nul

:: Abrir Electron (ventana de app)
echo [3/3] Abriendo LCD Projects Hub...
cd /d "%~dp0apps\desktop"
set NODE_ENV=development
npx electron electron/main.cjs

echo.
echo  La app se ha cerrado. Cerrando procesos...
taskkill /FI "WINDOWTITLE eq LCD Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LCD Frontend*" /F >nul 2>&1
