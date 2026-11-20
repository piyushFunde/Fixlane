import React from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface ConfirmBannerProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ConfirmBanner: React.FC<ConfirmBannerProps> = ({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'w-full bg-danger-tint border border-danger/30 rounded-input p-3.5 flex flex-wrap items-center justify-between gap-3 text-ink animate-fade-up',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-danger shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <span className="text-sm font-medium text-danger">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
};
