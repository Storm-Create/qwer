/**
 * Business Empire: Ultimate
 * UI System - Toast Notification Engine & Context
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'event';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  timestamp: number;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showEvent: (title: string, description?: string) => void;
  removeToast: (id: string) => void;
  history: ToastMessage[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [history, setHistory] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const newToast: ToastMessage = {
        ...toast,
        id,
        timestamp: Date.now(),
        duration: toast.duration || 3500,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
      setHistory((prev) => [newToast, ...prev.slice(0, 49)]);

      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, description?: string) => showToast({ type: 'success', title, description }),
    [showToast]
  );
  const showError = useCallback(
    (title: string, description?: string) => showToast({ type: 'error', title, description }),
    [showToast]
  );
  const showWarning = useCallback(
    (title: string, description?: string) => showToast({ type: 'warning', title, description }),
    [showToast]
  );
  const showInfo = useCallback(
    (title: string, description?: string) => showToast({ type: 'info', title, description }),
    [showToast]
  );
  const showEvent = useCallback(
    (title: string, description?: string) => showToast({ type: 'event', title, description }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showEvent,
        removeToast,
        history,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-hub"
      className="fixed top-16 right-3 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-24px)] pointer-events-none"
    >
      {toasts.map((toast) => {
        const typeStyles = {
          success: {
            bg: 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10',
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
            accent: 'bg-emerald-500',
          },
          error: {
            bg: 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10',
            icon: XCircle,
            iconColor: 'text-rose-400',
            accent: 'bg-rose-500',
          },
          warning: {
            bg: 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-500/10',
            icon: AlertTriangle,
            iconColor: 'text-amber-400',
            accent: 'bg-amber-500',
          },
          info: {
            bg: 'bg-slate-900/95 border-cyan-500/40 text-cyan-300 shadow-cyan-500/10',
            icon: Info,
            iconColor: 'text-cyan-400',
            accent: 'bg-cyan-500',
          },
          event: {
            bg: 'bg-slate-900/95 border-purple-500/40 text-purple-300 shadow-purple-500/10',
            icon: Sparkles,
            iconColor: 'text-purple-400',
            accent: 'bg-purple-500',
          },
        }[toast.type];

        const Icon = typeStyles.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${typeStyles.bg}`}
          >
            <div className={`p-1.5 rounded-xl bg-slate-950/80 ${typeStyles.iconColor} flex-shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-100 leading-snug">{toast.title}</div>
              {toast.description && (
                <div className="text-[11px] text-slate-400 mt-0.5 leading-normal break-words">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800/60 transition-colors flex-shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
