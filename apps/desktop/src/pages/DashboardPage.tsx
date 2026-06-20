import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FolderKanban, CheckSquare, TrendingUp, Clock,
  ArrowRight, Upload, MessageSquare, Activity
} from 'lucide-react';
import { projectsApi, filesApi } from '@/utils/api';
import { useAppStore } from '@/stores/appStore';
import Header from '@/components/layout/Header';
import { StatusBadge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { formatRelative, formatDate, getProjectProgress, getFileIcon, formatFileSize } from '@/utils/helpers';
import type { Project, Activity as ActivityType } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => projectsApi.getStats().then(r => r.data) });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.getAll().then(r => r.data) });
  const { data: recentFiles } = useQuery({ queryKey: ['files-recent'], queryFn: () => filesApi.getRecent(6).then(r => r.data) });

  const recentProjects = projects?.slice(0, 4) ?? [];
  const upcomingTasks = projects?.flatMap(p =>
    (p.tasks || []).filter(t => t.dueDate && t.status !== 'COMPLETED')
  ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()).slice(0, 5) ?? [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Inicio" subtitle={`${greeting()}, ${currentUser?.name?.split(' ')[0] ?? ''}`} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Stats row */}
          <motion.div {...fade} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-4">
            {[
              { label: 'Proyectos totales', value: stats?.totalProjects ?? 0, icon: FolderKanban, color: '#007AFF' },
              { label: 'Proyectos activos', value: stats?.activeProjects ?? 0, icon: TrendingUp, color: '#34C759' },
              { label: 'Proyectos completados', value: stats?.completedProjects ?? 0, icon: CheckSquare, color: '#AF52DE' },
              { label: 'Tareas pendientes', value: stats?.pendingTasks ?? 0, icon: Clock, color: '#FF9500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="surface-elevated p-4 rounded-apple-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-apple flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>
                  {value}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-5 gap-4">
            {/* Recent projects */}
            <motion.div {...fade} transition={{ delay: 0.1 }} className="col-span-3 surface-elevated rounded-apple-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Proyectos recientes</h2>
                <button
                  onClick={() => navigate('/projects')}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Ver todos <ArrowRight size={12} />
                </button>
              </div>
              <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--border-subtle)' } as any}>
                {recentProjects.map((project: Project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:opacity-80"
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="w-9 h-9 rounded-apple flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${project.color}18` }}
                    >
                      {project.emoji || '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{project.name}</span>
                        <StatusBadge status={project.status} />
                      </div>
                      {/* Progress bar */}
                      {project.tasks && project.tasks.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${getProjectProgress(project.tasks)}%`, background: project.color }}
                            />
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                            {getProjectProgress(project.tasks)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {recentProjects.length === 0 && (
                  <div className="py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    No hay proyectos aún
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity feed */}
            <motion.div {...fade} transition={{ delay: 0.15 }} className="col-span-2 surface-elevated rounded-apple-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <Activity size={14} style={{ color: 'var(--text-tertiary)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Actividad reciente</h2>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
                {(stats?.recentActivity ?? []).map((a: ActivityType) => (
                  <div key={a.id} className="flex gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <Avatar user={a.user} size="xs" className="mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.user.name.split(' ')[0]}</span>
                        {' '}{a.description}
                        {a.project && (
                          <span style={{ color: 'var(--accent)' }}> · {a.project.emoji} {a.project.name}</span>
                        )}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{formatRelative(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {!(stats?.recentActivity?.length) && (
                  <div className="py-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin actividad reciente</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Recent files */}
            <motion.div {...fade} transition={{ delay: 0.2 }} className="surface-elevated rounded-apple-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Archivos recientes</h2>
                <button onClick={() => navigate('/files')} className="text-xs flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                  Ver todos <ArrowRight size={12} />
                </button>
              </div>
              <div>
                {(recentFiles ?? []).map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="text-xl flex-shrink-0">{getFileIcon(f.extension)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {f.project?.name} · {formatFileSize(f.size)}
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                      {formatRelative(f.createdAt)}
                    </span>
                  </div>
                ))}
                {!(recentFiles?.length) && (
                  <div className="py-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin archivos recientes</div>
                )}
              </div>
            </motion.div>

            {/* Upcoming tasks */}
            <motion.div {...fade} transition={{ delay: 0.25 }} className="surface-elevated rounded-apple-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Próximas fechas límite</h2>
                <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <div>
                {upcomingTasks.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{t.title}</div>
                    </div>
                    <span
                      className="text-xs flex-shrink-0 ml-2 font-medium"
                      style={{ color: new Date(t.dueDate) < new Date() ? 'var(--danger)' : 'var(--text-tertiary)' }}
                    >
                      {formatDate(t.dueDate, 'dd MMM')}
                    </span>
                  </div>
                ))}
                {!upcomingTasks.length && (
                  <div className="py-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin fechas próximas</div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
