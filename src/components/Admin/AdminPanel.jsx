import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Copy, Mail, Database, Check } from 'lucide-react';
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

const SQL_SCHEMA_SCRIPT = `-- Copy & paste into your Supabase SQL Editor:
create table if not exists public.attendees (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  fullname text not null,
  unique_code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.seats (
  id text primary key,
  table_number integer not null,
  seat_number integer not null,
  attendee_id uuid references public.attendees(id) on delete set null,
  status text not null default 'available',
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.seats (id, table_number, seat_number)
select 'table-' || t || '-seat-' || s, t, s
from generate_series(1, 6) t cross join generate_series(1, 10) s
on conflict (id) do nothing;`;

export function AdminPanel({ onLogout }) {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

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
      setToast({
        message: `Registered ${fullname}! Code: ${uniqueCode}`,
        type: 'success',
      });
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

  const copySqlScript = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7e5ee] text-[#3b1427]">
      {/* Header */}
      <header className="neu-flat sticky top-0 z-40 mx-2 md:mx-6 my-2 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-11 h-11 md:w-12 md:h-12 rounded-full neu-avatar object-contain p-1 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-extrabold text-[#3b1427] font-heading truncate">Admin Panel</h1>
              <p className="text-rose-600 font-bold text-xs md:text-sm truncate">BSN Acquaintance Party 2026</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="neu-button px-3.5 md:px-5 py-2 text-[#3b1427] hover:text-rose-600 font-semibold rounded-xl text-xs md:text-sm flex items-center gap-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Registration Form */}
        <div className="neu-flat-lg rounded-3xl p-6 md:p-8">
          <h2 className="text-lg md:text-2xl font-extrabold text-[#3b1427] font-heading mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
              <Plus size={18} />
            </div>
            Add New Attendee
          </h2>

          <form onSubmit={handleCreateAttendee} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[#3b1427] font-semibold mb-2 text-sm">Full Name</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="neu-input w-full px-4 py-3 rounded-xl text-[#3b1427] text-sm md:text-base font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#3b1427] font-semibold mb-2 text-sm">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="neu-input w-full px-4 py-3 rounded-xl text-[#3b1427] text-sm md:text-base font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neu-button-primary w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
            >
              <Plus size={18} />
              {loading ? 'Creating Attendee...' : 'Create Attendee'}
            </button>
          </form>
        </div>

        {/* Registered Attendees */}
        <div className="neu-flat-lg rounded-3xl p-6 md:p-8">
          <h2 className="text-lg md:text-2xl font-extrabold text-[#3b1427] font-heading mb-6">
            Registered Attendees ({attendees.length})
          </h2>

          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-[#3b1427] font-medium text-sm">Loading attendees...</p>
            </div>
          ) : attendees.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No attendees registered yet</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rose-200/80">
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Full Name</th>
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Email</th>
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Access Code</th>
                      <th className="text-left py-3 px-4 font-bold text-[#3b1427]">Registered</th>
                      <th className="text-center py-3 px-4 font-bold text-[#3b1427]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/60">
                    {attendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-4 px-4 text-[#3b1427] font-semibold">{attendee.fullname}</td>
                        <td className="py-4 px-4 text-slate-600">{attendee.email}</td>
                        <td className="py-4 px-4">
                          <code className="neu-pressed px-3 py-1 rounded-lg text-rose-600 font-mono font-bold text-xs">
                            {attendee.unique_code}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-xs font-medium">
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => copyToClipboard(attendee.unique_code)}
                            className="neu-button px-3 py-1.5 rounded-lg text-rose-600 font-semibold text-xs inline-flex items-center gap-1.5 hover:text-rose-700"
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
              <div className="md:hidden space-y-4">
                {attendees.map((attendee) => (
                  <div key={attendee.id} className="neu-pressed rounded-2xl p-4 space-y-3">
                    <div>
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Name</p>
                      <p className="text-sm font-bold text-[#3b1427]">{attendee.fullname}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Email</p>
                      <p className="text-xs text-slate-600 break-all">{attendee.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Access Code</p>
                      <code className="neu-flat px-2.5 py-1 rounded-lg text-rose-600 font-mono font-bold text-xs block w-fit">
                        {attendee.unique_code}
                      </code>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-rose-200/40">
                      <p className="text-xs text-slate-400">
                        {new Date(attendee.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => copyToClipboard(attendee.unique_code)}
                        className="neu-button px-3 py-1 rounded-lg text-rose-600 font-semibold text-xs inline-flex items-center gap-1"
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

        {/* Supabase Schema Setup Helper */}
        <div className="neu-pressed rounded-3xl p-6 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-bold text-[#3b1427] flex items-center gap-2 text-sm md:text-base">
              <Database size={18} className="text-rose-600" />
              Supabase SQL Schema Helper
            </h3>
            <button
              onClick={copySqlScript}
              className="neu-button px-3 py-1.5 rounded-lg text-rose-600 font-semibold text-xs inline-flex items-center gap-1.5"
            >
              {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL Script'}
            </button>
          </div>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            If you see missing table warnings in Supabase, click <strong>"Copy Supabase SQL Script"</strong> and paste it into your Supabase Dashboard &gt; SQL Editor &gt; Run.
          </p>
        </div>
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
