import { Search, Bell, Plus } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  const { setSearchOpen } = useUIStore();

  return (
    <header
      className="flex items-center justify-between h-14 px-6 border-b flex-shrink-0"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', fontFamily: '-apple-system, SF Pro Display, Inter, sans-serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-apple text-sm transition-all duration-150"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          <Search size={14} />
          <span>Buscar</span>
          <kbd
            className="px-1.5 py-0.5 rounded text-xs ml-1"
            style={{ background: 'var(--border)', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="w-8 h-8 rounded-apple flex items-center justify-center transition-all duration-150 relative"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).closest('button')!.style.background = 'var(--bg-tertiary)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).closest('button')!.style.background = 'transparent')}
        >
          <Bell size={16} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: 'var(--danger)' }}
          />
        </button>

        {/* Primary action */}
        {action && (
          <button onClick={action.onClick} className="btn-primary">
            <Plus size={14} />
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}
