import React, { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <Check className="text-emerald-600 shrink-0 mt-0.5" size={18} />,
    error: <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />,
    info: <Info className="text-rose-600 shrink-0 mt-0.5" size={18} />,
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 flex items-start gap-3 p-3.5 bg-white/95 backdrop-blur-md neu-flat-lg rounded-2xl border border-[var(--neu-border)] shadow-2xl animate-toast-enter text-[var(--neu-text)]">
      {icons[type]}
      <div className="flex-1 min-w-0 pr-1">
        <span className="text-[var(--neu-text)] font-semibold text-xs sm:text-sm leading-relaxed block break-words">{message}</span>
      </div>
      <button 
        onClick={onClose} 
        className="text-slate-400 hover:text-[var(--neu-accent)] transition-colors shrink-0 p-0.5 rounded-lg hover:bg-[var(--neu-bg)] -mr-0.5 mt-0.5"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}