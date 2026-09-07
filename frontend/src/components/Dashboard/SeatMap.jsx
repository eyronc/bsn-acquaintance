import React, { useState, useEffect, useMemo, memo } from 'react';
import { STAGE_TABLE_CONFIG, SHARED_TABLES_CONFIG } from '../../hooks/useSeats';
import { FloorPlanModal } from './FloorPlanModal';
import { Map, Lock, Search, ChevronLeft, ChevronRight, Layers, ArrowRight, Sparkles } from 'lucide-react';
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
  userSociety = 'Nursing Informatics Society',
  initialSociety,
  activeSociety: controlledActiveSociety,
  onSocietyChange,
}) {
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [internalActiveSociety, setInternalActiveSociety] = useState(
    normalizeSocietyName(controlledActiveSociety || initialSociety || userSociety || 'Nursing Informatics Society')
  );
  const [searchTable, setSearchTable] = useState('');
  const [page, setPage] = useState(1);
  const [restrictionNotice, setRestrictionNotice] = useState(null);
  const TABLES_PER_PAGE = 6; // 6 tables per page prevents vertical overflow

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

  // Group seats by table_code (e.g. "TH-01", "I-13.1 / H-01.9")
  const tableGroups = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      const code = seat.table_code || `TH-${String(seat.table_number || 1).padStart(2, '0')}`;
      if (!map[code]) {
        const isShared = code.includes('/');
        map[code] = {
          code,
          row: seat.row_letter || code.split('-')[0],
          tableNumber: seat.table_number,
          society: seat.society || 'Nursing Informatics Society',
          isShared,
          societies: new Set(),
          seats: [],
        };
      }
      if (seat.society) {
        map[code].societies.add(normalizeSocietyName(seat.society));
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
    const normActive = normalizeSocietyName(activeSociety);
    const list = Object.values(tableGroups).filter((t) => {
      // Table matches active society if its primary society matches OR any of its seats belong to active society
      const matchesSociety = t.isShared
        ? t.societies.has(normActive)
        : normalizeSocietyName(t.society) === normActive;

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
    if (
      selectedSeat?.id === seat.id ||
      (selectedSeat?.table_code === seat.table_code && selectedSeat?.seat_number === seat.seat_number)
    ) {
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
  const activeConfig = STAGE_TABLE_CONFIG.find(
    (c) => normalizeSocietyName(c.society) === normalizeSocietyName(activeSociety)
  );
  const activeRowLetter = activeConfig?.code || activeConfig?.row || 'I';

  const handleRestrictedSeatClick = (seat) => {
    setRestrictionNotice(
      `Table ${seat.table_code} Seat ${seat.seat_number} belongs to ${seat.society}. Since you belong to ${normalizedUserSociety}, you can only select seats assigned to ${normalizedUserSociety}.`
    );
    setTimeout(() => setRestrictionNotice(null), 5000);
  };

  // Split configs into Right Side and Left Side
  const rightSideConfigs = STAGE_TABLE_CONFIG.filter((c) => c.side === 'Right');
  const leftSideConfigs = STAGE_TABLE_CONFIG.filter((c) => c.side === 'Left');

  return (
    <div className="space-y-4 sm:space-y-5 pt-0 pb-24 sm:pb-12 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Top Header: Hall Zone & User Assigned Society */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
        <div className="flex items-center justify-center gap-2">
          <Layers size={16} className="text-[var(--neu-accent)] shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-[var(--neu-text)]">
            Official Floor Plan Layout (12 Societies):
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div
            className="text-xs font-semibold px-3 py-1 rounded-full border shadow-sm"
            style={{
              backgroundColor: userSocTheme.badge.bg,
              color: userSocTheme.badge.text,
              borderColor: userSocTheme.badge.border,
            }}
          >
            Your Society: <strong className="font-extrabold">{normalizedUserSociety}</strong>
          </div>
        </div>
      </div>

      {/* Society Access Notification Banner when browsing another society */}
      {!isCurrentSocietyAllowed && (
        <div
          className="neu-flat p-3.5 sm:p-4 rounded-2xl border max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm transition-all duration-500 ease-out animate-in fade-in slide-in-from-top-3"
          style={{
            borderColor: userSocTheme.badge.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 hover:scale-105"
              style={{
                backgroundColor: userSocTheme.badge.bg,
                borderColor: userSocTheme.badge.border,
                color: userSocTheme.accentColor,
              }}
            >
              <Lock size={16} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[var(--neu-text)]">
                Viewing {activeSociety}{' '}
                <span className="font-bold" style={{ color: userSocTheme.accentColor }}>
                  (Browse Only)
                </span>
              </p>
              <p className="text-[11px] text-[var(--neu-text)]/75 font-medium mt-0.5">
                You belong to <strong style={{ color: userSocTheme.accentColor }}>{normalizedUserSociety}</strong>.
                You can only pick seats assigned to your society.
              </p>
            </div>
          </div>
          <button
            onClick={() => changeActiveSociety(normalizedUserSociety)}
            style={{
              borderColor: userSocTheme.badge.border,
              color: userSocTheme.accentColor,
            }}
            className="neu-button px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-xs border cursor-pointer"
          >
            <span>Back to {normalizedUserSociety}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 12 Official Societies Navigation */}
      <div className="space-y-4 neu-flat p-3 sm:p-4 rounded-3xl border border-[var(--neu-border)] shadow-xs">
        {/* LEFT WING SECTION (FIRST) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-600">
              Left Wing Societies (MH, MC, HL, G, DN, D)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 w-full">
            {leftSideConfigs.map((conf) => {
              const isSelected = normalizeSocietyName(activeSociety) === normalizeSocietyName(conf.society);
              const isUserSoc = normalizeSocietyName(conf.society) === normalizedUserSociety;
              const confTheme = getSocietyTheme(conf.society);

              return (
                <button
                  key={conf.code}
                  onClick={() => changeActiveSociety(conf.society)}
                  style={{
                    backgroundColor: isSelected ? confTheme.accentColor : confTheme.badge.bg,
                    borderColor: isSelected ? confTheme.accentColor : confTheme.badge.border,
                    color: isSelected ? '#ffffff' : confTheme.badge.text,
                    borderWidth: isSelected ? '2px' : '1.5px',
                    borderStyle: 'solid',
                  }}
                  className={`relative py-2.5 px-2 rounded-2xl min-h-[68px] sm:min-h-[74px] flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer ${
                    isSelected
                      ? 'neu-pressed shadow-md scale-102 z-10'
                      : 'hover:scale-102 hover:shadow-xs active:scale-95 shadow-xs'
                  }`}
                  title={`${conf.society} (${conf.label})`}
                >
                  <span className="font-heading font-black text-xs sm:text-sm leading-none mb-1">
                    {conf.code}
                  </span>
                  <span
                    className="text-[10px] sm:text-[11px] font-extrabold leading-tight text-center break-words w-full px-0.5"
                    style={{
                      color: isSelected ? '#ffffff' : confTheme.badge.text,
                      opacity: isSelected ? 1 : 0.9,
                    }}
                  >
                    {conf.society}
                  </span>

                  {isUserSoc && (
                    <span
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 transition-all duration-300 ${
                        isSelected ? 'bg-white ring-emerald-500' : 'bg-emerald-500 ring-white'
                      }`}
                      title="Your Assigned Society"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT WING SECTION (SECOND) */}
        <div className="space-y-2 pt-2.5 border-t border-[var(--neu-border)]/60">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-600">
              Right Wing Societies (TH, PH, I, H, O, R)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 w-full">
            {rightSideConfigs.map((conf) => {
              const isSelected = normalizeSocietyName(activeSociety) === normalizeSocietyName(conf.society);
              const isUserSoc = normalizeSocietyName(conf.society) === normalizedUserSociety;
              const confTheme = getSocietyTheme(conf.society);

              return (
                <button
                  key={conf.code}
                  onClick={() => changeActiveSociety(conf.society)}
                  style={{
                    backgroundColor: isSelected ? confTheme.accentColor : confTheme.badge.bg,
                    borderColor: isSelected ? confTheme.accentColor : confTheme.badge.border,
                    color: isSelected ? '#ffffff' : confTheme.badge.text,
                    borderWidth: isSelected ? '2px' : '1.5px',
                    borderStyle: 'solid',
                  }}
                  className={`relative py-2.5 px-2 rounded-2xl min-h-[68px] sm:min-h-[74px] flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer ${
                    isSelected
                      ? 'neu-pressed shadow-md scale-102 z-10'
                      : 'hover:scale-102 hover:shadow-xs active:scale-95 shadow-xs'
                  }`}
                  title={`${conf.society} (${conf.label})`}
                >
                  <span className="font-heading font-black text-xs sm:text-sm leading-none mb-1">
                    {conf.code}
                  </span>
                  <span
                    className="text-[10px] sm:text-[11px] font-extrabold leading-tight text-center break-words w-full px-0.5"
                    style={{
                      color: isSelected ? '#ffffff' : confTheme.badge.text,
                      opacity: isSelected ? 1 : 0.9,
                    }}
                  >
                    {conf.society}
                  </span>

                  {isUserSoc && (
                    <span
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 transition-all duration-300 ${
                        isSelected ? 'bg-white ring-emerald-500' : 'bg-emerald-500 ring-white'
                      }`}
                      title="Your Assigned Society"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Society Sub-Indicator */}
        <div className="pt-1 text-center">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all duration-300 ease-out"
            style={{
              backgroundColor: activeSocTheme.badge.bg,
              color: activeSocTheme.badge.text,
              borderColor: activeSocTheme.badge.border,
            }}
          >
            Viewing <strong className="font-extrabold">{activeSociety} ({activeRowLetter})</strong>
            {normalizeSocietyName(activeSociety) === normalizedUserSociety && (
              <span className="text-[10px] text-emerald-600 font-extrabold">(Your Society)</span>
            )}
          </span>
        </div>
      </div>

      {/* Click Restriction Toast Banner */}
      {restrictionNotice && (
        <div
          className="p-3 border rounded-xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-md max-w-xl mx-auto text-center transition-all duration-300 text-xs sm:text-sm font-semibold"
          style={{
            backgroundColor: userSocTheme.badge.bg,
            borderColor: userSocTheme.badge.border,
            color: userSocTheme.badge.text,
          }}
        >
          <Lock size={15} style={{ color: userSocTheme.accentColor }} className="shrink-0" />
          <span>{restrictionNotice}</span>
        </div>
      )}

      {/* Table Search Bar */}
      <div className="w-full max-w-md mx-auto px-1">
        <div className="relative transition-all duration-300">
          <Search size={15} className="absolute left-3.5 top-3 text-[var(--neu-accent)]" />
          <input
            type="text"
            value={searchTable}
            onChange={(e) => {
              setSearchTable(e.target.value);
              setPage(1);
            }}
            placeholder={`Filter ${activeSociety} tables (e.g. ${activeRowLetter}-01)...`}
            className="w-full pl-9 pr-8 py-2 bg-[var(--neu-bg)] border border-[var(--neu-border)] rounded-2xl text-xs sm:text-sm font-semibold text-[var(--neu-text)] placeholder:text-[var(--neu-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--neu-accent)] transition-all duration-300 shadow-inner"
          />
          {searchTable && (
            <button
              onClick={() => {
                setSearchTable('');
                setPage(1);
              }}
              className="absolute right-3 top-2 text-xs font-bold text-[var(--neu-text)]/50 hover:text-[var(--neu-text)] transition-colors p-1"
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
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
          <div className="w-5 h-5 neu-pressed text-[var(--neu-accent)] border border-[var(--neu-border)] rounded-full flex items-center justify-center font-bold text-[10px]">
            ✓
          </div>
          <span className="text-[var(--neu-text)]">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 neu-pressed text-slate-400 rounded-full flex items-center justify-center font-bold text-[10px] border border-slate-300/60 opacity-60">
            1
          </div>
          <span className="text-slate-500">Other Society Slot</span>
        </div>
      </div>

      {/* Tables Section & Anchored Pagination */}
      <div className="flex flex-col min-h-[660px] md:min-h-[720px] justify-between">
        {/* Tables Grid */}
        {paginatedTables.length === 0 ? (
          <div className="text-center py-12 neu-flat rounded-3xl p-6 max-w-lg mx-auto border border-[var(--neu-border)] animate-in fade-in duration-300 my-auto">
            <p className="text-base font-bold text-[var(--neu-text)]">No tables found matching "{searchTable}"</p>
            <p className="text-xs text-[var(--neu-text)]/60 mt-1">
              Try clearing your search query or selecting a different Society tab.
            </p>
          </div>
        ) : (
          <div
            key={`${activeSociety}-${page}`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto px-1 sm:px-2 justify-items-center animate-in fade-in duration-300 w-full"
          >
            {paginatedTables.map((table) => {
              const confirmedCount = table.seats.filter((s) => s.status === 'confirmed' || s.attendee_id).length;
              const tableTheme = getSocietyTheme(table.society);

              return (
                <div
                  key={table.code}
                  className="flex flex-col items-center justify-center w-full max-w-[340px] mx-auto transition-transform duration-300 hover:scale-[1.01]"
                >
                  {/* Table Round Neumorphic Container */}
                  <div className="relative w-[280px] xs:w-[300px] sm:w-[320px] md:w-[340px] h-[280px] xs:h-[300px] sm:h-[320px] md:h-[340px] flex items-center justify-center rounded-full transition-all mx-auto">
                    {/* Center Table Deck */}
                    <div
                      className={`absolute w-[52%] h-[52%] neu-circle rounded-full flex items-center justify-center z-10 select-none border-2 shadow-inner ${tableTheme.tableBorder} ${tableTheme.tableBg}`}
                    >
                      <div className="text-center p-2 max-w-full">
                        <p
                          className={`font-extrabold text-sm xs:text-base sm:text-lg font-heading leading-tight ${tableTheme.tableText}`}
                        >
                          Table {table.code}
                        </p>
                        {table.isShared ? (
                          <div className="flex flex-col items-center justify-center gap-0.5 mt-0.5">
                            <span className="text-[9px] font-black tracking-tight px-2 py-0.5 rounded-full bg-black/10 text-slate-800">
                              Shared Table
                            </span>
                          </div>
                        ) : (
                          <p
                            className={`font-extrabold text-[9px] xs:text-[10px] sm:text-[11px] leading-tight mt-0.5 max-w-[125px] mx-auto break-words text-center ${tableTheme.tableText}`}
                          >
                            {table.society}
                          </p>
                        )}
                        <span className="inline-block mt-1 text-[9px] font-bold text-slate-600 bg-white/85 px-2 py-0.5 rounded-full border border-black/10">
                          {confirmedCount}/10 Taken
                        </span>
                      </div>
                    </div>

                    {/* 10 Circular Chairs Placed in a 360-Degree Perimeter */}
                    {table.seats.map((seat, index) => {
                      const status = getSeatStatus(seat);
                      const isSelected = status === 'selected';
                      // Seat is restricted if its specific society is not the user's assigned society
                      const isSeatRestricted = normalizeSocietyName(seat.society) !== normalizedUserSociety;

                      return (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          index={index}
                          status={status}
                          isSelected={isSelected}
                          isRestricted={isSeatRestricted}
                          onSeatSelect={onSeatSelect}
                          onRestrictedClick={handleRestrictedSeatClick}
                        />
                      );
                    })}
                  </div>

                  {/* Table Footer Status */}
                  <div className="mt-2.5 text-center">
                    <span
                      className={`px-3.5 py-1 rounded-full text-[11px] font-bold border ${tableTheme.tableBg} ${tableTheme.tableText} ${tableTheme.tableBorder} shadow-sm`}
                    >
                      Table {table.code} &bull; {10 - confirmedCount} Seats Available
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls anchored cleanly at the end of the page */}
        {filteredTables.length > 0 && totalPages > 1 && (
          <div className="mt-8 pt-4 pb-2 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 neu-flat p-3 sm:p-3.5 rounded-2xl border border-[var(--neu-border)] max-w-lg mx-auto shadow-sm transition-all duration-300">
              <div className="text-xs font-bold text-[var(--neu-text)]/80 text-center sm:text-left">
                Showing tables{' '}
                <strong className="text-[var(--neu-text)]">
                  {(page - 1) * TABLES_PER_PAGE + 1} - {Math.min(page * TABLES_PER_PAGE, filteredTables.length)}
                </strong>{' '}
                of <strong className="text-[var(--neu-text)]">{filteredTables.length}</strong>
              </div>

              <div className="flex items-center gap-1.5 py-0.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="p-1.5 sm:px-3 sm:py-1.5 neu-button rounded-xl text-xs font-bold text-[var(--neu-text)] border border-[var(--neu-border)] hover:border-[var(--neu-accent)] disabled:opacity-35 disabled:hover:border-[var(--neu-border)] transition-all duration-300 ease-out active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Previous tables"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <span className="px-2.5 py-1 rounded-xl bg-white/70 border border-[var(--neu-border)] font-mono text-xs font-bold text-[var(--neu-text)] shadow-inner">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="p-1.5 sm:px-3 sm:py-1.5 neu-button rounded-xl text-xs font-bold text-[var(--neu-text)] border border-[var(--neu-border)] hover:border-[var(--neu-accent)] disabled:opacity-35 disabled:hover:border-[var(--neu-border)] transition-all duration-300 ease-out active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Next tables"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Floor Plan Viewing and Download */}
      <FloorPlanModal
        isOpen={showFloorPlanModal}
        onClose={() => setShowFloorPlanModal(false)}
        society={userSociety || normalizedUserSociety}
      />
    </div>
  );
}
