import React, { memo } from 'react';

const SeatButton = memo(({ seat, index, status, isSelected, onSeatSelect }) => {
  const angle = (index / 10) * Math.PI * 2;
  const radiusPct = 36.5;
  const xPct = Math.cos(angle) * radiusPct;
  const yPct = Math.sin(angle) * radiusPct;

  const isClickable = status === 'available' || isSelected;

  let classes = 'neu-seat-available font-extrabold cursor-pointer';
  
  if (isSelected || status === 'selected') {
    classes = 'bg-emerald-500 text-white font-extrabold ring-4 ring-emerald-300 scale-125 z-20 shadow-xl shadow-emerald-500/30';
  } else if (status === 'confirmed') {
    classes = 'neu-pressed text-pink-600 cursor-not-allowed font-bold opacity-80';
  } else if (status === 'reserved') {
    classes = 'neu-pressed text-purple-400 cursor-not-allowed opacity-60';
  }

  return (
    <button
      onClick={() => {
        if (isSelected) {
          onSeatSelect(null);
        } else if (isClickable) {
          onSeatSelect(seat);
        }
      }}
      style={{
        position: 'absolute',
        left: `calc(50% + ${xPct}%)`,
        top: `calc(50% + ${yPct}%)`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`w-8 xs:w-9 sm:w-11 md:w-12 h-8 xs:h-9 sm:h-11 md:h-12 rounded-xl text-xs sm:text-sm flex items-center justify-center active:scale-95 ${classes}`}
      disabled={!isClickable && !isSelected}
      title={`Table ${seat.table_number} • Seat ${seat.seat_number} (${status})`}
    >
      {seat.seat_number}
    </button>
  );
});

export function SeatMap({ seats, selectedSeat, onSeatSelect, userSeat }) {
  // Group seats by table (6 tables × 10 seats)
  const tableSeats = {};
  for (let i = 1; i <= 6; i++) {
    tableSeats[i] = seats.filter((s) => s.table_number === i);
  }

  const getSeatStatus = (seat) => {
    if (userSeat && userSeat.id === seat.id) return 'selected';
    if (seat.status === 'confirmed') return 'confirmed';
    if (seat.status === 'reserved' && seat.attendee_id) return 'reserved';
    return 'available';
  };

  return (
    <div className="space-y-8 md:space-y-12 py-4 md:py-8">
      <div className="text-center mb-6 px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#3b1427] font-heading mb-2">
          Select Your Seat
        </h2>
        <p className="text-slate-600 text-sm md:text-base font-medium">Click an available seat around the table, then confirm your selection</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 text-xs md:text-sm px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 neu-seat-available rounded-lg"></div>
          <span className="text-[#3b1427] font-semibold">Available</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-emerald-500 rounded-lg shadow-sm"></div>
          <span className="text-[#3b1427] font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 neu-pressed rounded-lg"></div>
          <span className="text-[#3b1427] font-semibold">Reserved</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 neu-pressed text-pink-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</div>
          <span className="text-[#3b1427] font-semibold">Confirmed</span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-6xl mx-auto px-2 md:px-4">
        {[1, 2, 3, 4, 5, 6].map((tableNum) => (
          <div key={tableNum} className="flex flex-col items-center">
            {/* Table Container */}
            <div className="relative w-[300px] xs:w-[350px] sm:w-[400px] md:w-[440px] h-[300px] xs:h-[350px] sm:h-[400px] md:h-[440px] flex items-center justify-center">
              
              {/* Table Center Circle */}
              <div className="absolute w-[50%] h-[50%] neu-circle rounded-full flex items-center justify-center">
                <div className="text-center p-3">
                  <p className="text-[#3b1427] font-extrabold text-lg sm:text-xl md:text-2xl font-heading">
                    Table {tableNum}
                  </p>
                  <p className="text-pink-600 font-bold text-xs sm:text-sm mt-0.5">
                    BSN Banquet
                  </p>
                </div>
              </div>

              {/* Seats positioned circularly */}
              {tableSeats[tableNum].map((seat, index) => {
                const status = getSeatStatus(seat);
                const isSelected = selectedSeat?.id === seat.id;

                return (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    index={index}
                    status={status}
                    isSelected={isSelected}
                    onSeatSelect={onSeatSelect}
                  />
                );
              })}
            </div>

            {/* Table Confirmed Stats */}
            <div className="mt-3 neu-pressed px-4 py-1.5 rounded-full text-xs text-pink-600 font-bold">
              {tableSeats[tableNum].filter((s) => s.status === 'confirmed').length}/10 Confirmed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
