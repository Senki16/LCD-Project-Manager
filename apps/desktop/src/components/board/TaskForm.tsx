import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { tasksApi } from '@/utils/api';
import Modal from '@/components/ui/Modal';
import type { TaskColumn, Priority, Project } from '@/types';
import { COLUMN_LABELS, PRIORITY_LABELS } from '@/types';

const COLUMNS: TaskColumn[] = ['PENDING', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'COMPLETED'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultColumn?: TaskColumn;
  project: Project;
  onCreated: () => void;
}

export default function TaskForm({ open, onClose, projectId, defaultColumn = 'PENDING', project, onCreated }: TaskFormProps) {
  const [form, setForm] = useState({ title: '', description: '', column: defaultColumn, priority: 'MEDIUM' as Priority, dueDate: '', assigneeIds: [] as string[] });

  const mutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(projectId, data),
    onSuccess: () => { onCreated(); setForm({ title: '', description: '', column: defaultColumn, priority: 'MEDIUM', dueDate: '', assigneeIds: [] }); },
  });

  const members = [project.owner, ...project.collaborators.map(c => c.user)];

  const toggleAssignee = (id: string) => {
    setForm(f => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id) ? f.assigneeIds.filter(x => x !== id) : [...f.assigneeIds, id],
    }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva tarea" size="md">
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Título *</label>
          <input className="input" placeholder="Título de la tarea" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Descripción</label>
          <textarea className="textarea" rows={3} placeholder="Describe la tarea..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Columna</label>
            <select className="select" value={form.column} onChange={e => setForm(f => ({ ...f, column: e.target.value as TaskColumn }))}>
              {COLUMNS.map(c => <option key={c} value={c}>{COLUMN_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Prioridad</label>
            <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Fecha límite</label>
          <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Responsables</label>
          <div className="flex flex-wrap gap-2">
            {members.map(u => (
              <button key={u.id} onClick={() => toggleAssignee(u.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-apple text-xs transition-all"
                style={{
                  background: form.assigneeIds.includes(u.id) ? `${u.color}18` : 'var(--bg-tertiary)',
                  color: form.assigneeIds.includes(u.id) ? u.color : 'var(--text-secondary)',
                  border: `1px solid ${form.assigneeIds.includes(u.id) ? u.color + '40' : 'transparent'}`,
                }}
              >
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: u.color }}>
                  {u.name[0]}
                </div>
                {u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={!form.title.trim() || mutation.isPending}>
            {mutation.isPending ? 'Creando...' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
