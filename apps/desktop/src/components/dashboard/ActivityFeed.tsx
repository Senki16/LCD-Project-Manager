import Avatar from '@/components/ui/Avatar';
import { formatRelative } from '@/utils/helpers';
import type { Activity } from '@/types';

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-tertiary)' }}>
        Sin actividad registrada
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full p-6">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
          <div className="space-y-4">
            {activities.map((a: Activity) => (
              <div key={a.id} className="flex gap-4 relative">
                <div className="flex-shrink-0 relative z-10">
                  <Avatar user={a.user} size="sm" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.user.name}</span>
                    {' '}{a.description}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {formatRelative(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
