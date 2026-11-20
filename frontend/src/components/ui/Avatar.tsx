import React from 'react';
import { cn, getAvatarTint, getInitials } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, userId = '0', size = 'md', className, ...props }) => {
  const { bg, text } = getAvatarTint(userId || '0');
  const initials = getInitials(name || 'User');

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs font-semibold',
    md: 'w-8 h-8 text-xs font-semibold',
    lg: 'w-10 h-10 text-sm font-bold',
  };

  return (
    <div
      title={name}
      aria-label={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full select-none shrink-0 transition-transform hover:scale-105',
        sizeStyles[size],
        className
      )}
      style={{
        backgroundColor: bg,
        color: text,
      }}
      {...props}
    >
      <span>{initials}</span>
    </div>
  );
};
