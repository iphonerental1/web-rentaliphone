/**
 * NOTIFICATION CONTEXT — Toast notification global.
 * Menggantikan pemakaian `alert()` untuk feedback yang lebih baik (PRD 11 tips UI).
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const NotificationContext = createContext(null);

const TONE_STYLES = {
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', Icon: CheckCircle2, iconColor: 'text-emerald-600' },
  error: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', Icon: XCircle, iconColor: 'text-rose-600' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', Icon: AlertTriangle, iconColor: 'text-amber-600' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', Icon: Info, iconColor: 'text-blue-600' },
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, tone = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, tone }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      notify,
      success: (msg, d) => notify(msg, 'success', d),
      error: (msg, d) => notify(msg, 'error', d),
      warning: (msg, d) => notify(msg, 'warning', d),
      info: (msg, d) => notify(msg, 'info', d),
      dismiss,
    }),
    [notify, dismiss]
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[min(92vw,380px)]">
        {toasts.map((toast) => {
          const style = TONE_STYLES[toast.tone] || TONE_STYLES.info;
          const { Icon } = style;
          return (
            <div
              key={toast.id}
              role="status"
              className={`${style.bg} ${style.border} ${style.text} border rounded-2xl shadow-lg p-4 flex items-start gap-3 animate-[slideIn_0.2s_ease-out]`}
            >
              <Icon size={20} className={`${style.iconColor} shrink-0 mt-0.5`} />
              <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => dismiss(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification harus dipakai di dalam NotificationProvider');
  return ctx;
};

export default NotificationContext;