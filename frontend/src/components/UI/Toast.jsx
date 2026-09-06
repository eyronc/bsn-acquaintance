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
      icon: <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />,
      border: 'border-red-500/40',
      glow: 'shadow-[0_8px_30px_rgba(239,68,68,0.25)]',
    },
    warning: {
      icon: <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />,
      border: 'border-amber-400/40',
      glow: 'shadow-[0_8px_30px_rgba(245,158,11,0.25)]',
    },
    success: {
      icon: <Check className="text-emerald-400 shrink-0 mt-0.5" size={18} />,
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_8px_30px_rgba(16,185,129,0.2)]',
    },
    info: {
      icon: <Info className="text-sky-400 shrink-0 mt-0.5" size={18} />,
      border: 'border-sky-500/40',
      glow: 'shadow-[0_8px_30px_rgba(14,165,233,0.2)]',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      role="alert"
      className={`no-print fixed left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-start gap-3 p-3.5 rounded-2xl bg-[#0F2A44]/95 backdrop-blur-md border ${config.border} ${config.glow} shadow-2xl animate-toast-enter text-[#F3ECDF] ${
        raised ? 'bottom-24 sm:bottom-24' : 'bottom-4 sm:bottom-6'
      }`}
    >
      {config.icon}
      <div className="flex-1 min-w-0 pr-1">
        <span className="text-[#F3ECDF] font-semibold text-xs sm:text-sm leading-relaxed block break-words">
          {message}
        </span>
      </div>
      <button 
        onClick={onClose} 
        className="text-[#9DB4C7] hover:text-[#F3ECDF] hover:bg-white/10 transition-colors shrink-0 p-1 rounded-lg -mr-1 -mt-0.5 cursor-pointer"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}