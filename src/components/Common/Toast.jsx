// src/components/Common/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-container">
      <div className="toast">
        <CheckCircle size={15} style={{ color: 'var(--color-income)' }} />
        <span>{message}</span>
      </div>
    </div>
  );
}
