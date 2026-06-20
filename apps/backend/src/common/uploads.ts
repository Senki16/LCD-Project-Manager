import * as path from 'path';

/**
 * Raíz de la carpeta de uploads.
 * En desarrollo: <cwd>/uploads
 * En el .exe empaquetado: se inyecta UPLOADS_ROOT apuntando a una carpeta escribible
 * (userData de Electron) para que los archivos persistan fuera del instalador.
 */
export function uploadsRoot(): string {
  return process.env.UPLOADS_ROOT || path.join(process.cwd(), 'uploads');
}

/**
 * Convierte una ruta de archivo guardada en la BD a una ruta absoluta usable.
 * Soporta tanto rutas relativas (nuevas, portables) como absolutas (legado).
 */
export function resolveUploadPath(stored: string): string {
  if (!stored) return stored;
  return path.isAbsolute(stored) ? stored : path.join(uploadsRoot(), stored);
}

/**
 * Convierte una ruta absoluta de un archivo recién subido a una ruta relativa
 * (con separadores '/') respecto a la raíz de uploads, para guardarla en la BD.
 */
export function toRelativeUpload(absPath: string): string {
  const root = uploadsRoot();
  const rel = path.relative(root, absPath);
  if (rel.startsWith('..')) return path.basename(absPath);
  return rel.split(path.sep).join('/');
}
