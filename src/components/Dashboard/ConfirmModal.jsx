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
      sticky={true}
    >
      {/* Seat Info */}
      <div className="mb-4 md:mb-6 p-3 md:p-4 bg-enchant-light rounded-lg border-2 border-enchant-gold border-opacity-30">
        <p className="text-enchant-plum font-semibold mb-1 md:mb-2 text-sm md:text-base">Your Selected Seat:</p>
        <p className="text-lg md:text-2xl font-bold text-enchant-pink font-enchant">
          Table {seat?.table_number} • Seat {seat?.seat_number}
        </p>
      </div>

      {/* Caution Warning */}
      <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 flex gap-2 md:gap-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5 md:mt-1" size={18} className="md:w-5 md:h-5" />
        <div>
          <p className="font-semibold text-yellow-900 mb-1 md:mb-2 text-sm md:text-base">Important</p>
          <p className="text-xs md:text-sm text-yellow-800 leading-relaxed">
            Once you confirm this seat, <strong>you cannot change it</strong>. This selection is final for the event.
            Please make sure you're happy with this choice before confirming.
          </p>
        </div>
      </div>

      {/* Acknowledgment Checkbox */}
      <label className="flex items-start gap-2 md:gap-3 cursor-pointer p-2 md:p-3 rounded-lg hover:bg-enchant-light transition-colors">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 w-4 md:w-5 h-4 md:h-5 rounded accent-enchant-pink cursor-pointer flex-shrink-0"
        />
        <span className="text-xs md:text-sm text-enchant-plum leading-relaxed">
          I understand that this seat selection is <strong>final and cannot be changed</strong> after confirmation.
        </span>
      </label>

      {/* Confirmation Message */}
      {agreed && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border-2 border-green-200 flex items-center gap-2">
          <Check size={18} className="text-green-600" />
          <p className="text-sm text-green-700">Ready to confirm!</p>
        </div>
      )}
    </Modal>
  );
}
