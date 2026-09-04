import React, { useState, useEffect, useMemo, memo } from 'react';
import { STAGE_TABLE_CONFIG } from '../../hooks/useSeats';
import { FloorPlanModal } from './FloorPlanModal';
import { Map, Lock, Search, ChevronLeft, ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { getSocietyTheme, normalizeSocietyName } from '../../utils/societyTheme';

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
    classes = 'neu-pressed text-[var(--neu-accent)] border border-[var(--neu-border)] cursor-not-allowed font-bold opacity-75';
  } else if (status === 'reserved') {
    classes = 'neu-pressed text-[var(--neu-text)] opacity-40 cursor-not-allowed';
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
          ? `Table ${seat.table_code} • Seat ${seat.seat_number} (Reserved for ${seat.society})`
          : status === 'confirmed'
          ? `Table ${seat.table_code} • Seat ${seat.seat_number} (Occupied)`
          : `Table ${seat.table_code} • Seat ${seat.seat_number} (${status})`
      }
    >
      {status === 'confirmed' ? '✓' : seat.seat_number}
    </button>
  );
});

export function SeatMap({
  seats,
  selectedSeat,
  onSeatSelect,
  userSeat,
  currentUserId,
  userSociety = 'Society A',
  initialSociety,
  activeSociety: controlledActiveSociety,
  onSocietyChange,
}) {
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [internalActiveSociety, setInternalActiveSociety] = useState(
    normalizeSocietyName(controlledActiveSociety || initialSociety || userSociety || 'Society A')
  );
  const [searchTable, setSearchTable] = useState('');
  const [page, setPage] = useState(1);
  const [restrictionNotice, setRestrictionNotice] = useState(null);
  const TABLES_PER_PAGE = 6; // 6 tables per page prevents vertical overflow

  // Controlled by the parent (drives the /dashboard/:society URL) when provided,
  // otherwise falls back to internal state for standalone usage.
  const activeSociety = controlledActiveSociety
    ? normalizeSocietyName(controlledActiveSociety)
    : internalActiveSociety;

  const changeActiveSociety = (soc) => {
    const normalized = normalizeSocietyName(soc);
    if (onSocietyChange) {
      onSocietyChange(normalized);
    } else {
      setInternalActiveSociety(normalized);
    }
    setPage(1);
    setSearchTable('');
  };

  const normalizedUserSociety = normalizeSocietyName(userSociety);

  // Sync active tab whenever user's assigned society changes or loads
  // (only relevant in uncontrolled/standalone mode)
  useEffect(() => {
    if (!controlledActiveSociety) {
      if (initialSociety) {
        setInternalActiveSociety(normalizeSocietyName(initialSociety));
        setPage(1);
      } else if (userSociety) {
        setInternalActiveSociety(normalizeSocietyName(userSociety));
        setPage(1);
      }
    }
  }, [userSociety, initialSociety, controlledActiveSociety]);

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

  // List of tables filtered by active society and search
  const filteredTables = useMemo(() => {
    const list = Object.values(tableGroups).filter((t) => {
      const matchesSociety = normalizeSocietyName(t.society) === normalizeSocietyName(activeSociety);
      if (!matchesSociety) return false;
      if (!searchTable) return true;
      return t.code.toLowerCase().includes(searchTable.toLowerCase().trim());
    });
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

  const isCurrentSocietyAllowed = normalizeSocietyName(activeSociety) === normalizedUserSociety;
  const userSocTheme = getSocietyTheme(normalizedUserSociety);
  const activeSocTheme = getSocietyTheme(activeSociety);

  const handleRestrictedSeatClick = (seat) => {
    setRestrictionNotice(
      `Table ${seat.table_code} belongs to ${seat.society}. Since you are in ${normalizedUserSociety}, you can only select seats within ${normalizedUserSociety}.`
    );
    setTimeout(() => setRestrictionNotice(null), 5000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pt-0 pb-4 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Society Selection Tabs */}
      <div className="space-y-2.5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
          <div className="flex items-center justify-center gap-2">
            <Layers size={16} className="text-[var(--neu-accent)] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[var(--neu-text)]">Select Society / Hall Zone:</span>
          </div>
          <div
            className="text-xs font-semibold px-3 py-1 rounded-full border shadow-sm mx-auto sm:mx-0"
            style={{
              backgroundColor: userSocTheme.badge.bg,
              color: userSocTheme.badge.text,
              borderColor: userSocTheme.badge.border,
            }}
          >
            Your Assigned Society: <strong className="font-extrabold">{normalizedUserSociety}</strong>
          </div>
        </div>

        {/* Society Navigation Pill Tabs with Dedicated Neumorphic Borders & Colors per Society */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pt-2.5 pb-2.5 px-2 scrollbar-thin max-w-full">
          {STAGE_TABLE_CONFIG.map((conf) => {
            const isSelected = normalizeSocietyName(activeSociety) === normalizeSocietyName(conf.society);
            const isUserSoc = normalizeSocietyName(conf.society) === normalizedUserSociety;
            const confTheme = getSocietyTheme(conf.society);

            return (
              <button
                key={conf.row}
                onClick={() => changeActiveSociety(conf.society)}
                style={{
                  borderColor: isSelected ? confTheme.accentColor : confTheme.badge.border,
                  color: isSelected ? confTheme.accentColor : confTheme.textDark,
                  borderWidth: isSelected ? '2.5px' : '1.5px',
                  borderStyle: 'solid',
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'neu-pressed'
                    : 'neu-button hover:-translate-y-0.5'
                }`}
              >
                <span>{conf.society}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-xs"
                  style={{
                    backgroundColor: isSelected ? confTheme.accentColor : confTheme.badge.bg,
                    color: isSelected ? '#ffffff' : confTheme.badge.text,
                  }}
                >
                  Row {conf.row}
                </span>
                {isUserSoc && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Your Assigned Society" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Society Access Notification Banner - Redesigned Neumorphic Pill Card */}
      {!isCurrentSocietyAllowed && (
        <div className="neu-flat p-3.5 sm:p-4 rounded-2xl border border-[var(--neu-border)] max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[var(--neu-text)]">
                Viewing {activeSociety} <span className="text-amber-700 font-bold">(Browse Only)</span>
              </p>
              <p className="text-[11px] text-[var(--neu-text)]/70 font-medium">
                You belong to <strong className="text-[var(--neu-accent)]">{normalizedUserSociety}</strong>. You can only pick seats in your assigned tables.
              </p>
            </div>
          </div>
          <button
            onClick={() => changeActiveSociety(normalizedUserSociety)}
            className="neu-button px-3.5 py-1.5 rounded-xl font-bold text-xs text-[var(--neu-text)] hover:text-[var(--neu-accent)] flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm border border-[var(--neu-border)] cursor-pointer"
          >
            <span>Back to {normalizedUserSociety}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Click Restriction Toast Banner */}
      {restrictionNotice && (
        <div className="p-3 bg-amber-100/90 border border-amber-300 text-amber-900 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 animate-in fade-in shadow-md max-w-lg mx-auto text-center">
          <Lock size={15} className="text-amber-700 shrink-0" />
          <span className="font-semibold">{restrictionNotice}</span>
        </div>
      )}

      {/* Filter & Pagination Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 neu-flat p-3 rounded-2xl border border-[var(--neu-border)] w-full mx-auto">
        {/* Table Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-2.5 text-[var(--neu-accent)]" />
          <input
            type="text"
            value={searchTable}
            onChange={(e) => {
              setSearchTable(e.target.value);
              setPage(1);
            }}
            placeholder={`Filter ${activeSociety} tables (e.g. ${activeSociety.replace('Society ', '')}-01)...`}
            className="w-full pl-8 pr-3 py-1.5 bg-[var(--neu-bg)] border border-[var(--neu-border)] rounded-xl text-xs font-semibold text-[var(--neu-text)] placeholder:text-[var(--neu-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
          />
        </div>

        {/* Page Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs font-bold text-[var(--neu-text)]">
          <span>
            Tables {filteredTables.length > 0 ? (page - 1) * TABLES_PER_PAGE + 1 : 0} -{' '}
            {Math.min(page * TABLES_PER_PAGE, filteredTables.length)} of {filteredTables.length}
          </span>
          <div className="flex items-center gap-1.5 py-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 neu-button rounded-xl text-[var(--neu-text)] border border-[var(--neu-border)] hover:border-[var(--neu-accent)] disabled:opacity-40 disabled:hover:border-[var(--neu-border)] cursor-pointer"
              title="Previous tables"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-mono text-[var(--neu-text)]">{page}/{totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 neu-button rounded-xl text-[var(--neu-text)] border border-[var(--neu-border)] hover:border-[var(--neu-accent)] disabled:opacity-40 disabled:hover:border-[var(--neu-border)] cursor-pointer"
              title="Next tables"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend (Zero emojis) */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold px-2 mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 neu-seat-available rounded-full"></div>
          <span className="text-[var(--neu-text)]">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-full shadow-sm"></div>
          <span className="text-[var(--neu-text)]">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 neu-pressed text-[var(--neu-accent)] border border-[var(--neu-border)] rounded-full flex items-center justify-center font-bold text-[10px]">✓</div>
          <span className="text-[var(--neu-text)]">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 neu-pressed text-slate-400 rounded-full flex items-center justify-center font-bold text-[10px] border border-slate-300/60 opacity-60">1</div>
          <span className="text-slate-500">Other Society</span>
        </div>
      </div>

      {/* Tables Grid */}
      {paginatedTables.length === 0 ? (
        <div className="text-center py-12 neu-flat rounded-3xl p-6 max-w-lg mx-auto border border-[var(--neu-border)]">
          <p className="text-base font-bold text-[var(--neu-text)]">No tables found matching "{searchTable}"</p>
          <p className="text-xs text-[var(--neu-text)]/60 mt-1">Try clearing your search query or selecting a different Society tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto px-1 sm:px-2 justify-items-center">
          {paginatedTables.map((table) => {
            const confirmedCount = table.seats.filter((s) => s.status === 'confirmed' || s.attendee_id).length;
            const isTableRestricted = !isCurrentSocietyAllowed;
            const tableTheme = getSocietyTheme(table.society);

            return (
              <div key={table.code} className="flex flex-col items-center justify-center w-full max-w-[340px] mx-auto">
                {/* Table Round Neumorphic Container */}
                <div className="relative w-[280px] xs:w-[300px] sm:w-[320px] md:w-[340px] h-[280px] xs:h-[300px] sm:h-[320px] md:h-[340px] flex items-center justify-center rounded-full transition-all mx-auto">
                  
                  {/* Center Table Deck with Light Society Theme */}
                  <div className={`absolute w-[50%] h-[50%] neu-circle rounded-full flex items-center justify-center z-10 select-none border-2 shadow-inner ${tableTheme.tableBorder} ${tableTheme.tableBg}`}>
                    <div className="text-center p-2">
                      <p className={`font-extrabold text-base sm:text-xl font-heading leading-tight ${tableTheme.tableText}`}>
                        Table {table.code}
                      </p>
                      <p className={`font-extrabold text-[10px] sm:text-xs mt-0.5 truncate max-w-[100px] mx-auto ${tableTheme.tableText}`}>
                        {table.society}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-black/10">
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
                <div className="mt-2.5 text-center">
                  <span className={`px-3.5 py-1 rounded-full text-[11px] font-bold border ${tableTheme.tableBg} ${tableTheme.tableText} ${tableTheme.tableBorder} shadow-sm`}>
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
        society={userSociety || normalizedUserSociety}
      />
    </div>
  );
}
