import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Copy, Mail } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { Toast } from '../UI/Toast';

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
      setToast({ message: 'Failed to fetch attendees', type: 'error' });
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

      setAttendees([data[0], ...attendees]);
      setEmail('');
      setFullname('');
      setToast({
        message: `✨ ${fullname} registered! Code: ${uniqueCode}`,
        type: 'success',
      });

      console.log(`Email to ${email}: Your access code is ${uniqueCode}`);
    } catch (error) {
      if (error.message.includes('duplicate')) {
        setToast({ message: 'Email already registered', type: 'error' });
      } else {
        setToast({ message: error.message, type: 'error' });
      }
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
    <div className="min-h-screen bg-gradient-to-br from-enchant-cream via-enchant-pink via-enchant-lavender to-enchant-sage">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur border-b border-enchant-gold border-opacity-30 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-enchant-plum font-enchant truncate">Admin Panel</h1>
            <p className="text-enchant-gold text-xs md:text-sm truncate">BSN Acquaintance Party 2026</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-enchant-pink text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm md:text-base whitespace-nowrap"
          >
            <LogOut size={16} className="md:w-[18px]" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Registration Form */}
        <div className="bg-white bg-opacity-95 rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-8 mb-6 md:mb-8 border border-enchant-gold border-opacity-30">
          <h2 className="text-lg md:text-2xl font-bold text-enchant-plum font-enchant mb-4 md:mb-6 flex items-center gap-2">
            <Plus size={20} className="md:w-7 md:h-7 text-enchant-pink" />
            Add New Attendee
          </h2>

          <form onSubmit={handleCreateAttendee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-enchant-plum font-semibold mb-1 md:mb-2 text-sm md:text-base">Full Name</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-enchant-pink border-opacity-30 focus:border-enchant-pink focus:outline-none transition-all bg-enchant-light text-sm md:text-base"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-enchant-plum font-semibold mb-1 md:mb-2 text-sm md:text-base">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-enchant-pink border-opacity-30 focus:border-enchant-pink focus:outline-none transition-all bg-enchant-light text-sm md:text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 md:py-3 bg-gradient-to-r from-enchant-pink to-enchant-lavender text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Plus size={18} className="md:w-5 md:h-5" />
              {loading ? 'Creating Attendee...' : 'Create Attendee'}
            </button>
          </form>
        </div>

        {/* Attendees List */}
        <div className="bg-white bg-opacity-95 rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-8 border border-enchant-gold border-opacity-30">
          <h2 className="text-lg md:text-2xl font-bold text-enchant-plum font-enchant mb-4 md:mb-6">
            Registered Attendees ({attendees.length})
          </h2>

          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-enchant-pink border-t-enchant-lavender rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-enchant-plum">Loading attendees...</p>
            </div>
          ) : attendees.length === 0 ? (
            <p className="text-center text-enchant-gold py-8">No attendees registered yet</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-enchant-gold border-opacity-30">
                      <th className="text-left py-3 px-4 font-bold text-enchant-plum">Full Name</th>
                      <th className="text-left py-3 px-4 font-bold text-enchant-plum">Email</th>
                      <th className="text-left py-3 px-4 font-bold text-enchant-plum">Access Code</th>
                      <th className="text-left py-3 px-4 font-bold text-enchant-plum">Registered</th>
                      <th className="text-center py-3 px-4 font-bold text-enchant-plum">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr key={attendee.id} className="border-b border-enchant-gold border-opacity-20 hover:bg-enchant-light transition-colors">
                        <td className="py-4 px-4 text-enchant-plum font-semibold">{attendee.fullname}</td>
                        <td className="py-4 px-4 text-enchant-plum">{attendee.email}</td>
                        <td className="py-4 px-4">
                          <code className="bg-enchant-light px-3 py-1 rounded text-enchant-pink font-mono font-bold text-xs">
                            {attendee.unique_code}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-enchant-gold text-xs">
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => copyToClipboard(attendee.unique_code)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-enchant-pink text-white hover:bg-opacity-90 transition-all text-xs font-semibold"
                          >
                            <Copy size={14} />
                            {copiedCode === attendee.unique_code ? 'Copied!' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {attendees.map((attendee) => (
                  <div key={attendee.id} className="border border-enchant-gold border-opacity-30 rounded-lg p-4 bg-enchant-light hover:shadow-md transition-all">
                    <div className="mb-3">
                      <p className="text-xs text-enchant-gold font-semibold mb-1">NAME</p>
                      <p className="text-sm font-bold text-enchant-plum">{attendee.fullname}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-enchant-gold font-semibold mb-1">EMAIL</p>
                      <p className="text-xs text-enchant-plum break-all">{attendee.email}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-enchant-gold font-semibold mb-1">ACCESS CODE</p>
                      <code className="bg-white px-2 py-1 rounded text-enchant-pink font-mono font-bold text-xs block">
                        {attendee.unique_code}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-enchant-gold">
                        {new Date(attendee.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => copyToClipboard(attendee.unique_code)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-enchant-pink text-white hover:bg-opacity-90 transition-all text-xs font-semibold"
                      >
                        <Copy size={14} />
                        {copiedCode === attendee.unique_code ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-enchant-light rounded-2xl border-2 border-enchant-gold border-opacity-30">
          <h3 className="font-bold text-enchant-plum mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
            <Mail size={18} className="md:w-5 md:h-5 text-enchant-pink" />
            Next Step: Email the Access Code
          </h3>
          <p className="text-enchant-plum text-xs md:text-sm leading-relaxed mb-3">
            After creating an attendee, send them an email with their access code. They'll use their email + code to log in and select their seat. Example:
          </p>
          <div className="p-2 md:p-3 bg-white rounded border border-enchant-gold border-opacity-30 font-mono text-xs text-enchant-plum">
            Email: attendee@example.com<br />
            Password: ABC123DEF456
          </div>
        </div>
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
