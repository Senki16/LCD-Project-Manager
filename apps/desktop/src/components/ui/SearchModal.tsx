import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderKanban, CheckSquare, File, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '@/stores/uiStore';
import { searchApi } from '@/utils/api';
import { getFileIcon } from '@/utils/helpers';

export default function SearchModal() {
  const { searchOpen, searchQuery, setSearchOpen, setSearchQuery } = useUIStore();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery).then((r) => r.data),
    enabled: debouncedQuery.length >= 2,
  });

  const hasResults = data && (data.projects.length + data.tasks.length + data.files.length > 0);

  const handleClose = () => { setSearchOpen(false); setSearchQuery(''); };

  const go = (path: string) => { navigate(path); handleClose(); };

  if (!searchOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-xl rounded-apple-xl overflow-hidden"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <Search size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              className="flex-1 text-base outline-none"
              style={{ background: 'transparent', color: 'var(--text-primary)' }}
              placeholder="Buscar proyectos, tareas, archivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                <X size={14} />
              </button>
            )}
            <kbd
              className="px-2 py-0.5 rounded text-xs flex-shrink-0"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {!searchQuery && (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Escribe para buscar en proyectos, tareas y archivos
              </div>
            )}

            {searchQuery.length >= 2 && !hasResults && (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Sin resultados para "<strong style={{ color: 'var(--text-secondary)' }}>{searchQuery}</strong>"
              </div>
            )}

            {hasResults && (
              <div className="py-2">
                {data.projects.length > 0 && (
                  <ResultSection title="Proyectos">
                    {data.projects.map((p) => (
                      <ResultItem key={p.id} icon={p.emoji || '📁'} title={p.name} subtitle={p.description} onClick={() => go(`/projects/${p.id}`)} />
                    ))}
                  </ResultSection>
                )}
                {data.tasks.length > 0 && (
                  <ResultSection title="Tareas">
                    {data.tasks.map((t) => (
                      <ResultItem key={t.id} icon={<CheckSquare size={14} />} title={t.title} subtitle={t.project?.name} onClick={() => go(`/projects/${t.projectId}`)} />
                    ))}
                  </ResultSection>
                )}
                {data.files.length > 0 && (
                  <ResultSection title="Archivos">
                    {data.files.map((f) => (
                      <ResultItem key={f.id} icon={getFileIcon(f.extension)} title={f.name} subtitle={f.project?.name} onClick={() => go(`/projects/${f.projectId}`)} />
                    ))}
                  </ResultSection>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{title}</div>
      {children}
    </div>
  );
}

function ResultItem({ icon, title, subtitle, onClick }: { icon: any; title: string; subtitle?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors"
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
    >
      <span className="text-base flex-shrink-0">{typeof icon === 'string' ? icon : icon}</span>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</div>}
      </div>
    </button>
  );
}
