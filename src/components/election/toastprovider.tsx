'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string | number;
  message: string;
  type: ToastType;
  leaving: boolean;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  toast: (
    message: string,
    type?: ToastType,
    action?: ToastAction,
    duration?: number,
    customId?: string | number
  ) => string | number;
  dismiss: (id: string | number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Record<string | number, NodeJS.Timeout[]>>({});

  const dismissToast = useCallback((id: string | number) => {
    if (timeoutsRef.current[id]) {
      timeoutsRef.current[id].forEach(clearTimeout);
      delete timeoutsRef.current[id];
    }
    
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback((
    message: string,
    type: ToastType = 'info',
    action?: ToastAction,
    duration = 3000,
    customId?: string | number
  ) => {
    const id = customId !== undefined ? customId : `toast-${nextId++}`;
    
    setToasts(prev => prev.filter(t => t.id !== id));

    setToasts(prev => [...prev, { id, message, type, leaving: false, action, duration }]);

    const leaveTimeout = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      const removeTimeout = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
      
      if (!timeoutsRef.current[id]) timeoutsRef.current[id] = [];
      timeoutsRef.current[id].push(removeTimeout);
    }, duration);

    timeoutsRef.current[id] = [leaveTimeout];

    return id;
  }, []);

  const colors: Record<ToastType, string> = {
    success: 'bg-green-600 border-green-400',
    error: 'bg-red-600 border-red-400',
    info: 'bg-blue-600 border-blue-400',
    warning: 'bg-yellow-500 border-yellow-300 text-gray-900',
  };

  const icons: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss: dismissToast }}>
      {children}
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2 max-w-sm" dir="rtl">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg border shadow-xl text-white text-[13px] font-semibold flex items-center justify-between gap-3 transition-all duration-300 ${
              t.leaving ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            } ${colors[t.type]}`}
            role="alert"
          >
            <div className="flex items-center gap-2">
              <span>{icons[t.type]}</span>
              <span>{t.message}</span>
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                  dismissToast(t.id);
                }}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded text-xs font-bold transition-colors cursor-pointer text-white shrink-0"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

