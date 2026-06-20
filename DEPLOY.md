# Desplegar LCD Projects Hub en la web

Arquitectura: **Frontend en Vercel** + **Backend en Railway** (con disco persistente para SQLite + archivos).

> Repo: https://github.com/Senki16/LCD-Project-Manager

---

## 1) Backend en Railway

1. Entra a **https://railway.app** → inicia sesión con GitHub.
2. **New Project → Deploy from GitHub repo** → elige `Senki16/LCD-Project-Manager`.
3. Abre el servicio creado → pestaña **Settings**:
   - **Root Directory:** `apps/backend`
   - (El build y el arranque ya están definidos en `railway.json` / `nixpacks.toml`.)
4. Pestaña **Variables** → agrega:
   | Variable        | Valor                          |
   |-----------------|--------------------------------|
   | `DATABASE_URL`  | `file:/data/lcd_projects.db`   |
   | `UPLOADS_ROOT`  | `/data/uploads`                |
   | `FRONTEND_URL`  | *(opcional, ver nota CORS)*    |
   - `PORT` lo inyecta Railway automáticamente, no lo pongas.
5. Pestaña **Volumes** → **New Volume** → Mount path: **`/data`**
   *(Aquí viven la base de datos y los archivos subidos, para que persistan.)*
6. **Deploy**. Cuando termine, en **Settings → Networking → Generate Domain** copia la URL pública,
   por ejemplo: `https://lcd-project-manager-production.up.railway.app`

Verifica que funciona abriendo en el navegador:
`https://TU-URL.up.railway.app/api/users` → debe devolver los 3 usuarios en JSON.

---

## 2) Frontend en Vercel

1. Entra a **https://vercel.com** → inicia sesión con GitHub.
2. **Add New → Project** → importa `Senki16/LCD-Project-Manager`.
3. En la configuración del proyecto:
   - **Root Directory:** `apps/desktop`
   - Framework: **Vite** (se detecta solo; el `vercel.json` ya define build y output).
4. **Environment Variables** → agrega:
   | Variable        | Valor                                         |
   |-----------------|-----------------------------------------------|
   | `VITE_API_URL`  | `https://TU-URL.up.railway.app/api`           |
   - ⚠️ Esta variable se "hornea" en el build. Si la cambias, hay que **redeploy**.
5. **Deploy**. Al terminar tendrás una URL tipo `https://lcd-project-manager.vercel.app`.

---

## Notas importantes

- **CORS:** el backend acepta automáticamente cualquier dominio `*.vercel.app` y `localhost`.
  Solo necesitas poner `FRONTEND_URL` en Railway si usas un **dominio propio** (no .vercel.app).
- **Datos:** la versión web arranca con los **3 usuarios** ya creados, pero **sin proyectos** —
  los archivos reales (155 MB) viven solo en la app de escritorio (.exe). En la web puedes
  crear proyectos y subir archivos desde la interfaz, y se guardan en el disco de Railway.
- **App de escritorio:** sigue funcionando igual con todos los datos (no se ve afectada por esto).
- **Costos:** Vercel es gratis para esto. Railway da crédito de prueba; un servicio pequeño con
  un volumen entra en el plan gratuito/credit. Si prefieres, Fly.io también ofrece volúmenes gratis.
