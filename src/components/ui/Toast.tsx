'use client';

import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

export type ToastVariant = 'success' | 'warning' | 'error';

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS: Record<ToastVariant, number> = {
  success: 5000,
  warning: 5000,
  error: 8000,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'toast-success',
  warning: 'toast-warning',
  error: 'toast-error',
};

const variantIcons: Record<ToastVariant, 'check' | 'alert' | 'x'> = {
  success: 'check',
  warning: 'alert',
  error: 'alert',
};

export function Toast({ variant, message, onDismiss }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, AUTO_DISMISS_MS[variant]);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [variant, onDismiss]);

  const isAssertive = variant === 'error';

  return (
    <div
      role="status"
      aria-live={isAssertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`toast ${variantStyles[variant]}`}
    >
      <Icon
        name={variantIcons[variant]}
        size={20}
        className="toast-icon"
        aria-hidden
      />
      <span className="toast-message">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="toast-close"
        aria-label="Dismiss notification"
      >
        <Icon name="x" size={16} aria-hidden />
      </button>
    </div>
  );
}
