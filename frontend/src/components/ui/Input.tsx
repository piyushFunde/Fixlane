import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-h-[48px] px-3.5 py-2.5 bg-surface text-ink text-base rounded-input border border-input-border transition-colors duration-150 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary disabled:bg-bg disabled:cursor-not-allowed',
            error && 'border-danger focus:ring-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs font-medium text-danger">{error}</span>}
        {!error && helperText && <span className="text-xs text-muted">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
