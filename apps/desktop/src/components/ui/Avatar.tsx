import { cn, getInitials } from '@/utils/helpers';
import type { User } from '@/types';

interface AvatarProps {
  user: Pick<User, 'name' | 'color' | 'avatar'>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { xs: 'w-5 h-5 text-[9px]', sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };

export default function Avatar({ user, size = 'md', className }: AvatarProps) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    );
  }
  return (
    <div
      className={cn('rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0', sizes[size], className)}
      style={{ background: user.color }}
      title={user.name}
    >
      {getInitials(user.name)}
    </div>
  );
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: { users: Array<Pick<User, 'name' | 'color' | 'avatar'>>; max?: number; size?: AvatarProps['size'] }) {
  const shown = users.slice(0, max);
  const rest = users.length - max;
  const sizeClass = sizes[size];

  return (
    <div className="flex -space-x-1.5">
      {shown.map((u, i) => (
        <div key={i} className="ring-2 ring-white dark:ring-[#1C1C1E] rounded-full">
          <Avatar user={u} size={size} />
        </div>
      ))}
      {rest > 0 && (
        <div
          className={cn('rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-[#1C1C1E]', sizeClass)}
          style={{ background: '#8E8E93', fontSize: '9px' }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
