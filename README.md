# LCD Projects Hub

Plataforma de gestión de proyectos familiares y empresariales para David Zuluaga, Claudia Mónica Henao y Luis Julián Zuluaga.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Desktop shell | Tauri 1.x |
| Frontend | React 18 + TypeScript + Vite |
| Estilos | TailwindCSS + Framer Motion |
| Estado | Zustand + TanStack Query |
| Drag & Drop | dnd-kit |
| Visualización 3D | Three.js + React Three Fiber |
| Backend | NestJS 10 |
| Base de datos | SQLite via Prisma 5 |
| Uploads | Multer (disco local) |

---

## Requisitos previos

### Para el backend (React en modo web — desarrollo rápido)
- Node.js 18+
- npm 9+

### Para la app de escritorio Tauri (opcional)
- [Rust](https://www.rust-lang.org/tools/install) (instalar con `rustup`)
- [Tauri prerequisites for Windows](https://tauri.app/v1/guides/getting-started/prerequisites/#windows)
  - Microsoft Visual Studio C++ Build Tools
  - WebView2

---

## Instalación

```bash
# 1. Entrar al directorio del proyecto
cd lcd-projects-hub

# 2. Instalar dependencias del backend
cd apps/backend
npm install

# 3. Inicializar la base de datos SQLite
npx prisma db push
npx ts-node prisma/seed.ts

# 4. Volver a la raíz e instalar dependencias del frontend
cd ../desktop
npm install
```

---

## Ejecutar en modo desarrollo

### Opción A: Solo web (más rápido para desarrollo)

**Terminal 1 — Backend:**
```bash
cd apps/backend
npm run dev
# → http://localhost:3001/api
```

**Terminal 2 — Frontend (browser):**
```bash
cd apps/desktop
npm run dev
# → http://localhost:1420
```

Abre `http://localhost:1420` en tu navegador.

### Opción B: App de escritorio Tauri

**Terminal 1 — Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 — Tauri:**
```bash
cd apps/desktop
npm run tauri:dev
```

Esto abrirá la ventana de la aplicación de escritorio.

---

## Estructura del proyecto

```
lcd-projects-hub/
├── apps/
│   ├── backend/                 # NestJS API
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Esquema de base de datos
│   │   │   └── seed.ts          # Datos iniciales
│   │   └── src/
│   │       ├── projects/        # CRUD de proyectos + stats
│   │       ├── tasks/           # CRUD de tareas + Kanban
│   │       ├── files/           # Upload/download de archivos
│   │       ├── activity/        # Historial de actividad
│   │       ├── comments/        # Comentarios
│   │       ├── docs/            # Documentación de proyectos
│   │       └── search/          # Búsqueda global
│   └── desktop/                 # React + Tauri
│       ├── src-tauri/           # Shell Rust de Tauri
│       └── src/
│           ├── components/
│           │   ├── layout/      # Sidebar, Header, Layout
│           │   ├── ui/          # Modal, Badge, Avatar, Search
│           │   ├── board/       # KanbanBoard + TaskForm
│           │   ├── files/       # FileManager con drag & drop
│           │   └── viewer3d/    # Visor Three.js (STL/OBJ/GLB)
│           ├── pages/           # Dashboard, Projects, Calendar...
│           ├── stores/          # Zustand (tema, usuario, UI)
│           ├── types/           # TypeScript types compartidos
│           └── utils/           # API client, helpers
```

---

## Funcionalidades implementadas

### Dashboard
- Estadísticas en tiempo real (proyectos, tareas, estado)
- Proyectos recientes con progreso
- Feed de actividad reciente
- Archivos recientes
- Próximas fechas límite

### Proyectos
- Vista grilla y lista
- Filtros por estado y prioridad
- Crear/editar/eliminar proyectos
- Emojis personalizados, colores, etiquetas
- Responsable + colaboradores
- Barra de progreso automática

### Tablero Kanban
- 5 columnas: Pendiente / En Proceso / Bloqueado / En Revisión / Completado
- Drag & Drop entre columnas (dnd-kit)
- Tareas con prioridad, responsables, checklist, fechas
- Indicadores de progreso de checklist
- Badges de archivos adjuntos y comentarios

### Gestión de archivos
- Subida via click o drag & drop
- Navegación por carpetas/subcarpetas
- Vista grilla y lista
- Preview en modal
- Descarga directa
- Soporte: PDF, imágenes, STL, OBJ, GLB, DOCX, XLSX...

### Visualizador 3D
- Formatos: STL, OBJ, GLB, GLTF
- Rotación libre (OrbitControls)
- Zoom y pan
- Modo wireframe
- Grid configurable
- 3 fondos (oscuro, claro, studio)
- Iluminación realista con sombras

### Calendario
- Vista mensual
- Tareas con fecha límite por día
- Indicador de color por prioridad
- Navegación mes anterior/siguiente

### Búsqueda global
- Atajo de teclado: Ctrl+K / Cmd+K
- Busca en proyectos, tareas y archivos
- Resultados instantáneos (debounce 200ms)
- Navegación directa al resultado

### Documentación
- Editor por proyecto
- Múltiples documentos por proyecto
- Guardado con título y contenido

### Configuración
- Tema claro / oscuro / sistema
- Selección de usuario activo (David / Claudia / Luis)
- Info del sistema

---

## API endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/projects/stats | Stats del dashboard |
| GET | /api/projects | Listar proyectos |
| POST | /api/projects | Crear proyecto |
| GET | /api/projects/:id | Detalle de proyecto |
| PUT | /api/projects/:id | Editar proyecto |
| DELETE | /api/projects/:id | Eliminar proyecto |
| GET | /api/projects/:id/tasks | Tareas del proyecto |
| POST | /api/projects/:id/tasks | Crear tarea |
| PUT | /api/tasks/:id | Editar tarea |
| PATCH | /api/tasks/:id/move | Mover en Kanban |
| GET | /api/projects/:id/files | Archivos del proyecto |
| POST | /api/projects/:id/files | Subir archivo |
| GET | /api/files/:id/download | Descargar archivo |
| GET | /api/search?q= | Búsqueda global |
| GET | /api/activity | Actividad reciente |
| GET | /api/users | Listar usuarios |

---

## Roadmap — v2

- [ ] Sincronización en la nube (Google Drive / S3)
- [ ] Notificaciones push de escritorio
- [ ] Editor de documentación enriquecido (Markdown/WYSIWYG)
- [ ] Chat interno por proyecto
- [ ] Vista de medición en el visor 3D (cotas)
- [ ] App móvil iOS/Android (React Native)
- [ ] IA integrada (Claude / GPT) para resumen de proyectos
- [ ] OCR en documentos PDF
- [ ] Exportación a PDF de reportes
- [ ] Gestión de inventario
- [ ] Integración CRM ligero
- [ ] Trabajo colaborativo en tiempo real (WebSockets)

---

## Usuarios por defecto (seed)

| Nombre | Email | Color |
|--------|-------|-------|
| David Zuluaga | david@lcdprojects.com | #007AFF (Azul Apple) |
| Claudia Mónica Henao | claudia@lcdprojects.com | #FF2D55 (Rosa Apple) |
| Luis Julián Zuluaga | luis@lcdprojects.com | #34C759 (Verde Apple) |
