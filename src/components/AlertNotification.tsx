import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export interface AlertNotificationProps {
  title: string;
  message: string;
  type?: 'error' | 'warning';
  onClose: () => void;
  autoDismissMs?: number;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  title,
  message,
  type = 'error',
  onClose,
  autoDismissMs = 8000
}) => {
  useEffect(() => {
    if (autoDismissMs && autoDismissMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onClose]);

  const isWarning = type === 'warning';
  const headerColor = isWarning ? '#993C15' : 'var(--color-velvet)';
  const bgColor = isWarning ? '#FFF8F3' : '#FFF5F3';
  const borderColor = isWarning ? '#E8CBB8' : '#E5C5B8';

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        width: '100%',
        backgroundColor: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderLeft: `4px solid ${headerColor}`,
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(162, 63, 29, 0.08)'
      }}
    >
      <div style={{ marginTop: '1px', flexShrink: 0 }}>
        <AlertCircle size={20} color={headerColor} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: headerColor,
          marginBottom: '4px',
          lineHeight: 1.3
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--color-muted)',
          lineHeight: 1.5
        }}>
          {message}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss alert"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: 'var(--color-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }}
        title="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
};
