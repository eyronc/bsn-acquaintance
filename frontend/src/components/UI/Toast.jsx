import React, { useEffect } from 'react';
import { Check, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 3500, raised = false }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    error: {
      icon: <AlertCircle className="text-red-500 shrink-0" size={18} />,
      border: 'border-red-400',
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500 shrink-0" size={18} />,
      border: 'border-amber-400',
    },
    success: {
      icon: <Check className="text-emerald-500 shrink-0" size={18} />,
      border: 'border-emerald-400',
    },
    info: {
      icon: <Info className="text-blue-500 shrink-0" size={18} />,
      border: 'border-blue-400',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      role="alert"
      className={`no-print fixed left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center gap-3 p-3.5 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md border ${config.border} shadow-2xl animate-toast-enter text-slate-800 ${
        raised ? 'bottom-24 sm:bottom-24' : 'bottom-20 sm:bottom-6'
      }`}
    >
      {config.icon}
      <div className="flex-1 min-w-0 pr-1">
        <span className="text-slate-800 font-bold text-xs sm:text-sm leading-snug block break-words">
          {message}
        </span>
      </div>
      <button 
        onClick={onClose} 
        className="text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors shrink-0 p-1.5 rounded-lg cursor-pointer"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}