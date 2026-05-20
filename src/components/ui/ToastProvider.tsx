'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Toast, type ToastVariant } from './Toast';

/**
 * Sanitizes toast messages to prevent leaking sensitive information.
 * Rejects inputs matching API key patterns, internal URLs, or stack traces.
 */
export function sanitizeToastMessage(message: string): string {
  const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

  if (!message || typeof message !== 'string') {
    return GENERIC_MESSAGE;
  }

  const sensitivePatterns = [
    /sk-[a-zA-Z0-9]{20,}/,             // OpenAI API keys
    /Bearer\s+[a-zA-Z0-9._\-]+/,       // Bearer tokens
    /ghp_[a-zA-Z0-9]{36,}/,            // GitHub PATs
    /[a-zA-Z0-9_\-]{32,}/,             // Generic long tokens (32+ chars)
    /https?:\/\/[^\s]+/,               // URLs (internal endpoints)
    /at\s+\w+\s*\([^)]*\)/,           // Stack trace lines (e.g. "at Function (file.js:1:2)")
    /Error:\s*\n/,                      // Error stack headers
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(message)) {
      return GENERIC_MESSAGE;
    }
  }

  return message;
}

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastAPI {
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
}

interface ToastContextValue {
  toast: ToastAPI;
}

const ToastContext = createContext<ToastContextValue>({
  toast: {
    success: () => {},
    warning: () => {},
    error: () => {},
  },
});

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastsRef = useRef<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    toastsRef.current = toastsRef.current.filter((t) => t.id !== id);
    setToasts([...toastsRef.current]);
  }, []);

  const addToast = useCallback((variant: ToastVariant, rawMessage: string) => {
    const message = sanitizeToastMessage(rawMessage);
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastItem = { id, variant, message };
    toastsRef.current = [...toastsRef.current, newToast];
    setToasts([...toastsRef.current]);
  }, []);

  const toast: ToastAPI = {
    success: useCallback((msg: string) => addToast('success', msg), [addToast]),
    warning: useCallback((msg: string) => addToast('warning', msg), [addToast]),
    error: useCallback((msg: string) => addToast('error', msg), [addToast]),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-label="Notifications">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            message={t.message}
            onDismiss={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
