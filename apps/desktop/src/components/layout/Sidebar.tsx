import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Calendar, Files,
  Box, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getInitials } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/projects', icon: FolderKanban, label: 'Proyectos' },
  { to: '/calendar', icon: Calendar, label: 'Calendario' },
  { to: '/files', icon: Files, label: 'Archivos' },
  { to: '/models', icon: Box, label: 'Modelos 3D' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentUser } = useAppStore();
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-full overflow-hidden border-r flex-shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
        >
          L
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="ml-2.5 overflow-hidden"
            >
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                LCD Projects
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                Hub
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'sidebar-item',
                active && 'active',
                sidebarCollapsed && 'justify-center px-0'
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        <NavLink
          to="/settings"
          className={cn(
            'sidebar-item',
            location.pathname === '/settings' && 'active',
            sidebarCollapsed && 'justify-center px-0'
          )}
          title={sidebarCollapsed ? 'Configuración' : undefined}
        >
          <Settings size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Configuración
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Current user */}
        {currentUser && (
          <div className={cn('flex items-center gap-2 px-2 py-1.5 rounded-apple', sidebarCollapsed && 'justify-center px-0')}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: currentUser.color }}
            >
              {getInitials(currentUser.name)}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden min-w-0"
                >
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {currentUser.name.split(' ')[0]}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn('sidebar-item w-full', sidebarCollapsed && 'justify-center px-0')}
          title={sidebarCollapsed ? 'Expandir' : 'Contraer'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xs overflow-hidden whitespace-nowrap"
              >
                Contraer
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
