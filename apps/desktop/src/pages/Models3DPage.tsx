import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box } from 'lucide-react';
import { filesApi } from '@/utils/api';
import Header from '@/components/layout/Header';
import ModelViewer from '@/components/viewer3d/ModelViewer';
import EmptyState from '@/components/ui/EmptyState';
import { formatFileSize, formatRelative } from '@/utils/helpers';
import type { FileRecord } from '@/types';

export default function Models3DPage() {
  const [selected, setSelected] = useState<FileRecord | null>(null);

  const { data: allFiles = [] } = useQuery({
    queryKey: ['files-3d'],
    queryFn: () => filesApi.getRecent(100).then(r => r.data),
  });

  const models = (allFiles as FileRecord[]).filter(f => ['stl', 'obj', 'glb', 'gltf'].includes(f.extension.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Modelos 3D" subtitle={`${models.length} modelos`} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 border-r flex flex-col overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          {!models.length ? (
            <div className="flex-1 flex items-center justify-center p-4 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Sin modelos 3D. Sube archivos STL, OBJ, GLB o GLTF a tus proyectos.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {models.map(m => (
                <button key={m.id} onClick={() => setSelected(m)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-apple text-left transition-all"
                  style={{ background: selected?.id === m.id ? 'rgba(0,122,255,0.1)' : 'transparent', color: selected?.id === m.id ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  <span className="text-lg flex-shrink-0">🧊</span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: selected?.id === m.id ? 'var(--accent)' : 'var(--text-primary)' }}>{m.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {m.extension.toUpperCase()} · {formatFileSize(m.size)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-hidden">
          {selected ? (
            <ModelViewer fileId={selected.id} extension={selected.extension} fileName={selected.name} />
          ) : (
            <EmptyState icon={<Box size={28} />} title="Selecciona un modelo" description="Elige un modelo 3D de la lista para visualizarlo." />
          )}
        </div>
      </div>
    </div>
  );
}
