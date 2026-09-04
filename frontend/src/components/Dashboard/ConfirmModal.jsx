import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { Modal } from '../UI/Modal';

export function ConfirmModal({ isOpen, seat, onConfirm, onCancel, loading }) {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Confirm Your Seat"
      onClose={onCancel}
      actions={[
        { label: 'Cancel', onClick: onCancel },
        {
          label: loading ? 'Confirming...' : 'Confirm Seat',
          onClick: handleConfirm,
          disabled: !agreed || loading,
        },
      ]}
    >
      {/* Seat Info */}
      <div className="mb-5 p-5 neu-pressed rounded-2xl bg-[var(--neu-bg)] border border-[var(--neu-border)] transition-all duration-300">
        <p className="text-slate-500 font-semibold mb-1 text-xs md:text-sm">Your Selected Seat</p>
        <p className="text-2xl md:text-3xl font-extrabold text-[var(--neu-accent)] font-heading">
          Table {seat?.table_code || seat?.table_number} • Seat {seat?.seat_number}
        </p>
      </div>

      {/* Caution Warning */}
      <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-300/60 flex gap-3 transition-all duration-300">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-bold text-amber-900 mb-1 text-xs md:text-sm">Important Notice</p>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Once confirmed, <strong>this seat cannot be changed</strong>. Please review your selection carefully before proceeding.
          </p>
        </div>
      </div>

      {/* Acknowledgment Checkbox */}
      <label className={`flex items-start gap-3 cursor-pointer p-4 neu-flat rounded-2xl transition-all duration-300 ease-out select-none ${
        agreed 
          ? 'border-2 border-[var(--neu-accent)] shadow-md scale-[1.01]' 
          : 'border border-[var(--neu-border)]'
      }`}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded cursor-pointer flex-shrink-0 transition-transform duration-200 active:scale-90 accent-[var(--neu-accent)]"
        />
        <span className="text-xs md:text-sm text-[var(--neu-text)] leading-relaxed font-medium">
          I understand that this seat selection is <strong>final and cannot be changed</strong> after confirmation.
        </span>
      </label>

      {/* Smooth Expanding/Collapsing Confirmation Banner */}
      <div 
        className={`grid transition-all duration-300 ease-out overflow-hidden ${
          agreed ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
        }`}
      >
        <div className="min-h-0">
          <div className="p-3.5 neu-pressed rounded-xl flex items-center gap-3 bg-emerald-500/10 border border-emerald-300/60 shadow-sm">
            <Check size={20} className="text-emerald-600 flex-shrink-0 animate-bounce" />
            <p className="text-xs md:text-sm text-emerald-700 font-bold">Ready to confirm!</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}