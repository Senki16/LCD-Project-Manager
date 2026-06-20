import { cn } from '@/utils/helpers';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      {icon && (
        <div
          className="w-14 h-14 rounded-apple-lg flex items-center justify-center mb-4 text-2xl"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
        >
          {icon}
        </div>
      )}
      <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-5">
          {action.label}
        </button>
      )}
    </div>
  );
}
