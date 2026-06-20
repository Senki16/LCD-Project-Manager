import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { projectsApi, usersApi } from '@/utils/api';
import Header from '@/components/layout/Header';
import Modal from '@/components/ui/Modal';
import { StatusBadge, PriorityBadge, TagBadge } from '@/components/ui/Badge';
import { AvatarGroup } from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { formatRelative, getProjectProgress, parseTags } from '@/utils/helpers';
import type { Project, ProjectStatus, Priority } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';

const STATUS_OPTIONS: ProjectStatus[] = ['IDEA', 'PLANNING', 'IN_DEVELOPMENT', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED'];
const PRIORITY_OPTIONS: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const EMOJIS = ['📁', '🚀', '💡', '🏭', '🎨', '⚙️', '📐', '🧊', '🔬', '💼', '🏗️', '🌱'];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'PLANNING' as ProjectStatus, priority: 'MEDIUM' as Priority, emoji: '📁', color: '#007AFF', ownerId: '', tags: '' });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', filterStatus, filterPriority],
    queryFn: () => projectsApi.getAll({ ...(filterStatus && { status: filterStatus }), ...(filterPriority && { priority: filterPriority }) }).then(r => r.data),
  });

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); qc.invalidateQueries({ queryKey: ['stats'] }); setCreateOpen(false); resetForm(); },
  });

  const resetForm = () => setForm({ name: '', description: '', status: 'PLANNING', priority: 'MEDIUM', emoji: '📁', color: '#007AFF', ownerId: users?.[0]?.id ?? '', tags: '' });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    createMutation.mutate({ ...form, tags, ownerId: form.ownerId || users?.[0]?.id });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Proyectos"
        subtitle={`${projects?.length ?? 0} proyectos`}
        action={{ label: 'Nuevo proyecto', onClick: () => { setCreateOpen(true); resetForm(); } }}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
        <select className="select" style={{ width: 'auto', paddingRight: '2rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="select" style={{ width: 'auto', paddingRight: '2rem' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">Todas las prioridades</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setView('grid')} className={`btn-ghost ${view === 'grid' ? 'text-accent' : ''}`} style={view === 'grid' ? { color: 'var(--accent)', background: 'rgba(0,122,255,0.1)' } : {}}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView('list')} className={`btn-ghost`} style={view === 'list' ? { color: 'var(--accent)', background: 'rgba(0,122,255,0.1)' } : {}}>
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !projects?.length ? (
          <EmptyState icon="📁" title="Sin proyectos" description="Crea tu primer proyecto para comenzar a organizar tu trabajo." action={{ label: '+ Nuevo proyecto', onClick: () => setCreateOpen(true) }} />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            <AnimatePresence>
              {projects.map((p: Project, i: number) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ProjectCard project={p} onClick={() => navigate(`/projects/${p.id}`)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((p: Project) => <ProjectRow key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />)}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo proyecto" size="md">
        <div className="p-5 space-y-4">
          {/* Emoji picker */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className="w-8 h-8 rounded-apple flex items-center justify-center text-lg transition-all"
                  style={{ background: form.emoji === e ? 'rgba(0,122,255,0.15)' : 'var(--bg-tertiary)', boxShadow: form.emoji === e ? '0 0 0 2px var(--accent)' : 'none' }}
                >{e}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Nombre *</label>
            <input className="input" placeholder="Nombre del proyecto" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Descripción</label>
            <textarea className="textarea" rows={3} placeholder="Describe el proyecto..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Estado</label>
              <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Prioridad</label>
              <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Responsable</label>
            <select className="select" value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}>
              {(users || []).map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Etiquetas (separadas por coma)</label>
            <input className="input" placeholder="diseño, manufactura, 3D..." value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate} disabled={!form.name.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear proyecto'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const progress = getProjectProgress(project.tasks || []);
  const collaboratorUsers = project.collaborators?.map(c => c.user) ?? [];

  return (
    <button onClick={onClick} className="card text-left w-full group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{project.emoji || '📁'}</span>
          <div>
            <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{project.name}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{formatRelative(project.updatedAt)}</div>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>
      {project.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
      )}
      {/* Tags */}
      {project.tags && (
        <div className="flex flex-wrap gap-1 mb-3">
          {parseTags(project.tags).slice(0, 3).map(t => <TagBadge key={t} tag={t} />)}
        </div>
      )}
      {/* Progress */}
      {(project.tasks?.length ?? 0) > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
            <span>Progreso</span><span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: project.color }} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <AvatarGroup users={[project.owner, ...collaboratorUsers]} max={3} size="xs" />
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {project._count?.tasks != null && <span>📋 {project._count.tasks}</span>}
          {project._count?.files != null && <span>📎 {project._count.files}</span>}
        </div>
      </div>
    </button>
  );
}

function ProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 w-full px-4 py-3 rounded-apple text-left transition-all"
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span className="text-xl">{project.emoji || '📁'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{project.name}</div>
        {project.description && <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{project.description}</div>}
      </div>
      <StatusBadge status={project.status} />
      <PriorityBadge priority={project.priority} />
      <AvatarGroup users={[project.owner]} max={1} size="xs" />
      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{formatRelative(project.updatedAt)}</span>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="surface rounded-apple-lg p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-apple" style={{ background: 'var(--bg-tertiary)' }} />
        <div className="flex-1">
          <div className="h-3 rounded mb-1" style={{ background: 'var(--bg-tertiary)', width: '60%' }} />
          <div className="h-2 rounded" style={{ background: 'var(--bg-tertiary)', width: '40%' }} />
        </div>
      </div>
      <div className="h-2 rounded mb-1.5" style={{ background: 'var(--bg-tertiary)' }} />
      <div className="h-2 rounded" style={{ background: 'var(--bg-tertiary)', width: '75%' }} />
    </div>
  );
}
