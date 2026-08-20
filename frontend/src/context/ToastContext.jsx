import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => {
          let bg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
          let icon = <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0" />;

          if (t.type === 'success') {
            bg = 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100';
            icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
          } else if (t.type === 'error') {
            bg = 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-100';
            icon = <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />;
          } else if (t.type === 'warning') {
            bg = 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-100';
            icon = <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${bg}`}
            >
              <div className="flex items-start gap-2.5">
                {icon}
                <p className="text-xs sm:text-sm font-medium leading-snug pt-0.5">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

export default ToastContext;
