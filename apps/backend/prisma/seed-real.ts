import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const SOURCE_BASE = 'C:\\Users\\david\\OneDrive\\Escritorio\\Proyectos\\Proyectos mama\\Proyectos\\ARCHIVOS TRABAJOS DE MAMA';
// Respeta UPLOADS_ROOT (igual que el backend) para poder sincronizar contra dev o userData
const UPLOADS_DIR = process.env.UPLOADS_ROOT || path.join(process.cwd(), 'uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Archivos basura que NO se importan
function shouldSkip(name: string): boolean {
  if (name.startsWith('~$')) return true; // locks temporales de Office/SolidWorks
  if (['.DS_Store', 'Thumbs.db', 'desktop.ini'].includes(name)) return true;
  if (!path.extname(name)) return true; // sin extensión (ej. 'pla' duplicado)
  return false;
}

// Recorre una carpeta y devuelve { abs, rel } de cada archivo (rel con '/')
function walk(root: string, base = root): { abs: string; rel: string }[] {
  if (!fs.existsSync(root)) return [];
  const out: { abs: string; rel: string }[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const abs = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(abs, base));
    } else if (!shouldSkip(entry.name)) {
      out.push({ abs, rel: path.relative(base, abs).split(path.sep).join('/') });
    }
  }
  return out;
}

function getMime(ext: string): string {
  const map: Record<string, string> = {
    jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    pdf: 'application/pdf', zip: 'application/zip',
    stl: 'model/stl', obj: 'model/obj', glb: 'model/gltf-binary', gltf: 'model/gltf+json',
    tex: 'text/x-tex', txt: 'text/plain',
    sldprt: 'application/octet-stream', sldasm: 'application/octet-stream',
    mp4: 'video/mp4', mov: 'video/quicktime',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

// Copia un archivo a uploads/projects/<id>/<rel> y crea el registro en la BD
async function addFile(projectId: string, absSrc: string, rel: string) {
  if (!fs.existsSync(absSrc)) { console.warn(`  ⚠️  No encontrado: ${absSrc}`); return false; }
  const destFull = path.join(UPLOADS_DIR, 'projects', projectId, ...rel.split('/'));
  ensureDir(path.dirname(destFull));
  try {
    fs.copyFileSync(absSrc, destFull);
  } catch (e: any) {
    console.warn(`  ⚠️  Error copiando ${rel}: ${e.message}`);
    return false;
  }
  const size = fs.statSync(destFull).size;
  const name = path.basename(rel);
  const ext = path.extname(name).slice(1).toLowerCase();
  console.log(`  📎 ${rel} (${(size / 1024).toFixed(0)} KB)`);

  await prisma.file.create({
    data: {
      projectId,
      name,
      originalName: name,
      size,
      mimeType: getMime(ext),
      extension: ext,
      path: `projects/${projectId}/${rel}`, // ruta relativa portable
    },
  });
  return true;
}

// Reemplaza por completo los archivos de un proyecto (mirror del origen)
async function syncProjectFiles(projectId: string, entries: { abs: string; rel: string }[]) {
  await prisma.file.deleteMany({ where: { projectId } });
  const projDir = path.join(UPLOADS_DIR, 'projects', projectId);
  if (fs.existsSync(projDir)) fs.rmSync(projDir, { recursive: true, force: true });

  let count = 0;
  for (const e of entries) {
    if (await addFile(projectId, e.abs, e.rel)) count++;
  }
  return count;
}

async function main() {
  ensureDir(UPLOADS_DIR);

  const claudia = await prisma.user.findFirst({ where: { email: 'claudia@lcdprojects.com' } });
  const david = await prisma.user.findFirst({ where: { email: 'david@lcdprojects.com' } });
  const luis = await prisma.user.findFirst({ where: { email: 'luis@lcdprojects.com' } });
  if (!claudia || !david || !luis) {
    console.error('❌ Usuarios no encontrados. Ejecuta primero el seed de usuarios (prisma/seed.ts).');
    process.exit(1);
  }

  // ── Definición de los 3 proyectos reales ──────────────────────────────────
  const projects = [
    {
      id: 'real-project-arte-conceptual',
      name: 'Arte Conceptual — Bolsero y Monsteras',
      description: 'Diseño del bolsero/masajeador profesional para masajes y la colección Monsteras: arte conceptual, identidad de marca (logo), renders y modelos 3D (STL) del masajeador para impresión.',
      status: 'IN_DEVELOPMENT', priority: 'MEDIUM', ownerId: claudia.id,
      color: '#FF2D55', emoji: '🎨',
      tags: ['arte', 'conceptual', 'diseño', 'producto', 'bolsero', 'masajeador', 'monsteras', '3D', 'STL'],
      collaborators: [david.id],
      activityUser: claudia.id,
      // El origen se reorganizó en dos carpetas (MASAJEADOR y MONSTERAS)
      folders: ['MASAJEADOR', 'MONSTERAS'],
      tasks: [
        { title: 'Revisión de arte conceptual bolsero', column: 'IN_REVIEW', status: 'IN_REVIEW', priority: 'HIGH', position: 0 },
        { title: 'Ajustes de paleta de colores Monsteras', column: 'PENDING', status: 'PENDING', priority: 'MEDIUM', position: 0 },
        { title: 'Presentación final al cliente', column: 'PENDING', status: 'PENDING', priority: 'HIGH', position: 1 },
      ],
    },
    {
      id: 'real-project-embudo',
      name: 'Proyecto Embudo — Diseño Industrial',
      description: 'Diseño y modelado de embudo industrial en SolidWorks. Incluye cono, tapa y ensamble principal, además de los STL exportados para impresión 3D y prototipado.',
      status: 'IN_DEVELOPMENT', priority: 'HIGH', ownerId: claudia.id,
      color: '#FF9500', emoji: '⚙️',
      tags: ['manufactura', 'SolidWorks', 'diseño industrial', 'embudo', 'molde', 'STL'],
      collaborators: [luis.id, david.id],
      activityUser: claudia.id,
      folder: 'Proyecto Embudo', // se escanea recursivamente
      tasks: [
        { title: 'Modelado cono — revisión tolerancias', column: 'COMPLETED', status: 'COMPLETED', priority: 'HIGH', position: 0 },
        { title: 'Modelado tapa — ajuste de rosca', column: 'COMPLETED', status: 'COMPLETED', priority: 'HIGH', position: 1 },
        { title: 'Exportación de STL para impresión 3D', column: 'COMPLETED', status: 'COMPLETED', priority: 'MEDIUM', position: 2 },
        { title: 'Ensamble PIEZA 1 MAMA', column: 'IN_REVIEW', status: 'IN_REVIEW', priority: 'CRITICAL', position: 0 },
        { title: 'Generación de planos de manufactura', column: 'PENDING', status: 'PENDING', priority: 'HIGH', position: 0 },
        { title: 'Cotización con proveedor de inyección', column: 'PENDING', status: 'PENDING', priority: 'MEDIUM', position: 1 },
        { title: 'Prototipo físico impresión 3D', column: 'PENDING', status: 'PENDING', priority: 'HIGH', position: 2 },
      ],
    },
    {
      id: 'real-project-gafas',
      name: 'Gafas Estenopeicas — Investigación y Fabricación 3D',
      description: 'Investigación científica sobre gafas estenopeicas con distribución hexagonal. Incluye modelado 3D (STL y SolidWorks), paper académico en LaTeX, análisis LabVIEW y distribución de luz.',
      status: 'IN_REVIEW', priority: 'HIGH', ownerId: luis.id,
      color: '#5856D6', emoji: '🔬',
      tags: ['investigación', 'impresión 3D', 'STL', 'óptica', 'paper', 'LaTeX', 'LabVIEW', 'gafas'],
      collaborators: [claudia.id, david.id],
      activityUser: luis.id,
      folder: 'Proyectos Gafas estereopeicas',
      tasks: [
        { title: 'Modelado STL gafas hexagonales (0.1)', column: 'COMPLETED', status: 'COMPLETED', priority: 'HIGH', position: 0 },
        { title: 'Modelado STL gafas abeja (GAFAS_AVEJA)', column: 'COMPLETED', status: 'COMPLETED', priority: 'HIGH', position: 1 },
        { title: 'Escritura paper LaTeX — introducción y metodología', column: 'COMPLETED', status: 'COMPLETED', priority: 'HIGH', position: 2 },
        { title: 'Generación de gráficas de intensidad', column: 'COMPLETED', status: 'COMPLETED', priority: 'MEDIUM', position: 3 },
        { title: 'Revisión del paper por pares', column: 'IN_REVIEW', status: 'IN_REVIEW', priority: 'CRITICAL', position: 0 },
        { title: 'Correcciones y ajustes post-revisión', column: 'PENDING', status: 'PENDING', priority: 'HIGH', position: 0 },
        { title: 'Impresión 3D prototipo final en PLA', column: 'PENDING', status: 'PENDING', priority: 'MEDIUM', position: 1 },
        { title: 'Pruebas ópticas del prototipo', column: 'PENDING', status: 'PENDING', priority: 'HIGH', position: 2 },
        { title: 'Envío a revista científica', column: 'PENDING', status: 'PENDING', priority: 'CRITICAL', position: 3 },
      ],
    },
  ];

  let totalFiles = 0;
  for (const p of projects) {
    console.log(`\n📁 Sincronizando: ${p.name}`);

    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name, description: p.description, status: p.status,
        priority: p.priority, color: p.color, emoji: p.emoji,
        tags: JSON.stringify(p.tags),
      },
      create: {
        id: p.id, name: p.name, description: p.description, status: p.status,
        priority: p.priority, ownerId: p.ownerId, color: p.color, emoji: p.emoji,
        tags: JSON.stringify(p.tags),
      },
    });

    // Colaboradores (idempotente)
    for (const userId of p.collaborators) {
      await prisma.projectCollaborator.upsert({
        where: { projectId_userId: { projectId: p.id, userId } },
        update: {},
        create: { projectId: p.id, userId, role: 'MEMBER' },
      });
    }

    // Tareas y actividad: solo si el proyecto aún no tiene (no duplicar en re-sync)
    if ((await prisma.task.count({ where: { projectId: p.id } })) === 0) {
      for (const t of p.tasks) await prisma.task.create({ data: { ...t, projectId: p.id } });
    }
    if ((await prisma.activity.count({ where: { projectId: p.id } })) === 0) {
      await prisma.activity.create({
        data: { projectId: p.id, userId: p.activityUser, type: 'PROJECT_CREATED', description: 'creó el proyecto' },
      });
    }

    // Archivos: mirror del origen
    const src = p as any;
    let entries: { abs: string; rel: string }[];
    if (src.folders) {
      // varias carpetas: el nombre de la carpeta queda en la ruta relativa
      entries = src.folders.flatMap((f: string) => walk(path.join(SOURCE_BASE, f), SOURCE_BASE));
    } else if (src.folder) {
      entries = walk(path.join(SOURCE_BASE, src.folder));
    } else {
      entries = (src.rootFiles || []).map((f: string) => ({ abs: path.join(SOURCE_BASE, f), rel: f }));
    }

    const n = await syncProjectFiles(p.id, entries);
    totalFiles += n;
    console.log(`  ✅ ${n} archivos sincronizados`);
  }

  // ── Documentación de proyectos (idempotente por id) ───────────────────────
  await prisma.doc.upsert({
    where: { id: 'doc-embudo-001' },
    update: {},
    create: {
      id: 'doc-embudo-001', projectId: 'real-project-embudo',
      title: 'Especificaciones técnicas del embudo',
      content: `# Proyecto Embudo — Especificaciones Técnicas

## Piezas diseñadas
- **cono.SLDPRT** — Cuerpo cónico principal del embudo
- **tapa.SLDPRT** — Tapa de cierre superior con rosca
- **embudo mama.SLDPRT** — Pieza principal completa
- **PIEZA 1 MAMA.SLDASM** — Ensamble completo de todas las piezas

## STL para impresión 3D
La carpeta \`stl/\` contiene los archivos exportados listos para imprimir o prototipar
(cono, tapa, embudo y las piezas del ensamble). Estos sí se pueden abrir en el visor 3D de la app.

## Material sugerido
- Inyección de plástico PP/PE para producción
- PLA/ABS para prototipado rápido

## Estado
En revisión de ensamble final. Pendiente generación de planos 2D para manufactura.`,
    },
  });

  await prisma.doc.upsert({
    where: { id: 'doc-gafas-001' },
    update: {},
    create: {
      id: 'doc-gafas-001', projectId: 'real-project-gafas',
      title: 'Resumen del paper — Gafas Estenopeicas',
      content: `# Gafas Estenopeicas con Distribución Hexagonal

## Resumen
Investigación sobre el diseño y fabricación de gafas estenopeicas con patrón de orificios
en distribución hexagonal, para maximizar la resolución visual y la distribución uniforme de la luz.

## Archivos 3D
- **0.1.STL / 0.1.SLDPRT** — Diseño de gafas (distribución hexagonal base)
- **GAFAS_AVEJA.STL** — Variante con patrón tipo abeja (honeycomb)

## Paper académico (LaTeX)
- \`main.tex\` — fuente LaTeX del paper
- \`GAFAS PAPER.pdf\` — versión compilada
- Figuras: intensidad experimental vs uniforme, distribución hexagonal, comparativa de materiales (PLA vs policarbonato)

## Análisis
- Carpeta **LABVIEW TALLER 3** — instrumentación / análisis en LabVIEW

## Estado
En revisión por pares. Pendiente correcciones y envío a revista.`,
    },
  });

  console.log(`\n✅ Sincronización completa: ${totalFiles} archivos en 3 proyectos`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
