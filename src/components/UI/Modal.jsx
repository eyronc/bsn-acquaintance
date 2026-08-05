import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, title, children, onClose, actions, sticky = false }) {
  if (!isOpen) return null;

  if (sticky) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 backdrop-blur-sm" onClick={onClose}>
        {/* Sticky bottom modal */}
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-enchant-pink via-enchant-lavender to-enchant-sage p-4 md:p-6 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-enchant-plum font-enchant">{title}</h2>
            <button
              onClick={onClose}
              className="text-enchant-plum hover:bg-white hover:bg-opacity-30 rounded-full p-1 transition-colors"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6 text-enchant-plum">
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex gap-2 md:gap-3 p-4 md:p-6 bg-enchant-light border-t border-enchant-gold border-opacity-30">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                    action.variant === 'danger'
                      ? 'bg-red-300 text-white hover:bg-red-400'
                      : 'bg-enchant-pink text-white hover:bg-opacity-90 hover:shadow-lg'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-enchant-pink via-enchant-lavender to-enchant-sage p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-enchant-plum font-enchant">{title}</h2>
          <button
            onClick={onClose}
            className="text-enchant-plum hover:bg-white hover:bg-opacity-30 rounded-full p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-enchant-plum">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 p-6 bg-enchant-light border-t border-enchant-gold border-opacity-30">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  action.variant === 'danger'
                    ? 'bg-red-300 text-white hover:bg-red-400'
                    : 'bg-enchant-pink text-white hover:bg-opacity-90 hover:shadow-lg'
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
