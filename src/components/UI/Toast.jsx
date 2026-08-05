import React, { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <Check className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColors[type]} shadow-lg animate-toast-enter z-50`}
    >
      {icons[type]}
      <span className="text-enchant-plum font-medium text-sm">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-2 hover:opacity-70 transition-opacity flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}