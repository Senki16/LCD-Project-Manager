import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Files } from 'lucide-react';
import Header from '@/components/layout/Header';
import { filesApi } from '@/utils/api';
import { getFileIcon, formatFileSize, formatRelative } from '@/utils/helpers';
import EmptyState from '@/components/ui/EmptyState';
import type { FileRecord } from '@/types';

export default function FilesPage() {
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files-all-recent'],
    queryFn: () => filesApi.getRecent(50).then(r => r.data),
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Archivos" subtitle="Todos los archivos de tus proyectos" />
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 rounded-apple animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
            ))}
          </div>
        ) : !files.length ? (
          <EmptyState icon={<Files size={22} />} title="Sin archivos" description="Los archivos subidos a tus proyectos aparecerán aquí." />
        ) : (
          <div className="max-w-3xl mx-auto surface-elevated rounded-apple-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
              Archivos recientes ({files.length})
            </div>
            {files.map((file: FileRecord) => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 border-b group transition-all"
                style={{ borderColor: 'var(--border-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="text-xl flex-shrink-0">{getFileIcon(file.extension)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {(file.project as any)?.name ?? 'Sin proyecto'} · {formatFileSize(file.size)}
                  </div>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{formatRelative(file.createdAt)}</span>
                <a
                  href={filesApi.getDownloadUrl(file.id)}
                  download={file.originalName}
                  className="opacity-0 group-hover:opacity-100 btn-ghost text-xs transition-opacity"
                  onClick={e => e.stopPropagation()}
                >
                  Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
