import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Map, Armchair, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Calendar, Clock, MapPin } from 'lucide-react';

function formatStudentClass(year, section) {
  const numYear = year ? String(year).replace(/\D/g, '') : '4';
  const sec = section ? String(section).replace(/^Section\s*/i, '').trim().toUpperCase() : 'B';
  return `BSN - ${numYear}${sec}`;
}

export function DigitalTicketView({
  user,
  profile,
  userSeat,
  currentTheme,
  effectiveUserSociety,
  onOpenFloorPlan,
}) {
  const navigate = useNavigate();
  const isConfirmed = userSeat?.status === 'confirmed';

  const handlePrint = () => {
    window.print();
  };

  if (!isConfirmed) {
    return (
      <div className="max-w-xl mx-auto px-2 py-8 text-center space-y-5 page-transition">
        <div className={`p-8 neu-flat rounded-3xl border ${currentTheme.border} space-y-4`}>
          <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto shadow-sm">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-1">
            <h3 className={`text-xl font-extrabold ${currentTheme.textDark} font-heading`}>
              No Confirmed Seat Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
              Your digital admission ticket is automatically generated as soon as you select and confirm your seat in {effectiveUserSociety}.
            </p>
          </div>

          <button
            onClick={() => navigate('/seats')}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg mx-auto active:scale-95 transition-all cursor-pointer"
          >
            <Armchair size={18} />
            <span>Select Your Seat Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-page-container max-w-2xl mx-auto px-2 sm:px-4 pb-20 sm:pb-8 space-y-5 page-transition">
      {/* Printable Digital Ticket Card (The ONLY element printed) */}
      <div
        id="digital-ticket-card"
        className={`neu-flat rounded-3xl border-2 border-[var(--neu-accent)] overflow-hidden shadow-xl ${currentTheme.cardBg} transition-colors`}
      >
        {/* Ticket Header Banner */}
        <div
          className="p-5 sm:p-6 text-white text-center relative overflow-hidden"
          style={{ backgroundColor: currentTheme.accentColor }}
        >
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Official Event Pass</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-heading tracking-wide">
              BSN Acquaintance Party 2026
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-95 italic">
              Theme: Celestial Garden: A night of Wonder and Grace
            </p>
          </div>
        </div>

        {/* Ticket Body with Clean Key-Value Structure */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Attendee Name & Access Code */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-500">Attendee Name</p>
              <h3 className={`text-lg sm:text-2xl font-black font-heading ${currentTheme.textDark}`}>
                {profile?.fullname || user?.fullname}
              </h3>
              <p className="text-sm font-extrabold text-slate-700 mt-0.5 font-mono">
                {formatStudentClass(profile?.year_level || user?.year_level, profile?.section || user?.section)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] uppercase font-bold text-slate-500">Access Code</p>
              <p className="text-sm sm:text-base font-black font-mono px-3 py-1 bg-slate-900 text-white rounded-xl shadow-xs inline-block">
                {profile?.unique_code || user?.unique_code}
              </p>
            </div>
          </div>

          {/* Reserved Seat Highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 neu-pressed rounded-2xl border border-[var(--neu-border)] text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500">Society Zone</p>
              <p
                className="text-sm sm:text-base font-black truncate"
                style={{ color: currentTheme.accentColor }}
              >
                {effectiveUserSociety}
              </p>
            </div>

            <div className="p-3.5 neu-pressed rounded-2xl border border-emerald-300 bg-emerald-50/50 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-800">Table Number</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-950 font-heading">
                {userSeat?.table_code || userSeat?.table_number}
              </p>
            </div>

            <div className="p-3.5 neu-pressed rounded-2xl border border-emerald-300 bg-emerald-50/50 text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-emerald-800">Seat Number</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-950 font-heading">
                Seat {userSeat?.seat_number}
              </p>
            </div>
          </div>

          {/* Updated Official Event Details */}
          <div className="p-4 rounded-2xl bg-black/5 border border-black/10 space-y-2 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-rose-600 shrink-0" />
                <span className="font-bold">Venue: Mactan Expo Center</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-rose-600 shrink-0" />
                <span className="font-semibold">September 26, 2026 (Saturday)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-rose-600 shrink-0" />
                <span className="font-semibold">Time: 5:00 PM – 10:00 PM</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Admission Status: Confirmed &amp; Valid</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 pt-1 border-t border-black/5">
              Please present this official pass upon entering Mactan Expo Center. Your seat reservation is verified and final.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Strictly HIDDEN when printing / saving PDF) */}
      <div className="no-print flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handlePrint}
          className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Printer size={16} />
          <span>Print / Save Ticket</span>
        </button>

        <button
          onClick={onOpenFloorPlan}
          className="w-full sm:flex-1 py-3 px-5 neu-button border border-[var(--neu-border)] text-[var(--neu-text)] font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <Map size={16} />
          <span>View Floor Plan</span>
        </button>

        <button
          onClick={() => navigate('/seats')}
          className="w-full sm:flex-1 py-3 px-5 neu-button border border-[var(--neu-border)] text-[var(--neu-text)] font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <Armchair size={16} />
          <span>Browse Tables</span>
        </button>
      </div>
    </div>
  );
}
