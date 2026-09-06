import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isAdmin = false,
  society = null,
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      data-society={society || undefined}
      data-theme={isAdmin ? 'celestial' : undefined}
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-backdrop-enter"
      onClick={onClose}
    >
      <div
        className="neu-flat-lg rounded-3xl max-w-sm sm:max-w-md w-full border border-[var(--neu-border)] p-6 sm:p-7 space-y-5 animate-modal-enter text-[var(--neu-text)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon + Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="neu-pressed w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-[var(--neu-border)] text-[var(--neu-accent)]">
            <LogOut size={22} className="stroke-[2.2]" />
          </div>

          <button
            onClick={onClose}
            className="neu-button p-2 rounded-xl text-[var(--neu-text)] hover:text-[var(--neu-accent)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3
            id="logout-modal-title"
            className="text-xl sm:text-2xl font-black font-heading text-[var(--neu-text)]"
          >
            Confirm Logout
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-[var(--neu-text)] opacity-85 font-medium">
            {isAdmin
              ? 'Are you sure you want to log out of the Admin Portal? You will need the admin password to log back in.'
              : 'Are you sure you want to log out? Your seat reservation and ticket details remain securely saved.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="neu-button flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-[var(--neu-text)] active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="neu-button-primary flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <LogOut size={15} />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

