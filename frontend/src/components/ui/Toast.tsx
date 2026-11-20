import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalAddToast: ((message: string, type?: ToastType) => void) | null = null;

export function notify(message: string, type: ToastType = 'info') {
  if (globalAddToast) {
    globalAddToast(message, type);
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  React.useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              'pointer-events-auto flex items-center justify-between p-3.5 rounded-card shadow-lg text-sm font-medium border animate-fade-up',
              toast.type === 'success' && 'bg-primary-tint border-primary/40 text-primary-ink',
              toast.type === 'error' && 'bg-danger-tint border-danger/40 text-danger',
              toast.type === 'info' && 'bg-surface border-border text-ink'
            )}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && (
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-current opacity-70 hover:opacity-100 p-1"
              aria-label="Dismiss toast"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: notify,
      removeToast: () => {},
      success: (msg: string) => notify(msg, 'success'),
      error: (msg: string) => notify(msg, 'error'),
      info: (msg: string) => notify(msg, 'info'),
    };
  }
  return {
    ...context,
    success: (msg: string) => context.addToast(msg, 'success'),
    error: (msg: string) => context.addToast(msg, 'error'),
    info: (msg: string) => context.addToast(msg, 'info'),
  };
};
