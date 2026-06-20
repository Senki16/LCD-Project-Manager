import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit2, Trash2, Users } from 'lucide-react';
import { projectsApi, activityApi, docsApi, filesApi } from '@/utils/api';
import { useAppStore } from '@/stores/appStore';
import Header from '@/components/layout/Header';
import { StatusBadge, PriorityBadge, TagBadge } from '@/components/ui/Badge';
import { AvatarGroup } from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import KanbanBoard from '@/components/board/KanbanBoard';
import FileManager from '@/components/files/FileManager';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import ModelViewer from '@/components/viewer3d/ModelViewer';
import { formatDate, getProjectProgress, parseTags } from '@/utils/helpers';
import type { ProjectStatus, Priority, FileRecord } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';

const TABS = ['General', 'Tablero', 'Archivos', 'Documentación', 'Modelos 3D', 'Actividad'] as const;
type Tab = typeof TABS[number];

const STATUS_OPTIONS: ProjectStatus[] = ['IDEA', 'PLANNING', 'IN_DEVELOPMENT', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED'];
const PRIORITY_OPTIONS: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { currentUser } = useAppStore();
  const [tab, setTab] = useState<Tab>('General');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getOne(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activityApi.getByProject(id!).then(r => r.data),
    enabled: tab === 'Actividad' && !!id,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['docs', id],
    queryFn: () => docsApi.getByProject(id!).then(r => r.data),
    enabled: tab === 'Documentación' && !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); navigate('/projects'); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => projectsApi.update(id!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); qc.invalidateQueries({ queryKey: ['projects'] }); setEditOpen(false); },
  });

  if (isLoading) return <LoadingState />;
  if (!project) return <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>Proyecto no encontrado</div>;

  const progress = getProjectProgress(project.tasks || []);
  const tags = parseTags(project.tags);

  const openEdit = () => {
    setEditForm({ name: project.name, description: project.description || '', status: project.status, priority: project.priority, tags: parseTags(project.tags).join(', ') });
    setEditOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={`${project.emoji || ''} ${project.name}`}
        action={{ label: 'Editar', onClick: openEdit }}
      />

      {/* Project header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/projects')} className="btn-ghost p-1.5">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            {tags.map((t: string) => <TagBadge key={t} tag={t} />)}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <AvatarGroup users={[project.owner, ...project.collaborators.map((c: any) => c.user)]} max={4} size="sm" />
            {currentUser?.role === 'ADMIN' && (
              <button onClick={() => deleteMutation.mutate()} className="btn-ghost p-1.5" style={{ color: 'var(--danger)' }} title="Eliminar proyecto">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        )}

        {/* Progress */}
        {(project.tasks?.length ?? 0) > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: project.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
              {progress}% · {project.tasks.filter((t: any) => t.status === 'COMPLETED').length}/{project.tasks.length} tareas
            </span>
          </div>
        )}

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {project.startDate && <span>Inicio: {formatDate(project.startDate)}</span>}
            {project.endDate && <span>Fin: {formatDate(project.endDate)}</span>}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b px-6 gap-1" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'active' : ''}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'General' && <GeneralTab project={project} />}
        {tab === 'Tablero' && <KanbanBoard tasks={project.tasks || []} project={project} projectId={id!} />}
        {tab === 'Archivos' && <FileManager projectId={id!} />}
        {tab === 'Documentación' && <DocsTab projectId={id!} docs={docs} onRefresh={() => qc.invalidateQueries({ queryKey: ['docs', id] })} />}
        {tab === 'Modelos 3D' && <ModelsTab projectId={id!} />}
        {tab === 'Actividad' && <ActivityFeed activities={activities || []} />}
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar proyecto" size="md">
        {editForm && (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Nombre</label>
              <input className="input" value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Descripción</label>
              <textarea className="textarea" rows={3} value={editForm.description} onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Estado</label>
                <select className="select" value={editForm.status} onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Prioridad</label>
                <select className="select" value={editForm.priority} onChange={e => setEditForm((f: any) => ({ ...f, priority: e.target.value }))}>
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Etiquetas (separadas por coma)</label>
              <input className="input" value={editForm.tags} onChange={e => setEditForm((f: any) => ({ ...f, tags: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setEditOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => updateMutation.mutate({ ...editForm, tags: editForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) })} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function GeneralTab({ project }: { project: any }) {
  const members = [{ ...project.owner, role: 'owner' }, ...project.collaborators.map((c: any) => ({ ...c.user, role: c.role }))];

  return (
    <div className="overflow-y-auto h-full p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="surface-elevated rounded-apple-lg p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Información general</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Estado', value: <StatusBadge status={project.status} /> },
              { label: 'Prioridad', value: <PriorityBadge priority={project.priority} /> },
              { label: 'Fecha inicio', value: project.startDate ? formatDate(project.startDate) : '—' },
              { label: 'Fecha fin', value: project.endDate ? formatDate(project.endDate) : '—' },
              { label: 'Tareas', value: `${project.tasks?.filter((t: any) => t.status === 'COMPLETED').length ?? 0} / ${project.tasks?.length ?? 0} completadas` },
              { label: 'Archivos', value: `${project._count?.files ?? 0} archivos` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {project.description && (
          <div className="surface-elevated rounded-apple-lg p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Descripción</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          </div>
        )}

        <div className="surface-elevated rounded-apple-lg p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={14} /> Equipo
          </h3>
          <div className="space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: m.color }}>
                  {m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{m.email}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {m.role === 'owner' ? 'Responsable' : m.role === 'MEMBER' ? 'Colaborador' : 'Observador'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocsTab({ projectId, docs, onRefresh }: { projectId: string; docs: any[]; onRefresh: () => void }) {
  const qc = useQueryClient();
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const createMutation = useMutation({
    mutationFn: () => docsApi.create(projectId, { title: 'Nuevo documento', content: '' }),
    onSuccess: (r) => { onRefresh(); setActiveDoc(r.data); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => docsApi.update(id, data),
    onSuccess: () => { onRefresh(); setEditing(false); },
  });

  return (
    <div className="flex h-full">
      {/* Doc list */}
      <div className="w-56 border-r flex flex-col" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <button className="btn-primary w-full text-xs" onClick={() => createMutation.mutate()}>+ Nuevo doc</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {docs.map((doc: any) => (
            <button key={doc.id} onClick={() => { setActiveDoc(doc); setEditing(false); }}
              className={`w-full text-left px-3 py-2 rounded-apple text-sm truncate transition-all ${activeDoc?.id === doc.id ? 'font-medium' : ''}`}
              style={{ background: activeDoc?.id === doc.id ? 'rgba(0,122,255,0.1)' : 'transparent', color: activeDoc?.id === doc.id ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              📄 {doc.title}
            </button>
          ))}
          {!docs.length && <div className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>Sin documentos</div>}
        </div>
      </div>

      {/* Doc content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeDoc ? (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              {editing ? (
                <input className="input text-lg font-semibold flex-1 mr-2" defaultValue={activeDoc.title} onChange={e => setActiveDoc((d: any) => ({ ...d, title: e.target.value }))} />
              ) : (
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{activeDoc.title}</h2>
              )}
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button className="btn-secondary text-xs" onClick={() => setEditing(false)}>Cancelar</button>
                    <button className="btn-primary text-xs" onClick={() => updateMutation.mutate({ id: activeDoc.id, data: { title: activeDoc.title, content: editContent } })}>
                      Guardar
                    </button>
                  </>
                ) : (
                  <button className="btn-ghost text-xs" onClick={() => { setEditing(true); setEditContent(activeDoc.content); }}>
                    <Edit2 size={13} /> Editar
                  </button>
                )}
              </div>
            </div>
            {editing ? (
              <textarea
                className="textarea w-full text-sm leading-relaxed"
                style={{ minHeight: 400, resize: 'vertical' }}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Escribe aquí tu documentación en Markdown..."
              />
            ) : (
              <div className="prose text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                {activeDoc.content || <span style={{ color: 'var(--text-tertiary)' }}>Sin contenido. Haz clic en Editar para comenzar.</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Selecciona o crea un documento
          </div>
        )}
      </div>
    </div>
  );
}

function ModelsTab({ projectId }: { projectId: string }) {
  const [selected, setSelected] = useState<FileRecord | null>(null);
  const { data: files = [] } = useQuery({
    queryKey: ['files', projectId],
    queryFn: () => filesApi.getByProject(projectId).then((r: any) => r.data),
  });

  const models = files.filter((f: FileRecord) => ['stl', 'obj', 'glb', 'gltf'].includes(f.extension.toLowerCase()));

  if (!models.length) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>
        <div className="text-center">
          <div className="text-5xl mb-3">🧊</div>
          <div className="text-sm">Sin modelos 3D en este proyecto</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Sube archivos STL, OBJ, GLB o GLTF en la pestaña Archivos</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-52 border-r overflow-y-auto p-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        {models.map((f: FileRecord) => (
          <button key={f.id} onClick={() => setSelected(f)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-apple text-left text-xs mb-1 transition-all ${selected?.id === f.id ? 'font-medium' : ''}`}
            style={{ background: selected?.id === f.id ? 'rgba(0,122,255,0.1)' : 'transparent', color: selected?.id === f.id ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            🧊 <span className="truncate">{f.name}</span>
          </button>
        ))}
      </div>
      <div className="flex-1">
        {selected ? (
          <ModelViewer fileId={selected.id} extension={selected.extension} fileName={selected.name} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Selecciona un modelo
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b animate-pulse" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }} />
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-apple-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
