import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, Plus, Copy, Check, User, Mail, Key, Armchair, Calendar, Trash2, Search, Filter, ArrowUpDown, GraduationCap, School, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { Toast } from '../UI/Toast';
import { sendAccessCodeEmail } from '../../services/emailService';

// Year levels and their corresponding valid sections
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SECTIONS_BY_YEAR = {
  '1st Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
  '2nd Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
  '3rd Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  '4th Year': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
};

// Generate cryptic unique code
function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Format Class Badge (e.g. BSN-4B)
function formatClassBadge(year, section) {
  const numYear = year ? String(year).replace(/\D/g, '') : '4';
  const sec = (section || 'A').toUpperCase();
  return `BSN-${numYear}${sec}`;
}

export function AdminPanel({ onLogout }) {
  // Form State
  const [fullname, setFullname] = useState('');
  const [year, setYear] = useState('1st Year');
  const [section, setSection] = useState('A');
  const [email, setEmail] = useState('');

  // Data & UI State
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [attendeeToDelete, setAttendeeToDelete] = useState(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Handle year change in form to auto-adjust valid section
  const handleYearChange = (newYear) => {
    setYear(newYear);
    const validSections = SECTIONS_BY_YEAR[newYear] || [];
    if (!validSections.includes(section)) {
      setSection(validSections[0] || 'A');
    }
  };

  // Fetch all attendees on mount
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
        } catch (e) { }
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
        .insert([{
          email,
          fullname,
          year,
          section,
          unique_code: uniqueCode
        }])
        .select();

      if (error) throw error;

      const newAttendee = data[0];
      setAttendees([newAttendee, ...attendees]);
      setEmail('');
      setFullname('');
      setYear('1st Year');
      setSection('A');

      // Send email with access code
      const emailResult = await sendAccessCodeEmail(newAttendee);

      if (emailResult.success) {
        setToast({
          message: `${fullname} (${formatClassBadge(year, section)}) registered! Email sent with access code.`,
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
        year,
        section,
        unique_code: uniqueCode,
        created_at: new Date().toISOString(),
      };
      const updated = [newAttendee, ...attendees];
      setAttendees(updated);
      localStorage.setItem('bsn_mock_attendees', JSON.stringify(updated));
      setEmail('');
      setFullname('');
      setYear('1st Year');
      setSection('A');

      // Try sending email even in fallback
      await sendAccessCodeEmail(newAttendee);

      setToast({
        message: `Registered ${fullname} (${formatClassBadge(year, section)})! Code: ${uniqueCode}`,
        type: 'success',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!attendeeToDelete) return;
    const attendee = attendeeToDelete;
    setDeleteLoading(attendee.id);

    try {
      // 1. Release seat in seats table
      if (attendee.table_number && attendee.seat_number) {
        await supabase
          .from('seats')
          .update({ attendee_id: null, status: 'available', confirmed_at: null })
          .eq('table_number', attendee.table_number)
          .eq('seat_number', attendee.seat_number);
      }
      await supabase
        .from('seats')
        .update({ attendee_id: null, status: 'available', confirmed_at: null })
        .eq('attendee_id', attendee.id);

      // 2. Delete attendee record
      const { error } = await supabase
        .from('attendees')
        .delete()
        .eq('id', attendee.id);

      if (error) throw error;

      setAttendees((prev) => prev.filter((a) => a.id !== attendee.id));
      setToast({
        message: `Deleted ${attendee.fullname}. Their seat is now available.`,
        type: 'success',
      });
    } catch (err) {
      setAttendees((prev) => prev.filter((a) => a.id !== attendee.id));
      setToast({
        message: `Removed ${attendee.fullname}`,
        type: 'success',
      });
    } finally {
      setDeleteLoading(null);
      setAttendeeToDelete(null);
    }
  };

  const copyToClipboard = (code) => {
    if (!code) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => fallbackCopy(code));
      } else {
        fallbackCopy(code);
      }
    } catch (e) {
      fallbackCopy(code);
    }
    setCopiedCode(code);
    setToast({
      message: `Copied code: ${code}`,
      type: 'success',
    });
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) { }
    document.body.removeChild(textArea);
  };

  // Filter & Sort attendees dynamically
  const filteredAttendees = useMemo(() => {
    return attendees
      .filter((att) => {
        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const badge = formatClassBadge(att.year, att.section).toLowerCase();
          const nameMatch = att.fullname?.toLowerCase().includes(q);
          const emailMatch = att.email?.toLowerCase().includes(q);
          const codeMatch = att.unique_code?.toLowerCase().includes(q);
          const badgeMatch = badge.includes(q);
          if (!nameMatch && !emailMatch && !codeMatch && !badgeMatch) return false;
        }

        // Year filter
        if (yearFilter !== 'All') {
          if (att.year !== yearFilter && !att.year?.includes(yearFilter.charAt(0))) return false;
        }

        // Section filter
        if (sectionFilter !== 'All') {
          if (att.section !== sectionFilter) return false;
        }

        // Status filter
        if (statusFilter === 'Confirmed' && !att.seat_confirmed) return false;
        if (statusFilter === 'Pending' && att.seat_confirmed) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.fullname.localeCompare(b.fullname);
        if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'class') {
          const classA = formatClassBadge(a.year, a.section);
          const classB = formatClassBadge(b.year, b.section);
          return classA.localeCompare(classB);
        }
        return new Date(b.created_at) - new Date(a.created_at); // default 'newest'
      });
  }, [attendees, searchQuery, yearFilter, sectionFilter, statusFilter, sortBy]);

  // Dynamic section options based on selected form year
  const currentSections = SECTIONS_BY_YEAR[year] || [];

  return (
    <div className="min-h-screen bg-[#f7e5ee] text-[#3b1427] pb-12">
      {/* Responsive Fixed Header */}
      <header className="sticky top-0 z-50 bg-[#f7e5ee]/95 backdrop-blur-md border-b border-rose-200/60 shadow-sm py-3 px-3 sm:px-6 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2 lg:col-span-1">
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

              {/* Year Level */}
              <div>
                <label className="block text-[#3b1427] font-semibold mb-1.5 text-xs sm:text-sm">Year Level</label>
                <select
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  required
                  className="neu-input w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-[#3b1427] text-sm font-semibold"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-[#3b1427] font-semibold mb-1.5 text-xs sm:text-sm">Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                  className="neu-input w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-[#3b1427] text-sm font-semibold"
                >
                  {currentSections.map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2 lg:col-span-1">
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

            {/* Selected Class Preview Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100/60 rounded-xl w-fit text-xs text-rose-800 font-bold">
              <School size={14} className="text-rose-600" />
              <span>Assigned Class: <code className="font-mono">{formatClassBadge(year, section)}</code></span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neu-button-primary w-full py-3 sm:py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 active:scale-[0.99] transition-transform shadow-md"
            >
              <Plus size={18} />
              {loading ? 'Creating Attendee...' : `Create Attendee (${formatClassBadge(year, section)})`}
            </button>
          </form>
        </div>

        {/* Registered Attendees Card */}
        <div className="neu-flat-lg rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-rose-200/60 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-2xl font-extrabold text-[#3b1427] font-heading">
                Registered Attendees
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Showing {filteredAttendees.length} of {attendees.length} total registered guests
              </p>
            </div>

            <span className="px-3.5 py-1.5 bg-rose-100 text-rose-800 font-extrabold text-xs sm:text-sm rounded-full neu-flat">
              {filteredAttendees.length} Shown
            </span>
          </div>

          {/* Search, Filter & Sort Control Bar */}
          <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-rose-200/70 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {/* Search Bar */}
              <div className="sm:col-span-2 relative">
                <Search size={16} className="absolute left-3 top-3 text-rose-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, code, BSN - 4B..."
                  className="w-full pl-9 pr-3 py-2 bg-rose-50/50 border border-rose-200/80 rounded-xl text-xs sm:text-sm font-medium text-[#3b1427] focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Year Filter */}
              <div>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200/80 rounded-xl text-xs sm:text-sm font-semibold text-[#3b1427]"
                >
                  <option value="All">All Years</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200/80 rounded-xl text-xs sm:text-sm font-semibold text-[#3b1427]"
                >
                  <option value="All">All Sections</option>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200/80 rounded-xl text-xs sm:text-sm font-semibold text-[#3b1427]"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="class">Sort: Class (BSN - 1A)</option>
                </select>
              </div>
            </div>
          </div>

          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-[#3b1427] font-medium text-sm">Loading attendees...</p>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="text-center py-8 bg-rose-50/50 rounded-2xl border border-rose-100">
              <User size={32} className="mx-auto text-rose-300 mb-2" />
              <p className="text-slate-600 font-medium text-sm">No matching attendees found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (md and up) - Clean & Balanced Spacing */}
              <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-rose-200/80">
                <table className="w-full text-xs lg:text-sm table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-rose-200/80 bg-rose-50/50">
                      <th className="w-[16%] text-left py-3.5 px-4 font-extrabold text-[#3b1427]">Name</th>
                      <th className="w-[10%] text-center py-3.5 px-4 font-extrabold text-[#3b1427]">Class</th>
                      <th className="w-[22%] text-left py-3.5 px-4 font-extrabold text-[#3b1427]">Email</th>
                      <th className="w-[11%] text-center py-3.5 px-4 font-extrabold text-[#3b1427]">Code</th>
                      <th className="w-[10%] text-center py-3.5 px-4 font-extrabold text-[#3b1427]">Status</th>
                      <th className="w-[13%] text-center py-3.5 px-4 font-extrabold text-[#3b1427]">Seat</th>
                      <th className="w-[10%] text-center py-3.5 px-4 font-extrabold text-[#3b1427]">Registered</th>
                      <th className="w-[8%] text-center py-3.5 px-4 font-extrabold text-[#3b1427]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/60 bg-white/60">
                    {filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-rose-50/50 transition-colors">
                        {/* Name */}
                        <td className="py-3 px-4 text-left text-[#3b1427] font-semibold truncate" title={attendee.fullname}>
                          {attendee.fullname}
                        </td>

                        {/* Class / Section */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-[11px] px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md border border-rose-200 inline-block whitespace-nowrap">
                            {formatClassBadge(attendee.year, attendee.section)}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-left text-slate-600 text-xs truncate" title={attendee.email}>
                          {attendee.email}
                        </td>

                        {/* Access Code - Click Once to Copy */}
                        <td className="py-3 px-4 text-center">
                          <code
                            onClick={() => copyToClipboard(attendee.unique_code)}
                            className={`neu-pressed px-2.5 py-1 rounded-md font-mono font-bold text-[11px] inline-flex items-center justify-center whitespace-nowrap cursor-pointer transition-all select-none w-[110px] ${copiedCode === attendee.unique_code
                              ? 'bg-emerald-100 text-emerald-600 border border-emerald-300'
                              : 'bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200'
                              }`}
                            title="Click to copy code"
                          >
                            {copiedCode === attendee.unique_code ? '✓ Copied!' : attendee.unique_code}
                          </code>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          {attendee.seat_confirmed ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300/50 rounded-full font-bold text-[11px] whitespace-nowrap w-[85px]">
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300/50 rounded-full font-bold text-[11px] whitespace-nowrap w-[85px]">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Seat */}
                        <td className="py-3 px-4 text-center">
                          {attendee.seat_confirmed && attendee.table_number ? (
                            <span className="inline-block font-mono font-bold text-[#3b1427] text-[11px] px-2.5 py-1 bg-rose-100/70 border border-rose-200/80 rounded-md shadow-sm whitespace-nowrap">
                              T{attendee.table_number} • S{attendee.seat_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Registered */}
                        <td className="py-3 px-4 text-center text-slate-500 text-xs font-medium whitespace-nowrap">
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </td>

                        {/* Delete Action */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setAttendeeToDelete(attendee)}
                            disabled={deleteLoading === attendee.id}
                            className="p-2 bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white rounded-md font-semibold text-xs inline-flex items-center justify-center transition-colors shrink-0"
                            title="Delete Attendee & Release Seat"
                          >
                            <Trash2 size={14} className="shrink-0" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (sm and down) */}
              <div className="md:hidden space-y-3.5">
                {filteredAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-rose-200/70 space-y-3 transition-all"
                  >
                    {/* Top Row: Full Name + Class Badge + Status */}
                    <div className="flex justify-between items-start gap-2 border-b border-rose-100 pb-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                          <User size={12} />
                          <span>Attendee</span>
                          <span className="font-mono text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                            {formatClassBadge(attendee.year, attendee.section)}
                          </span>
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

                    {/* Middle Info Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Email Address</span>
                        <span className="text-slate-700 font-medium truncate block">{attendee.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Seat Reserved</span>
                        <span className="text-slate-700 font-semibold block">
                          {attendee.seat_confirmed && attendee.table_number
                            ? `Table ${attendee.table_number} • Seat ${attendee.seat_number}`
                            : 'Not reserved'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex justify-between items-center pt-2 border-t border-rose-100/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Code:</span>
                        <code
                          onClick={() => copyToClipboard(attendee.unique_code)}
                          className={`neu-pressed px-2 py-0.5 rounded font-mono font-bold text-xs cursor-pointer transition-all select-none ${copiedCode === attendee.unique_code
                            ? 'bg-emerald-100 text-emerald-600 border border-emerald-300'
                            : 'bg-rose-100 text-rose-600'
                            }`}
                          title="Click to copy code"
                        >
                          {copiedCode === attendee.unique_code ? '✓ Copied!' : attendee.unique_code}
                        </code>
                      </div>
                      <button
                        onClick={() => setAttendeeToDelete(attendee)}
                        disabled={deleteLoading === attendee.id}
                        className="p-1.5 bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl transition-colors"
                        title="Delete Attendee"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Custom Soft Pink Glassmorphic Delete Confirmation Modal (NO EMOJIS) */}
      {attendeeToDelete && (
        <div className="fixed inset-0 bg-[#3b1427]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl border border-rose-200/90 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 transform scale-100 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#3b1427] font-heading">Delete Attendee</h3>
                  <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider">Confirm Removal</p>
                </div>
              </div>
              <button
                onClick={() => setAttendeeToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <p>
                Are you sure you want to delete <strong className="text-[#3b1427] font-bold">{attendeeToDelete.fullname}</strong> (<span className="font-mono text-rose-700 font-semibold">{attendeeToDelete.email}</span>)?
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-rose-100/80 text-xs text-rose-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Their reserved seat will be automatically freed and available for other guests.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setAttendeeToDelete(null)}
                disabled={deleteLoading === attendeeToDelete.id}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading === attendeeToDelete.id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs sm:text-sm hover:from-rose-700 hover:to-pink-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
              >
                {deleteLoading === attendeeToDelete.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleteLoading === attendeeToDelete.id ? 'Deleting...' : 'Delete Guest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
