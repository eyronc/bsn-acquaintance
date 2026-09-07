import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, CheckCircle2, AlertCircle, ArrowRight, Map, Calendar, MapPin, Users, Ticket, Clock, Sparkles } from 'lucide-react';
import { STAGE_TABLE_CONFIG } from '../../hooks/useSeats';

function formatStudentClass(year, section) {
  const numYear = year ? String(year).replace(/\D/g, '') : '';
  const sec = section ? String(section).replace(/^Section\s*/i, '').trim().toUpperCase() : '';
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

  const totalCapacity = societySeats.length || (societyConfig ? societyConfig.maxTables * 10 : 120);
  const confirmedCount = societySeats.filter((s) => s.status === 'confirmed').length;
  const availableCount = Math.max(0, totalCapacity - confirmedCount);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-1 sm:px-2 pb-20 sm:pb-8 page-transition">
      {/* Top Welcome & Society Hero Banner */}
      <div className={`p-4 sm:p-6 neu-flat rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} relative overflow-hidden shadow-xs`}>
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
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-black/5 text-slate-800 font-mono border border-black/10">
                {formatStudentClass(profile?.year || profile?.year_level || user?.year || user?.year_level, profile?.section || user?.section)}
              </span>
              <span className="text-xs font-bold text-slate-600 font-mono">
                Code: {profile?.unique_code || user?.unique_code}
              </span>
            </div>
            <h2 className={`text-xl sm:text-3xl font-extrabold font-heading ${currentTheme.textDark}`}>
              Welcome, {profile?.fullname || user?.fullname}!
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-90" style={{ color: currentTheme.textDark }}>
              BSN Acquaintance Party 2026 &bull; <span className="font-semibold italic">Celestial Garden: A Night of Wonder and Grace</span>
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isConfirmed ? (
              <button
                onClick={() => navigate('/pass')}
                style={{ backgroundColor: currentTheme.accentColor }}
                className="w-full sm:w-auto px-4 py-2.5 hover:opacity-90 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Ticket size={16} />
                <span>View My Ticket</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/seats')}
                style={{ backgroundColor: currentTheme.accentColor }}
                className="w-full sm:w-auto px-5 py-2.5 hover:opacity-90 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
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
        <div 
          className={`p-4 sm:p-6 neu-pressed rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 ${currentTheme.cardBg} shadow-xs`}
          style={{
            borderColor: currentTheme.badge.border,
          }}
        >
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: currentTheme.badge.bg,
                borderColor: currentTheme.badge.border,
                color: currentTheme.accentColor,
              }}
            >
              <CheckCircle2 size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p 
                className="text-[10px] sm:text-xs font-black uppercase tracking-wider"
                style={{ color: currentTheme.accentColor }}
              >
                Seat Confirmed &bull; Ready for the Party
              </p>
              <h3 className={`text-lg sm:text-2xl font-black font-heading leading-tight mt-0.5 ${currentTheme.textDark}`}>
                Table {userSeat?.table_code || userSeat?.table_number} &bull; Seat {userSeat?.seat_number}
              </h3>
              <p className={`text-[11px] sm:text-xs font-bold mt-1 leading-snug opacity-90 ${currentTheme.textDark}`}>
                Your reservation is locked in {effectiveUserSociety}. You can print or download your pass anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/pass')}
              style={{ backgroundColor: currentTheme.accentColor }}
              className="flex-1 sm:flex-initial px-4 py-2.5 hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Ticket size={14} />
              <span>Digital Pass</span>
            </button>
            <button
              onClick={() => navigate('/seats')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 neu-button rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${currentTheme.border} ${currentTheme.textDark} hover:border-[var(--neu-accent)] transition-all cursor-pointer`}
            >
              <Armchair size={14} />
              <span>Browse Tables</span>
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`p-4 sm:p-6 neu-pressed rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 ${currentTheme.cardBg} shadow-xs`}
          style={{
            borderColor: currentTheme.badge.border,
          }}
        >
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: currentTheme.badge.bg,
                borderColor: currentTheme.badge.border,
                color: currentTheme.accentColor,
              }}
            >
              <AlertCircle size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p 
                className="text-[10px] sm:text-xs font-black uppercase tracking-wider"
                style={{ color: currentTheme.accentColor }}
              >
                Seat Not Reserved Yet
              </p>
              <h3 className={`text-base sm:text-xl font-black font-heading leading-tight mt-0.5 ${currentTheme.textDark}`}>
                Please reserve a seat in {effectiveUserSociety}
              </h3>
              <p className={`text-[11px] sm:text-xs font-bold mt-1 leading-snug opacity-90 ${currentTheme.textDark}`}>
                Tables fill up quickly. Choose your preferred table and seat with your classmates.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/seats')}
            style={{ backgroundColor: currentTheme.accentColor }}
            className="w-full sm:w-auto px-5 py-2.5 hover:opacity-90 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
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
        <div className={`p-5 neu-flat rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3 shadow-xs`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border shadow-xs"
                style={{
                  backgroundColor: currentTheme.badge.bg,
                  color: currentTheme.badge.text,
                  borderColor: currentTheme.badge.border,
                }}
              >
                {societyConfig?.code || societyConfig?.row || 'I'}
              </div>
              <div>
                <h4 className={`text-sm font-extrabold ${currentTheme.textDark} font-heading`}>
                  {effectiveUserSociety} Capacity
                </h4>
                <p className="text-[11px] font-bold opacity-80" style={{ color: currentTheme.textDark }}>
                  {societyConfig?.label || 'Assigned Zone'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/seats')}
              style={{ color: currentTheme.accentColor }}
              className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Tables</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className={`p-3 neu-pressed rounded-2xl text-center border ${currentTheme.border} bg-white/70 shadow-xs`}>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-600">Tables</p>
              <p className={`text-lg font-black ${currentTheme.textDark}`}>
                {societyConfig?.maxTables || 13}
              </p>
            </div>
            <div className="p-3 neu-pressed rounded-2xl text-center border border-emerald-300 bg-emerald-100/70 shadow-xs">
              <p className="text-[10px] uppercase font-black tracking-wider text-emerald-800">Available</p>
              <p className="text-lg font-black text-emerald-900">
                {availableCount}
              </p>
            </div>
            <div className={`p-3 neu-pressed rounded-2xl text-center border ${currentTheme.border} bg-white/70 shadow-xs`}>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-600">Total Seats</p>
              <p className={`text-lg font-black ${currentTheme.textDark}`}>
                {totalCapacity}
              </p>
            </div>
          </div>
        </div>

        {/* Updated Event Quick Info Widget */}
        <div className={`p-5 neu-flat rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3 shadow-xs`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: currentTheme.badge.bg,
                  borderColor: currentTheme.badge.border,
                  color: currentTheme.accentColor,
                }}
              >
                <Calendar size={16} />
              </div>
              <div>
                <h4 className={`text-sm font-extrabold ${currentTheme.textDark} font-heading`}>
                  Event Information
                </h4>
                <p className="text-[11px] font-bold opacity-80" style={{ color: currentTheme.textDark }}>
                  BSN Acquaintance Party 2026
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center gap-2.5 font-bold text-slate-800">
              <MapPin size={15} style={{ color: currentTheme.accentColor }} className="shrink-0" />
              <span>Venue: <strong className="font-extrabold">Mactan Expo Center</strong></span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-slate-800">
              <Calendar size={15} style={{ color: currentTheme.accentColor }} className="shrink-0" />
              <span>Date: <strong className="font-extrabold">September 26, 2026 (Saturday)</strong></span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-slate-800">
              <Clock size={15} style={{ color: currentTheme.accentColor }} className="shrink-0" />
              <span>Time: <strong className="font-extrabold">5:00 PM – 10:00 PM</strong></span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-slate-800">
              <Sparkles size={15} style={{ color: currentTheme.accentColor }} className="shrink-0" />
              <span>Theme: <em className="font-bold">Celestial Garden: A Night of Wonder and Grace</em></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
