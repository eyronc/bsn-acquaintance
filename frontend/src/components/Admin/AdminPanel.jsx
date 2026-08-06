import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Copy, Check, User, Mail, Key, Armchair, Calendar } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { Toast } from '../UI/Toast';
import { sendAccessCodeEmail } from '../../services/emailService';

// Generate cryptic unique code
function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function AdminPanel({ onLogout }) {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch all attendees
  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.warn('Supabase attendees table query failed:', error.message);
      // Fallback mock attendees
      const local = localStorage.getItem('bsn_mock_attendees');
      if (local) {
        try {
          setAttendees(JSON.parse(local));
        } catch (e) {}
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateAttendee = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uniqueCode = generateUniqueCode();

      const { data, error } = await supabase
        .from('attendees')
        .insert([{ email, fullname, unique_code: uniqueCode }])
        .select();

      if (error) throw error;

      const newAttendee = data[0];
      setAttendees([newAttendee, ...attendees]);
      setEmail('');
      setFullname('');

      // Send email with access code
      const emailResult = await sendAccessCodeEmail(newAttendee);

      if (emailResult.success) {
        setToast({
          message: `${fullname} registered! Email sent with access code.`,
          type: 'success',
        });
      } else {
        setToast({
          message: `${fullname} registered! Code: ${uniqueCode} (Email: check console)`,
          type: 'success',
        });
        console.warn('Email service:', emailResult.message);
      }
    } catch (error) {
      // Local fallback
      const uniqueCode = generateUniqueCode();
      const newAttendee = {
        id: `mock-${Date.now()}`,
        email,
        fullname,
        unique_code: uniqueCode,
        created_at: new Date().toISOString(),
      };
      const updated = [newAttendee, ...attendees];
      setAttendees(updated);
      localStorage.setItem('bsn_mock_attendees', JSON.stringify(updated));
      setEmail('');
      setFullname('');

      // Try to send email even in fallback
      await sendAccessCodeEmail(newAttendee);

      setToast({
        message: `Registered ${fullname}! Code: ${uniqueCode}`,
        type: 'success',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7e5ee] text-[#3b1427] pb-12">
      {/* Responsive Header */}
      <header className="neu-flat sticky top-0 z-40 mx-2 md:mx-6 my-2 rounded-2xl border border-rose-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-full neu-avatar object-contain p-1 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-2xl font-extrabold text-[#3b1427] font-heading truncate leading-tight">Admin Panel</h1>
              <p className="text-rose-600 font-bold text-[11px] sm:text-sm truncate">BSN Party 2026</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="neu-button px-3 sm:px-5 py-2 text-rose-700 hover:text-rose-900 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shrink-0 border border-rose-300/40 active:scale-95 transition-transform"
            aria-label="Logout"
          >
            <LogOut size={16} className="text-rose-600" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Registration Form Card */}
        <div className="neu-flat-lg rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-rose-200/60">
          <h2 className="text-base sm:text-2xl font-extrabold text-[#3b1427] font-heading mb-4 sm:mb-6 flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
              <Plus size={18} />
            </div>
            Add New Attendee
          </h2>

          <form onSubmit={handleCreateAttendee} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[#3b1427] font-semibold mb-1.5 text-xs sm:text-sm">Full Name</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="neu-input w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-[#3b1427] text-sm font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#3b1427] font-semibold mb-1.5 text-xs sm:text-sm">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="neu-input w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-[#3b1427] text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neu-button-primary w-full py-3 sm:py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 active:scale-[0.99] transition-transform shadow-md"
            >
              <Plus size={18} />
              {loading ? 'Creating Attendee...' : 'Create Attendee'}
            </button>
          </form>
        </div>

        {/* Registered Attendees Card */}
        <div className="neu-flat-lg rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-rose-200/60">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-base sm:text-2xl font-extrabold text-[#3b1427] font-heading">
              Registered Attendees
            </h2>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 font-extrabold text-xs sm:text-sm rounded-full neu-flat">
              {attendees.length} total
            </span>
          </div>

          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-[#3b1427] font-medium text-sm">Loading attendees...</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8 bg-rose-50/50 rounded-2xl border border-rose-100">
              <User size={32} className="mx-auto text-rose-300 mb-2" />
              <p className="text-slate-600 font-medium text-sm">No attendees registered yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (md and up) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rose-200/80">
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Full Name</th>
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Email</th>
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Access Code</th>
                      <th className="text-center py-3 px-4 font-bold text-[#3b1427]">Status</th>
                      <th className="text-center py-3 px-4 font-bold text-[#3b1427]">Seat</th>
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Registered</th>
                      <th className="text-center py-3 px-4 font-bold text-[#3b1427]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/60">
                    {attendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-4 px-4 text-[#3b1427] font-semibold">{attendee.fullname}</td>
                        <td className="py-4 px-4 text-slate-600 text-xs">{attendee.email}</td>
                        <td className="py-4 px-4">
                          <code className="neu-pressed px-3 py-1 rounded-lg text-rose-600 font-mono font-bold text-xs">
                            {attendee.unique_code}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {attendee.seat_confirmed ? (
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300/50 rounded-full font-bold text-xs">
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300/50 rounded-full font-bold text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {attendee.seat_confirmed && attendee.table_number ? (
                            <span className="font-mono font-bold text-[#3b1427] text-xs px-2.5 py-1 bg-rose-100/60 rounded-lg">
                              Table {attendee.table_number} • Seat {attendee.seat_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-xs font-medium">
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => copyToClipboard(attendee.unique_code)}
                            className="neu-button px-3 py-1.5 rounded-lg text-rose-600 font-semibold text-xs inline-flex items-center gap-1.5 hover:text-rose-700"
                          >
                            {copiedCode === attendee.unique_code ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            {copiedCode === attendee.unique_code ? 'Copied!' : 'Copy Code'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (sm and down) */}
              <div className="md:hidden space-y-3.5">
                {attendees.map((attendee) => (
                  <div 
                    key={attendee.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-rose-200/70 space-y-3 transition-all"
                  >
                    {/* Top Row: Full Name + Status Badge */}
                    <div className="flex justify-between items-start gap-2 border-b border-rose-100 pb-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                          <User size={12} />
                          <span>Attendee</span>
                        </div>
                        <h3 className="text-base font-extrabold text-[#3b1427] truncate leading-snug">
                          {attendee.fullname}
                        </h3>
                      </div>
                      {attendee.seat_confirmed ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-extrabold text-[11px] shrink-0">
                          Confirmed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-extrabold text-[11px] shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-rose-50/50 px-3 py-2 rounded-xl">
                      <Mail size={14} className="text-rose-500 shrink-0" />
                      <span className="break-all font-medium">{attendee.email}</span>
                    </div>

                    {/* Access Code & Seat Info Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Access Code */}
                      <div className="bg-rose-50/80 p-2.5 rounded-xl border border-rose-100">
                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Key size={11} />
                          Access Code
                        </p>
                        <code className="text-rose-700 font-mono font-extrabold text-xs tracking-wider block">
                          {attendee.unique_code}
                        </code>
                      </div>

                      {/* Seat info */}
                      <div className="bg-rose-50/80 p-2.5 rounded-xl border border-rose-100">
                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Armchair size={11} />
                          Seat Location
                        </p>
                        {attendee.seat_confirmed && attendee.table_number ? (
                          <p className="text-xs font-mono font-bold text-[#3b1427]">
                            Table {attendee.table_number} • Seat {attendee.seat_number}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Not selected</p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Calendar size={12} className="text-rose-400" />
                        <span>{new Date(attendee.created_at).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => copyToClipboard(attendee.unique_code)}
                        className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-rose-700"
                      >
                        {copiedCode === attendee.unique_code ? (
                          <>
                            <Check size={13} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}