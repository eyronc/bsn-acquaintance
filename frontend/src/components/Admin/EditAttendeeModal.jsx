import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, User, Mail, School, BookOpen, Layers, DollarSign, Armchair, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase/client';

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SECTIONS_BY_YEAR = {
  '1st Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
  '2nd Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
  '3rd Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  '4th Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
};

export const PRESET_SOCIETIES = [
  'Society A',
  'Society B',
  'Society C',
  'Society D',
  'Society E',
  'Society F',
  'Society G',
];

export function EditAttendeeModal({ isOpen, attendee, onClose, onUpdated, setToast }) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('1st Year');
  const [section, setSection] = useState('A');
  const [society, setSociety] = useState('Society A');
  const [customSociety, setCustomSociety] = useState('');
  const [isCustomSociety, setIsCustomSociety] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(650);
  const [clearSeatChecked, setClearSeatChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attendee) {
      setFullname(attendee.fullname || '');
      setEmail(attendee.email || '');
      setYear(attendee.year || '1st Year');
      setSection(attendee.section || 'A');
      setPaymentAmount(attendee.payment_amount || 650);
      setClearSeatChecked(false);

      const soc = attendee.society || 'Society A';
      if (PRESET_SOCIETIES.includes(soc)) {
        setSociety(soc);
        setIsCustomSociety(false);
        setCustomSociety('');
      } else {
        setSociety('custom');
        setIsCustomSociety(true);
        setCustomSociety(soc);
      }
    }
  }, [attendee]);

  if (!isOpen || !attendee) return null;

  const handleYearChange = (newYear) => {
    setYear(newYear);
    const validSections = SECTIONS_BY_YEAR[newYear] || [];
    if (!validSections.includes(section)) {
      setSection(validSections[0] || 'A');
    }
  };

  const handleSocietyChange = (val) => {
    if (val === 'custom') {
      setIsCustomSociety(true);
      setSociety('custom');
    } else {
      setIsCustomSociety(false);
      setSociety(val);
    }
  };

  const currentSections = SECTIONS_BY_YEAR[year] || ['A'];
  const finalSociety = isCustomSociety ? (customSociety.trim() || 'Society A') : society;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        fullname: fullname.trim(),
        email: email.trim(),
        year,
        section,
        society: finalSociety,
        payment_amount: Number(paymentAmount) || 650,
        updated_at: new Date().toISOString(),
      };

      // Handle seat clearing if requested
      if (clearSeatChecked && attendee.seat_confirmed) {
        updates.seat_confirmed = false;
        updates.table_code = null;
        updates.table_number = null;
        updates.seat_number = null;
        updates.seat_confirmed_at = null;

        // Clear seat in Supabase seats table
        try {
          if (attendee.table_code) {
            await supabase
              .from('seats')
              .update({ attendee_id: null, status: 'available', confirmed_at: null })
              .eq('table_code', attendee.table_code)
              .eq('seat_number', attendee.seat_number);
          } else if (attendee.table_number) {
            await supabase
              .from('seats')
              .update({ attendee_id: null, status: 'available', confirmed_at: null })
              .eq('table_number', attendee.table_number)
              .eq('seat_number', attendee.seat_number);
          }
        } catch (e) {}
      }

      // Update in Supabase
      const { data, error } = await supabase
        .from('attendees')
        .update(updates)
        .eq('id', attendee.id)
        .select();

      if (error) throw error;

      const updatedRecord = { ...attendee, ...updates };

      // Update localStorage fallback
      try {
        const local = JSON.parse(localStorage.getItem('bsn_mock_attendees') || '[]');
        const updatedLocal = local.map((a) => (a.id === attendee.id ? updatedRecord : a));
        localStorage.setItem('bsn_mock_attendees', JSON.stringify(updatedLocal));
      } catch (e) {}

      onUpdated(updatedRecord);
      setToast({
        message: `Updated attendee record for ${fullname}!`,
        type: 'success',
      });
      onClose();
    } catch (err) {
      console.warn('Update exception:', err.message);
      // Local fallback
      const updatedRecord = {
        ...attendee,
        fullname: fullname.trim(),
        email: email.trim(),
        year,
        section,
        society: finalSociety,
        payment_amount: Number(paymentAmount) || 650,
        ...(clearSeatChecked ? { seat_confirmed: false, table_code: null, table_number: null, seat_number: null } : {}),
      };

      try {
        const local = JSON.parse(localStorage.getItem('bsn_mock_attendees') || '[]');
        const updatedLocal = local.map((a) => (a.id === attendee.id ? updatedRecord : a));
        localStorage.setItem('bsn_mock_attendees', JSON.stringify(updatedLocal));
      } catch (e) {}

      onUpdated(updatedRecord);
      setToast({
        message: `Updated ${fullname} locally (Supabase notice: check connection).`,
        type: 'success',
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#3b1427]/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#f7e5ee] border border-rose-200 rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-200/80 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#3b1427] font-heading">
                Update Attendee Record
              </h3>
              <p className="text-xs text-rose-600 font-semibold font-mono">
                Access Code: {attendee.unique_code}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-rose-200/50 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[#3b1427] font-semibold mb-1 text-xs sm:text-sm">
              Full Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-3.5 text-rose-400" />
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="neu-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold text-[#3b1427]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[#3b1427] font-semibold mb-1 text-xs sm:text-sm">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3.5 text-rose-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neu-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-medium text-[#3b1427]"
              />
            </div>
          </div>

          {/* Year & Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#3b1427] font-semibold mb-1 text-xs sm:text-sm">
                Year Level
              </label>
              <select
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="neu-input w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-[#3b1427]"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#3b1427] font-semibold mb-1 text-xs sm:text-sm">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="neu-input w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-[#3b1427]"
              >
                {currentSections.map((sec) => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Society Selection */}
          <div>
            <label className="block text-[#3b1427] font-semibold mb-1 text-xs sm:text-sm flex items-center justify-between">
              <span>Assigned Society / Table Range</span>
              <span className="text-[10px] text-rose-600 font-bold">STAGE.png Mapping</span>
            </label>
            <div className="space-y-2">
              <select
                value={society}
                onChange={(e) => handleSocietyChange(e.target.value)}
                className="neu-input w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-[#3b1427]"
              >
                {PRESET_SOCIETIES.map((soc) => (
                  <option key={soc} value={soc}>{soc}</option>
                ))}
                <option value="custom">Custom Society Name...</option>
              </select>

              {isCustomSociety && (
                <input
                  type="text"
                  value={customSociety}
                  onChange={(e) => setCustomSociety(e.target.value)}
                  placeholder="Enter custom society name (e.g. Nightingale Society)"
                  required
                  className="neu-input w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#3b1427]"
                />
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Attendees assigned to this society can only reserve tables designated for this society.
            </p>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-[#3b1427] font-semibold mb-1 text-xs sm:text-sm">
              Payment Ticket Amount (₱)
            </label>
            <div className="relative">
              <DollarSign size={15} className="absolute left-3.5 top-3.5 text-rose-400" />
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0"
                step="50"
                className="neu-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-bold text-[#3b1427]"
              />
            </div>
          </div>

          {/* Seat Status & Release Option */}
          {attendee.seat_confirmed ? (
            <div className="p-3.5 bg-rose-100/60 rounded-2xl border border-rose-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#3b1427] font-bold flex items-center gap-1.5">
                  <Armchair size={15} className="text-rose-600" />
                  <span>Current Seat: Table {attendee.table_code || attendee.table_number} &bull; Seat {attendee.seat_number}</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  Confirmed
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-rose-800 font-bold select-none">
                <input
                  type="checkbox"
                  checked={clearSeatChecked}
                  onChange={(e) => setClearSeatChecked(e.target.checked)}
                  className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                />
                <span>Release / Free this seat (allow student to re-select)</span>
              </label>
            </div>
          ) : (
            <div className="text-xs text-slate-500 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
              No seat confirmed yet for this attendee.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs sm:text-sm hover:from-rose-500 hover:to-pink-500 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
