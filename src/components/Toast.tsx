
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-full text-white shadow-2xl animate-bounce-short ${colors[type]}`}>
      <i className={`fa-solid ${icons[type]}`}></i>
      <span className="font-bold text-sm whitespace-nowrap">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <i className="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  );
};

export default Toast;
