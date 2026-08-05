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
      <div className="mb-4 md:mb-6 p-4 md:p-5 bg-gradient-to-br from-enchant-light to-enchant-cream rounded-lg border-2 border-enchant-gold border-opacity-40 shadow-sm">
        <p className="text-enchant-plum font-semibold mb-2 text-sm md:text-base">Your Selected Seat:</p>
        <p className="text-xl md:text-2xl font-bold text-enchant-pink font-enchant">
          Table {seat?.table_number} • Seat {seat?.seat_number}
        </p>
      </div>

      {/* Caution Warning */}
      <div className="mb-5 md:mb-6 p-4 md:p-5 bg-yellow-50 rounded-lg border-2 border-yellow-200 flex gap-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-yellow-900 mb-2 text-sm md:text-base">Important Notice</p>
          <p className="text-xs md:text-sm text-yellow-800 leading-relaxed">
            Once confirmed, <strong>this seat cannot be changed</strong>. Please review your selection carefully before proceeding.
          </p>
        </div>
      </div>

      {/* Acknowledgment Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-enchant-light transition-all duration-200 mb-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 w-5 h-5 rounded accent-enchant-pink cursor-pointer flex-shrink-0 transition-all duration-200"
        />
        <span className="text-xs md:text-sm text-enchant-plum leading-relaxed">
          I understand that this seat selection is <strong>final and cannot be changed</strong> after confirmation.
        </span>
      </label>

      {/* Confirmation Message - Smooth entrance */}
      {agreed && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-3 bg-green-50 rounded-lg border-2 border-green-200 flex items-center gap-3">
          <Check size={20} className="text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Ready to confirm!</p>
        </div>
      )}
    </Modal>
  );
}