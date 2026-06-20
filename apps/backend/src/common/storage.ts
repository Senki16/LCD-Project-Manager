import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { uploadsRoot } from './uploads';

const BUCKET = () => process.env.SUPABASE_BUCKET || 'project-files';

let _client: SupabaseClient | null = null;
let _bucketReady = false;

// Lee las variables de entorno de forma diferida (funciona aunque .env se cargue tarde)
function client(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (url && key) {
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

/** ¿Estamos usando almacenamiento en la nube (Supabase) o disco local? */
export function isCloudStorage(): boolean {
  return !!client();
}

/** Crea el bucket público si no existe (idempotente). */
export async function ensureBucket(): Promise<void> {
  const c = client();
  if (!c || _bucketReady) return;
  const { data } = await c.storage.getBucket(BUCKET());
  if (!data) {
    await c.storage.createBucket(BUCKET(), { public: true });
  }
  _bucketReady = true;
}

/**
 * Sube un archivo. `key` es la ruta relativa (ej. projects/<id>/<archivo>).
 * En la nube sube a Supabase; en local lo escribe a disco. Devuelve la key.
 */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const c = client();
  if (c) {
    await ensureBucket();
    const { error } = await c.storage.from(BUCKET()).upload(key, body, { contentType, upsert: true });
    if (error) throw error;
    return key;
  }
  const dest = path.join(uploadsRoot(), ...key.split('/'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, body);
  return key;
}

/** URL pública del archivo (solo en la nube; null en local). */
export function publicUrl(key: string): string | null {
  const c = client();
  if (!c) return null;
  const { data } = c.storage.from(BUCKET()).getPublicUrl(key);
  return data.publicUrl;
}

/** Ruta absoluta en disco (modo local). Soporta keys relativas y rutas absolutas legadas. */
export function localPath(key: string): string {
  return path.isAbsolute(key) ? key : path.join(uploadsRoot(), ...key.split('/'));
}

/** Elimina un archivo (nube o local). */
export async function deleteObject(key: string): Promise<void> {
  const c = client();
  if (c) {
    await c.storage.from(BUCKET()).remove([key]);
    return;
  }
  const p = localPath(key);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
