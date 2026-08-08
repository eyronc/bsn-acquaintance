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
    success: <Check className="text-emerald-600" size={20} />,
    error: <AlertCircle className="text-rose-600" size={20} />,
    info: <Info className="text-rose-600" size={20} />,
  };

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3.5 neu-flat-lg rounded-2xl animate-toast-enter z-50 text-[#3b1427]">
      {icons[type]}
      <span className="text-[#3b1427] font-semibold text-xs md:text-sm">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-2 text-slate-500 hover:text-rose-600 transition-colors flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}