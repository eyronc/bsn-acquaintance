import React, { useState, useEffect, useMemo, memo } from 'react';
import { STAGE_TABLE_CONFIG } from '../../hooks/useSeats';
import { FloorPlanModal } from './FloorPlanModal';
import { Map, Lock, Check, Search, Download, Sparkles, ChevronLeft, ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { getSocietyTheme } from '../../utils/societyTheme';

const SeatButton = memo(({ seat, index, status, isSelected, isRestricted, onSeatSelect, onRestrictedClick }) => {
  const angle = (index / 10) * Math.PI * 2 - Math.PI / 2; // Start from top
  const radiusPct = 37.5;
  const xPct = Math.cos(angle) * radiusPct;
  const yPct = Math.sin(angle) * radiusPct;

  const isClickable = !isRestricted && (status === 'available' || isSelected);

  let classes = 'neu-seat-available font-extrabold cursor-pointer';

  if (isRestricted && status === 'available') {
    classes = 'neu-pressed text-slate-400 opacity-60 border border-slate-300/60 cursor-not-allowed';
  } else if (isSelected || status === 'selected') {
    classes = 'bg-emerald-500 text-white font-extrabold ring-4 ring-emerald-300 scale-125 z-20 shadow-xl shadow-emerald-500/30';
  } else if (status === 'confirmed') {
    classes = 'neu-pressed text-pink-600 cursor-not-allowed font-bold opacity-80';
  } else if (status === 'reserved') {
    classes = 'neu-pressed text-purple-400 cursor-not-allowed opacity-60';
  }

  return (
    <button
      onClick={() => {
        if (isRestricted) {
          if (onRestrictedClick) onRestrictedClick(seat);
          return;
        }
        if (!isClickable && !isSelected) return;
        if (isSelected) {
          onSeatSelect(null);
        } else {
          onSeatSelect(seat);
        }
      }}
      style={{
        position: 'absolute',
        left: `calc(50% + ${xPct}%)`,
        top: `calc(50% + ${yPct}%)`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`w-7 xs:w-8 sm:w-9 md:w-10 h-7 xs:h-8 sm:h-9 md:h-10 rounded-full text-[10px] sm:text-xs flex items-center justify-center active:scale-95 transition-all ${classes}`}
      disabled={!isClickable && !isSelected && !isRestricted}
      title={
        isRestricted
          ? `Table ${seat.table_code} • Seat ${seat.seat_number} (Restricted to ${seat.society})`
          : status === 'confirmed'
          ? `Table ${seat.table_code} • Seat ${seat.seat_number} (Occupied)`
          : `Table ${seat.table_code} • Seat ${seat.seat_number} (${status})`
      }
    >
      {status === 'confirmed' ? '✓' : isRestricted && status === 'available' ? '🔒' : seat.seat_number}
    </button>
  );
});

export function SeatMap({ seats, selectedSeat, onSeatSelect, userSeat, currentUserId, userSociety = 'Society A' }) {
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [activeSociety, setActiveSociety] = useState(userSociety || 'Society A');
  const [searchTable, setSearchTable] = useState('');
  const [page, setPage] = useState(1);
  const [restrictionNotice, setRestrictionNotice] = useState(null);
  const TABLES_PER_PAGE = 6; // 6 tables per page prevents vertical overflow

  // Normalize user society string for comparison (e.g. "Society A" vs "A")
  const normalizeSociety = (soc) => {
    if (!soc) return 'Society A';
    const s = String(soc).trim();
    if (/^[A-G]$/i.test(s)) return `Society ${s.toUpperCase()}`;
    return s;
  };

  const normalizedUserSociety = normalizeSociety(userSociety);

  // Sync active tab whenever user's assigned society changes or loads
  useEffect(() => {
    if (userSociety) {
      setActiveSociety(normalizeSociety(userSociety));
      setPage(1);
    }
  }, [userSociety]);

  // Group seats by table_code (e.g., "A-01", "B-02")
  const tableGroups = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      const code = seat.table_code || `A-${String(seat.table_number || 1).padStart(2, '0')}`;
      if (!map[code]) {
        map[code] = {
          code,
          row: seat.row_letter || code.charAt(0),
          tableNumber: seat.table_number,
          society: seat.society || `Society ${code.charAt(0)}`,
          seats: [],
        };
      }
      map[code].seats.push(seat);
    });

    // Ensure seats are sorted by seat_number 1 to 10
    Object.values(map).forEach((group) => {
      group.seats.sort((a, b) => a.seat_number - b.seat_number);
    });

    return map;
  }, [seats]);

  // List of tables belonging to active society
  const filteredTables = useMemo(() => {
    const list = Object.values(tableGroups).filter((t) => {
      const matchesSociety = normalizeSociety(t.society) === normalizeSociety(activeSociety);
      if (!matchesSociety) return false;
      if (!searchTable) return true;
      return t.code.toLowerCase().includes(searchTable.toLowerCase().trim());
    });

    // Sort cleanly by table code
    list.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
    return list;
  }, [tableGroups, activeSociety, searchTable]);

  // Pagination for tables
  const totalPages = Math.ceil(filteredTables.length / TABLES_PER_PAGE) || 1;
  const paginatedTables = filteredTables.slice((page - 1) * TABLES_PER_PAGE, page * TABLES_PER_PAGE);

  const getSeatStatus = (seat) => {
    if (selectedSeat?.id === seat.id || (selectedSeat?.table_code === seat.table_code && selectedSeat?.seat_number === seat.seat_number)) {
      return 'selected';
    }
    if (seat.status === 'confirmed' || seat.attendee_id) {
      return 'confirmed';
    }
    if (seat.status === 'reserved') {
      if (currentUserId && seat.attendee_id === currentUserId) return 'selected';
      return 'reserved';
    }
    return 'available';
  };

  const isCurrentSocietyAllowed = normalizeSociety(activeSociety) === normalizedUserSociety;
  const userSocTheme = getSocietyTheme(normalizedUserSociety);
  const activeSocTheme = getSocietyTheme(activeSociety);

  const handleRestrictedSeatClick = (seat) => {
    setRestrictionNotice(
      `Table ${seat.table_code} belongs to ${seat.society}. Since you are in ${normalizedUserSociety}, you can only select and reserve seats within ${normalizedUserSociety}.`
    );
    setTimeout(() => setRestrictionNotice(null), 5000);
  };

  return (
    <div className="space-y-6 md:space-y-8 py-2 md:py-4">
      {/* Header & Floor Plan Download Trigger */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-rose-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-extrabold rounded-md uppercase tracking-wider">
              STAGE.png Reference
            </span>
            <span className="text-xs text-slate-500 font-semibold">10 Seats per Circular Table</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#3b1427] font-heading">
            Hall Seat Selection
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Browse tables by Society zone and select your reservation seat
          </p>
        </div>

        {/* View & Download Floor Plan Button */}
        <button
          onClick={() => setShowFloorPlanModal(true)}
          className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Map size={18} />
          <span>View & Download Floor Plan</span>
        </button>
      </div>

      {/* Visual Stage Area (Representing Stage in STAGE.png) */}
      <div className="relative text-center my-4">
        <div className="w-full max-w-xl mx-auto h-12 sm:h-14 bg-slate-900 border-2 border-rose-500/80 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-2 text-white font-extrabold tracking-[0.25em] text-xs sm:text-sm uppercase">
            <Sparkles size={16} className="text-rose-400" />
            <span>MAIN EVENT STAGE</span>
            <Sparkles size={16} className="text-rose-400" />
          </div>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-semibold">
          Tables in Row A face directly toward the stage
        </div>
      </div>

      {/* Society Selection Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-rose-600" />
            <span className="text-xs sm:text-sm font-bold text-[#3b1427]">Select Society / Hall Zone:</span>
          </div>
          <div className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${userSocTheme.bgLight} ${userSocTheme.text} ${userSocTheme.border}`}>
            Your Assigned Society: <strong className="font-extrabold">{normalizedUserSociety}</strong>
          </div>
        </div>

        {/* Society Navigation Pill Tabs with Dedicated Light Pastel Themes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {STAGE_TABLE_CONFIG.map((conf) => {
            const isSelected = normalizeSociety(activeSociety) === normalizeSociety(conf.society);
            const isUserSoc = normalizeSociety(conf.society) === normalizedUserSociety;
            const confTheme = getSocietyTheme(conf.society);

            return (
              <button
                key={conf.row}
                onClick={() => {
                  setActiveSociety(conf.society);
                  setPage(1);
                  setSearchTable('');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                  isSelected
                    ? confTheme.tabActive
                    : confTheme.tabInactive
                }`}
              >
                <span>{conf.society}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-white/70 text-slate-700'}`}>
                  Row {conf.row}
                </span>
                {isUserSoc && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" title="Your Assigned Society" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Society Access Notification Banner */}
      {!isCurrentSocietyAllowed ? (
        <div className="neu-pressed p-3.5 sm:p-4 rounded-2xl border border-amber-300 bg-amber-50/80 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Viewing {activeSociety} (Browse Only)</p>
              <p className="text-amber-800 text-xs mt-0.5">
                You belong to <strong>{normalizedUserSociety}</strong>. You can only pick and reserve seats within <strong>{normalizedUserSociety}</strong> tables.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveSociety(normalizedUserSociety);
              setPage(1);
              setSearchTable('');
            }}
            className="neu-button px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 text-[#3b1427] hover:text-rose-600 active:scale-95 shrink-0 cursor-pointer shadow-sm border border-amber-300/80"
          >
            <span>Jump to {normalizedUserSociety}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className={`p-3 sm:p-3.5 rounded-2xl border ${activeSocTheme.bgLight} ${activeSocTheme.border} ${activeSocTheme.text} text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm`}>
          <div className="flex items-center gap-2">
            <Check size={18} className="text-emerald-600 shrink-0" />
            <span>
              You are in <strong>{normalizedUserSociety}</strong>. All available seats below are open for your reservation!
            </span>
          </div>
          <span className="text-[11px] font-mono font-extrabold bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-300 text-emerald-800">
            ELIGIBLE
          </span>
        </div>
      )}

      {/* Click Restriction Toast Banner */}
      {restrictionNotice && (
        <div className="p-3 bg-amber-100/90 border border-amber-300 text-amber-900 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-in fade-in shadow-md">
          <Lock size={16} className="text-amber-700 shrink-0" />
          <span className="font-semibold">{restrictionNotice}</span>
        </div>
      )}

      {/* Filter & Pagination Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-rose-200/70">
        {/* Table Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-2.5 text-rose-400" />
          <input
            type="text"
            value={searchTable}
            onChange={(e) => {
              setSearchTable(e.target.value);
              setPage(1);
            }}
            placeholder={`Filter ${activeSociety} tables (e.g. ${activeSociety.replace('Society ', '')}-01)...`}
            className="w-full pl-8 pr-3 py-1.5 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-semibold text-[#3b1427] focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Page Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs font-bold text-[#3b1427]">
          <span>
            Tables {filteredTables.length > 0 ? (page - 1) * TABLES_PER_PAGE + 1 : 0} -{' '}
            {Math.min(page * TABLES_PER_PAGE, filteredTables.length)} of {filteredTables.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 neu-button rounded-lg disabled:opacity-40"
              title="Previous tables"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-mono">{page}/{totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 neu-button rounded-lg disabled:opacity-40"
              title="Next tables"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs font-semibold px-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 neu-seat-available rounded-full"></div>
          <span className="text-[#3b1427]">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-full shadow-sm"></div>
          <span className="text-[#3b1427]">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 neu-pressed text-pink-600 rounded-full flex items-center justify-center font-bold text-[10px]">✓</div>
          <span className="text-[#3b1427]">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 neu-pressed text-slate-400 rounded-full flex items-center justify-center text-[10px]">🔒</div>
          <span className="text-[#3b1427]">Restricted Society</span>
        </div>
      </div>

      {/* Tables Grid (2 to 3 columns, clean layout) */}
      {paginatedTables.length === 0 ? (
        <div className="text-center py-12 neu-flat rounded-3xl p-6">
          <p className="text-base font-bold text-[#3b1427]">No tables found matching "{searchTable}"</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different Society tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto px-1 sm:px-2">
          {paginatedTables.map((table) => {
            const confirmedCount = table.seats.filter((s) => s.status === 'confirmed' || s.attendee_id).length;
            const isTableRestricted = !isCurrentSocietyAllowed;
            const tableTheme = getSocietyTheme(table.society);

            return (
              <div key={table.code} className="flex flex-col items-center">
                {/* Table Round Neumorphic Container */}
                <div className={`relative w-[270px] xs:w-[300px] sm:w-[320px] md:w-[340px] h-[270px] xs:h-[300px] sm:h-[320px] md:h-[340px] flex items-center justify-center rounded-full transition-all`}>
                  
                  {/* Center Table Deck with Light Society Theme */}
                  <div className={`absolute w-[50%] h-[50%] neu-circle rounded-full flex items-center justify-center z-10 select-none border-2 shadow-inner ${tableTheme.border} ${tableTheme.bgLight}`}>
                    <div className="text-center p-2">
                      <p className={`font-extrabold text-base sm:text-xl font-heading leading-tight ${tableTheme.textDark}`}>
                        Table {table.code}
                      </p>
                      <p className={`font-extrabold text-[10px] sm:text-xs mt-0.5 truncate max-w-[100px] mx-auto ${tableTheme.text}`}>
                        {table.society}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-full border border-rose-200/50">
                        {confirmedCount}/10 Taken
                      </span>
                    </div>
                  </div>

                  {/* 10 Circular Chairs Placed in a 360-Degree Perimeter */}
                  {table.seats.map((seat, index) => {
                    const status = getSeatStatus(seat);
                    const isSelected = status === 'selected';

                    return (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        index={index}
                        status={status}
                        isSelected={isSelected}
                        isRestricted={isTableRestricted}
                        onSeatSelect={onSeatSelect}
                        onRestrictedClick={handleRestrictedSeatClick}
                      />
                    );
                  })}
                </div>

                {/* Table Footer Status */}
                <div className="mt-2 text-center">
                  <span className={`px-3.5 py-1 rounded-full text-[11px] font-bold border ${tableTheme.bgLight} ${tableTheme.textDark} ${tableTheme.borderLight} shadow-sm`}>
                    Table {table.code} &bull; {10 - confirmedCount} Seats Available
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Floor Plan Viewing and Download */}
      <FloorPlanModal
        isOpen={showFloorPlanModal}
        onClose={() => setShowFloorPlanModal(false)}
      />
    </div>
  );
}
