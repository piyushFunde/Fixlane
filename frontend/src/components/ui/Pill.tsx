import React from 'react';
import { cn } from '../../lib/utils';

export type PillVariant = 'high' | 'medium' | 'low' | 'todo' | 'inProgress' | 'done';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: PillVariant;
  size?: 'sm' | 'md';
}

export const Pill: React.FC<PillProps> = ({ variant, size = 'md', className, children, ...props }) => {
  const styles: Record<PillVariant, { bg: string; text: string; label: string }> = {
    high: { bg: '#FBE4DE', text: '#A52E18', label: 'High' },
    medium: { bg: '#FBEFCF', text: '#7A5000', label: 'Medium' },
    low: { bg: '#E4ECF5', text: '#2F4F78', label: 'Low' },
    todo: { bg: '#E9ECE8', text: '#3D4A44', label: 'To Do' },
    inProgress: { bg: '#FBEFCF', text: '#7A5000', label: 'In Progress' },
    done: { bg: '#E3F1ED', text: '#0B5A4A', label: 'Done' },
  };

  const styleConfig = styles[variant] || styles.medium;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium tracking-tight whitespace-nowrap',
        sizeClasses,
        className
      )}
      style={{
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
      }}
      {...props}
    >
      {children || styleConfig.label}
    </span>
  );
};
