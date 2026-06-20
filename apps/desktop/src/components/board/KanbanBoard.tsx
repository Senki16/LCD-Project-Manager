import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
  DragOverlay, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Calendar, GripVertical, Paperclip, MessageSquare } from 'lucide-react';
import { tasksApi } from '@/utils/api';
import { AvatarGroup } from '@/components/ui/Avatar';
import { PriorityBadge } from '@/components/ui/Badge';
import TaskForm from './TaskForm';
import type { Task, TaskColumn, Project } from '@/types';
import { COLUMN_LABELS, COLUMN_COLORS, PRIORITY_COLORS } from '@/types';
import { formatDate, parseTags } from '@/utils/helpers';

const COLUMNS: TaskColumn[] = ['PENDING', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'COMPLETED'];

interface KanbanBoardProps {
  tasks: Task[];
  project: Project;
  projectId: string;
}

export default function KanbanBoard({ tasks, project, projectId }: KanbanBoardProps) {
  const qc = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [createColumn, setCreateColumn] = useState<TaskColumn | null>(null);

  // Sync external tasks changes
  if (JSON.stringify(tasks.map(t => t.id + t.column + t.position)) !== JSON.stringify(localTasks.map(t => t.id + t.column + t.position))) {
    setLocalTasks(tasks);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const moveMutation = useMutation({
    mutationFn: ({ id, column, position }: { id: string; column: string; position: number }) =>
      tasksApi.move(id, { column, position }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(localTasks.find(t => t.id === active.id) ?? null);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeTask = localTasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    const overTask = localTasks.find(t => t.id === overId);
    const targetColumn = (COLUMNS.includes(overId as TaskColumn) ? overId : overTask?.column) as TaskColumn;

    if (!targetColumn || activeTask.column === targetColumn) return;

    setLocalTasks(prev =>
      prev.map(t => t.id === activeTask.id ? { ...t, column: targetColumn, status: targetColumn } : t)
    );
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const task = localTasks.find(t => t.id === active.id);
    if (!task) return;

    const columnTasks = localTasks.filter(t => t.column === task.column);
    const position = columnTasks.findIndex(t => t.id === task.id);

    moveMutation.mutate({ id: task.id, column: task.column, position });
  };

  return (
    <div className="h-full overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="flex gap-3 h-full p-4 min-w-max">
          {COLUMNS.map(column => {
            const colTasks = localTasks.filter(t => t.column === column);
            return (
              <KanbanColumn
                key={column}
                column={column}
                tasks={colTasks}
                project={project}
                onAddTask={() => setCreateColumn(column)}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} project={project} isDragging />}
        </DragOverlay>
      </DndContext>

      <TaskForm
        open={!!createColumn}
        onClose={() => setCreateColumn(null)}
        projectId={projectId}
        defaultColumn={createColumn ?? 'PENDING'}
        project={project}
        onCreated={() => { qc.invalidateQueries({ queryKey: ['project', projectId] }); setCreateColumn(null); }}
      />
    </div>
  );
}

function KanbanColumn({ column, tasks, project, onAddTask }: { column: TaskColumn; tasks: Task[]; project: Project; onAddTask: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: column });
  const color = COLUMN_COLORS[column];

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{COLUMN_LABELS[column]}</span>
          <span
            className="px-1.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${color}18`, color }}
          >
            {tasks.length}
          </span>
        </div>
        <button onClick={onAddTask} className="btn-ghost p-1" title="Agregar tarea">
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 rounded-apple-lg p-2 space-y-2 transition-all min-h-[200px]"
        style={{
          background: isOver ? `${color}08` : 'var(--bg-secondary)',
          border: `1px solid ${isOver ? color : 'var(--border-subtle)'}`,
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map(task => (
              <SortableTask key={task.id} task={task} project={project} />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Arrastra tareas aquí
          </div>
        )}
      </div>
    </div>
  );
}

function SortableTask({ task, project }: { task: Task; project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      <TaskCard task={task} project={project} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function TaskCard({ task, project, dragHandleProps, isDragging }: { task: Task; project: Project; dragHandleProps?: any; isDragging?: boolean }) {
  const priorityColor = PRIORITY_COLORS[task.priority];
  const checkedCount = task.checklists?.filter(c => c.completed).length ?? 0;
  const totalCount = task.checklists?.length ?? 0;
  const tags = parseTags(task.tags);
  const assigneeUsers = task.assignees?.map(a => a.user) ?? [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group rounded-apple overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: isDragging ? 'rotate(2deg)' : 'none',
      }}
    >
      {/* Priority stripe */}
      <div className="h-0.5" style={{ background: priorityColor }} />

      <div className="p-3">
        {/* Drag handle + title */}
        <div className="flex items-start gap-1.5">
          {dragHandleProps && (
            <div {...dragHandleProps} className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              <GripVertical size={12} />
            </div>
          )}
          <p className="text-sm font-medium leading-snug flex-1" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Checklist progress */}
        {totalCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full rounded-full" style={{ width: `${(checkedCount / totalCount) * 100}%`, background: 'var(--success)' }} />
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{checkedCount}/{totalCount}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {assigneeUsers.length > 0 && <AvatarGroup users={assigneeUsers} max={3} size="xs" />}
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            {(task._count?.comments ?? 0) > 0 && (
              <span className="flex items-center gap-0.5"><MessageSquare size={10} />{task._count.comments}</span>
            )}
            {(task._count?.attachments ?? 0) > 0 && (
              <span className="flex items-center gap-0.5"><Paperclip size={10} />{task._count.attachments}</span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-0.5" style={{ color: new Date(task.dueDate) < new Date() ? 'var(--danger)' : 'inherit' }}>
                <Calendar size={10} />{formatDate(task.dueDate, 'dd MMM')}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
