import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, title, children, onClose, actions, sticky = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 p-4">
      <div className="neu-flat-lg rounded-3xl max-w-md w-full overflow-hidden transform transition-all duration-300 ease-out animate-modal-enter shadow-2xl">
        {/* Header */}
        <div className="neu-flat p-6 flex justify-between items-center border-b border-pink-200/40">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#3b1427] font-heading">{title}</h2>
          <button
            onClick={onClose}
            className="neu-button p-2 rounded-full text-[#3b1427] hover:text-pink-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 text-[#3b1427]">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 p-6 neu-flat border-t border-pink-200/40">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 ease-out text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                  action.variant === 'danger'
                    ? 'neu-button text-red-600'
                    : i === actions.length - 1
                    ? 'neu-button-primary text-white'
                    : 'neu-button text-[#3b1427]'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}