import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, Monitor, User as UserIcon, Database, Shield } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { usersApi } from '@/utils/api';
import Header from '@/components/layout/Header';
import { getInitials } from '@/utils/helpers';
import type { User } from '@/types';

const THEMES = [
  { value: 'light', icon: Sun, label: 'Claro' },
  { value: 'dark', icon: Moon, label: 'Oscuro' },
  { value: 'system', icon: Monitor, label: 'Sistema' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme, currentUser, setCurrentUser } = useAppStore();
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Configuración" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Appearance */}
          <SettingsSection title="Apariencia" icon={<Sun size={16} />}>
            <div>
              <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>Tema</label>
              <div className="flex gap-2">
                {THEMES.map(({ value, icon: Icon, label }) => (
                  <button key={value} onClick={() => setTheme(value)}
                    className="flex flex-col items-center gap-2 px-5 py-3 rounded-apple-lg transition-all text-sm"
                    style={{
                      background: theme === value ? 'rgba(0,122,255,0.1)' : 'var(--bg-tertiary)',
                      border: `1.5px solid ${theme === value ? 'var(--accent)' : 'transparent'}`,
                      color: theme === value ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </SettingsSection>

          {/* Active user */}
          <SettingsSection title="Usuario activo" icon={<UserIcon size={16} />}>
            <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Selecciona quién está usando la aplicación ahora mismo
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(users as User[]).map(u => (
                <button key={u.id} onClick={() => setCurrentUser(u)}
                  className="flex items-center gap-3 px-4 py-3 rounded-apple-lg text-left transition-all"
                  style={{
                    background: currentUser?.id === u.id ? `${u.color}12` : 'var(--bg-secondary)',
                    border: `1.5px solid ${currentUser?.id === u.id ? u.color + '50' : 'transparent'}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: u.color }}>
                    {getInitials(u.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{u.email}</div>
                  </div>
                  {currentUser?.id === u.id && (
                    <div className="ml-auto w-2 h-2 rounded-full" style={{ background: u.color }} />
                  )}
                </button>
              ))}
            </div>
          </SettingsSection>

          {/* Database */}
          <SettingsSection title="Base de datos" icon={<Database size={16} />}>
            <div className="space-y-3">
              <InfoRow label="Motor" value="SQLite (local)" />
              <InfoRow label="Versión" value="v1.0.0" />
              <InfoRow label="Estado" value={<span className="text-green-500 font-medium">Conectado</span>} />
            </div>
          </SettingsSection>

          {/* About */}
          <SettingsSection title="Acerca de" icon={<Shield size={16} />}>
            <div className="space-y-3">
              <InfoRow label="Aplicación" value="LCD Projects Hub" />
              <InfoRow label="Versión" value="1.0.0" />
              <InfoRow label="Tecnología" value="Tauri + React + NestJS" />
              <InfoRow label="Usuarios" value="David Zuluaga · Claudia Henao · Luis Zuluaga" />
            </div>
          </SettingsSection>

        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="surface-elevated rounded-apple-lg overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        {icon}
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
