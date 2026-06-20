import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FolderPlus, Download, Trash2, Eye, FolderOpen,
  ChevronRight, Grid, List, X,
} from 'lucide-react';
import { filesApi } from '@/utils/api';
import { formatFileSize, formatRelative, getFileIcon, is3DFile } from '@/utils/helpers';
import Modal from '@/components/ui/Modal';
import ModelViewer from '@/components/viewer3d/ModelViewer';
import EmptyState from '@/components/ui/EmptyState';
import type { FileRecord, Folder } from '@/types';

interface FileManagerProps {
  projectId: string;
}

export default function FileManager({ projectId }: FileManagerProps) {
  const qc = useQueryClient();
  const [folderId, setFolderId] = useState<string | undefined>();
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string }>>([]);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { data: files = [] } = useQuery({
    queryKey: ['files', projectId, folderId],
    queryFn: () => filesApi.getByProject(projectId, folderId).then(r => r.data),
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders', projectId, folderId],
    queryFn: () => filesApi.getFolders(projectId, folderId).then(r => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => filesApi.upload(projectId, file, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files', projectId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files', projectId] }),
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => filesApi.createFolder(projectId, { name, parentId: folderId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['folders', projectId] }); setNewFolderOpen(false); setNewFolderName(''); },
  });

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(f => uploadMutation.mutate(f));
  };

  const navigateFolder = (folder: Folder) => {
    setBreadcrumb(b => [...b, { id: folder.id, name: folder.name }]);
    setFolderId(folder.id);
  };

  const navigateBreadcrumb = (idx: number) => {
    if (idx === -1) { setBreadcrumb([]); setFolderId(undefined); return; }
    setBreadcrumb(b => b.slice(0, idx + 1));
    setFolderId(breadcrumb[idx].id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <button onClick={() => navigateBreadcrumb(-1)} className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>
            Archivos
          </button>
          {breadcrumb.map((b, i) => (
            <div key={b.id} className="flex items-center gap-1">
              <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
              <button onClick={() => navigateBreadcrumb(i)} className="text-xs hover:underline truncate" style={{ color: i === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--accent)' }}>
                {b.name}
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} className="btn-ghost p-1.5">
            {view === 'grid' ? <List size={15} /> : <Grid size={15} />}
          </button>
          <button onClick={() => setNewFolderOpen(true)} className="btn-ghost p-1.5" title="Nueva carpeta">
            <FolderPlus size={15} />
          </button>
          <button onClick={() => inputRef.current?.click()} className="btn-primary text-xs">
            <Upload size={13} /> Subir archivos
          </button>
        </div>

        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        className="flex-1 overflow-y-auto p-3 relative"
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{ border: dragOver ? '2px dashed var(--accent)' : '2px dashed transparent', borderRadius: 'var(--radius)', transition: 'border 150ms' }}
      >
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center z-10 rounded-apple" style={{ background: 'rgba(0,122,255,0.08)' }}>
            <div className="text-base font-semibold" style={{ color: 'var(--accent)' }}>Suelta los archivos aquí</div>
          </div>
        )}

        {folders.length === 0 && files.length === 0 ? (
          <EmptyState icon={<Upload size={22} />} title="Sin archivos" description="Sube archivos arrastrándolos aquí o usando el botón." />
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-4 gap-2' : 'space-y-1'}>
            {/* Folders */}
            {folders.map((folder: Folder) => (
              <button key={folder.id} onDoubleClick={() => navigateFolder(folder)}
                className={view === 'grid' ? 'flex flex-col items-center p-3 rounded-apple-lg text-center transition-all hover:opacity-80' : 'flex items-center gap-3 w-full px-3 py-2 rounded-apple transition-all text-left'}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className={view === 'grid' ? 'text-4xl mb-2' : 'text-xl flex-shrink-0'}>📂</span>
                <div className={view === 'grid' ? '' : 'flex-1 min-w-0'}>
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{folder.name}</div>
                  {folder._count && <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{folder._count.files} archivos</div>}
                </div>
              </button>
            ))}

            {/* Files */}
            {files.map((file: FileRecord) => (
              <FileItem key={file.id} file={file} view={view} onPreview={setPreviewFile} onDelete={() => deleteMutation.mutate(file.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      <Modal open={!!previewFile} onClose={() => setPreviewFile(null)} size="xl" title={previewFile?.name}>
        {previewFile && (
          <div style={{ height: 500 }}>
            {is3DFile(previewFile.extension) ? (
              <ModelViewer fileId={previewFile.id} extension={previewFile.extension} fileName={previewFile.name} />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{getFileIcon(previewFile.extension)}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{previewFile.name}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{formatFileSize(previewFile.size)}</div>
                  <a href={filesApi.getDownloadUrl(previewFile.id)} download={previewFile.originalName} className="btn-primary mt-4 inline-flex">
                    <Download size={14} /> Descargar
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New folder modal */}
      <Modal open={newFolderOpen} onClose={() => setNewFolderOpen(false)} title="Nueva carpeta" size="sm">
        <div className="p-4 space-y-3">
          <input className="input" placeholder="Nombre de la carpeta" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && createFolderMutation.mutate(newFolderName)} />
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setNewFolderOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={() => createFolderMutation.mutate(newFolderName)} disabled={!newFolderName.trim()}>Crear</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FileItem({ file, view, onPreview, onDelete }: { file: FileRecord; view: 'grid' | 'list'; onPreview: (f: FileRecord) => void; onDelete: () => void }) {
  const icon = getFileIcon(file.extension);

  if (view === 'grid') {
    return (
      <div className="flex flex-col items-center p-3 rounded-apple-lg text-center group relative transition-all"
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span className="text-4xl mb-2">{icon}</span>
        <div className="text-xs font-medium truncate w-full" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{formatFileSize(file.size)}</div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
          <button onClick={() => onPreview(file)} className="w-6 h-6 rounded flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}><Eye size={11} /></button>
          <button onClick={onDelete} className="w-6 h-6 rounded flex items-center justify-center text-white" style={{ background: 'var(--danger)' }}><Trash2 size={11} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-apple group transition-all"
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatFileSize(file.size)} · {formatRelative(file.createdAt)}</div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0 transition-opacity">
        <button onClick={() => onPreview(file)} className="btn-ghost p-1.5"><Eye size={13} /></button>
        <a href={filesApi.getDownloadUrl(file.id)} download={file.originalName} className="btn-ghost p-1.5"><Download size={13} /></a>
        <button onClick={onDelete} className="btn-ghost p-1.5" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
      </div>
    </div>
  );
}
