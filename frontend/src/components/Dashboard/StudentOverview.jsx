import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, CheckCircle2, AlertCircle, ArrowRight, Map, Calendar, MapPin, Users, Ticket, Clock, Sparkles } from 'lucide-react';
import { STAGE_TABLE_CONFIG } from '../../hooks/useSeats';

function formatStudentClass(year, section) {
  const numYear = year ? String(year).replace(/\D/g, '') : '4';
  const sec = section ? String(section).replace(/^Section\s*/i, '').trim().toUpperCase() : 'B';
  return `BSN - ${numYear}${sec}`;
}

export function StudentOverview({
  user,
  profile,
  userSeat,
  seats,
  currentTheme,
  effectiveUserSociety,
  onOpenFloorPlan,
}) {
  const navigate = useNavigate();
  const isConfirmed = userSeat?.status === 'confirmed';

  // Calculate live seat availability for the student's society
  const societyConfig = STAGE_TABLE_CONFIG.find(
    (c) => c.society.toLowerCase() === effectiveUserSociety.toLowerCase()
  ) || STAGE_TABLE_CONFIG[0];

  const societySeats = seats.filter(
    (s) => s.society?.toLowerCase() === effectiveUserSociety.toLowerCase()
  );

  const totalCapacity = societyConfig ? societyConfig.maxTables * 10 : 60;
  const confirmedCount = societySeats.filter((s) => s.status === 'confirmed').length;
  const availableCount = Math.max(0, totalCapacity - confirmedCount);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-1 sm:px-2 pb-20 sm:pb-8 page-transition">
      {/* Top Welcome & Society Hero Banner */}
      <div className={`p-4 sm:p-6 neu-flat rounded-3xl border ${currentTheme.border} relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-extrabold border shadow-xs"
                style={{
                  backgroundColor: currentTheme.badge.bg,
                  color: currentTheme.badge.text,
                  borderColor: currentTheme.badge.border,
                }}
              >
                {effectiveUserSociety}
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-black/5 text-slate-700 font-mono border border-black/5">
                {formatStudentClass(profile?.year_level || user?.year_level, profile?.section || user?.section)}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                Code: {profile?.unique_code || user?.unique_code}
              </span>
            </div>
            <h2 className={`text-xl sm:text-3xl font-extrabold font-heading ${currentTheme.textDark}`}>
              Welcome, {profile?.fullname || user?.fullname}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              BSN Acquaintance Party 2026 &bull; <span className="font-semibold italic">Celestial Garden: A night of Wonder and Grace</span>
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isConfirmed ? (
              <button
                onClick={() => navigate('/pass')}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Ticket size={16} />
                <span>View My Ticket</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/seats')}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Armchair size={16} />
                <span>Select Your Seat</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reservation Status Card */}
      {isConfirmed ? (
        <div className={`p-5 sm:p-6 neu-pressed rounded-3xl border border-emerald-300/80 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0 mx-auto sm:mx-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Seat Confirmed &bull; Ready for the Party
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-heading">
                Table {userSeat?.table_code || userSeat?.table_number} &bull; Seat {userSeat?.seat_number}
              </h3>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Your reservation is locked in {effectiveUserSociety}. You can print or download your pass anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/pass')}
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Ticket size={14} />
              <span>Digital Pass</span>
            </button>
            <button
              onClick={() => navigate('/seats')}
              className="flex-1 sm:flex-initial px-4 py-2 neu-button border border-emerald-300 text-emerald-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Armchair size={14} />
              <span>Browse Tables</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`p-5 sm:p-6 neu-pressed rounded-3xl border border-amber-300/80 bg-amber-50/60 flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mx-auto sm:mx-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Seat Not Reserved Yet
              </p>
              <h3 className="text-lg sm:text-xl font-black text-amber-950 font-heading">
                Please reserve a seat in {effectiveUserSociety}
              </h3>
              <p className="text-xs text-amber-800/90 font-medium mt-0.5">
                Tables fill up quickly. Choose your preferred table and seat with your classmates.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/seats')}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Armchair size={16} />
            <span>Go to Seat Selector</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Grid: Society Stats & Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Society Tables & Availability Widget */}
        <div className={`p-5 neu-flat rounded-3xl border ${currentTheme.border} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border"
                style={{
                  backgroundColor: currentTheme.badge.bg,
                  color: currentTheme.badge.text,
                  borderColor: currentTheme.badge.border,
                }}
              >
                {societyConfig?.row || 'E'}
              </div>
              <div>
                <h4 className={`text-sm font-extrabold ${currentTheme.textDark} font-heading`}>
                  {effectiveUserSociety} Capacity
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {societyConfig?.label || 'Assigned Zone'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/seats')}
              className="text-xs font-bold text-[var(--neu-accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Tables</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 neu-pressed rounded-2xl text-center border border-[var(--neu-border)]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Tables</p>
              <p className={`text-lg font-black ${currentTheme.textDark}`}>
                {societyConfig?.maxTables || 24}
              </p>
            </div>
            <div className="p-3 neu-pressed rounded-2xl text-center border border-emerald-200 bg-emerald-50/40">
              <p className="text-[10px] uppercase font-bold text-emerald-700">Available</p>
              <p className="text-lg font-black text-emerald-800">
                {availableCount}
              </p>
            </div>
            <div className="p-3 neu-pressed rounded-2xl text-center border border-[var(--neu-border)]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Total Seats</p>
              <p className={`text-lg font-black ${currentTheme.textDark}`}>
                {totalCapacity}
              </p>
            </div>
          </div>
        </div>

        {/* Updated Event Quick Info Widget */}
        <div className={`p-5 neu-flat rounded-3xl border ${currentTheme.border} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
                <Calendar size={16} />
              </div>
              <div>
                <h4 className={`text-sm font-extrabold ${currentTheme.textDark} font-heading`}>
                  Event Information
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">BSN Acquaintance Party 2026</p>
              </div>
            </div>

            <button
              onClick={onOpenFloorPlan}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Map size={12} />
              <span>Floor Map</span>
            </button>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <MapPin size={14} className="text-rose-600 shrink-0" />
              <span>Venue: <strong>Mactan Expo Center</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <Calendar size={14} className="text-rose-600 shrink-0" />
              <span>Date: <strong>September 26, 2026 (Saturday)</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <Clock size={14} className="text-rose-600 shrink-0" />
              <span>Time: <strong>5:00 PM – 10:00 PM</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <Sparkles size={14} className="text-amber-600 shrink-0" />
              <span>Theme: <em>Celestial Garden: A night of Wonder and Grace</em></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
