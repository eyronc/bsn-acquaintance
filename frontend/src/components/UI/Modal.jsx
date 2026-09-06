import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, title, children, onClose, actions, sticky = false }) {
  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-backdrop-enter">
      <div className="neu-flat-lg rounded-3xl max-w-md w-full overflow-hidden transform transition-all duration-300 ease-out animate-modal-enter shadow-2xl border border-[var(--neu-border)]">
        {/* Header */}
        <div className="neu-flat p-6 flex justify-between items-center border-b border-[var(--neu-border)]">
          <h2 className="text-xl md:text-2xl font-extrabold text-[var(--neu-text)] font-heading">{title}</h2>
          <button
            onClick={onClose}
            className="neu-button p-2 rounded-full text-[var(--neu-text)] hover:text-[var(--neu-accent)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 text-[var(--neu-text)]">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 p-6 neu-flat border-t border-[var(--neu-border)]">
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
                    : 'neu-button text-[var(--neu-text)]'
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