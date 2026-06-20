import { cn } from '@/utils/helpers';
import type { Priority, ProjectStatus, TaskColumn } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, COLUMN_LABELS, COLUMN_COLORS } from '@/types';

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="badge"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color = PRIORITY_COLORS[priority];
  return (
    <span
      className="badge"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function ColumnBadge({ column }: { column: TaskColumn }) {
  const color = COLUMN_COLORS[column];
  return (
    <span
      className="badge"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {COLUMN_LABELS[column]}
    </span>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
      {tag}
    </span>
  );
}

export function CountBadge({ count, color = 'var(--accent)' }: { count: number; color?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
      style={{ background: color }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
