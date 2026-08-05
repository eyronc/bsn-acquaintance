import React from 'react';

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

  const getSeatColor = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-emerald-400 hover:bg-emerald-500 shadow-lg';
      case 'confirmed':
        return 'bg-enchant-pink bg-opacity-60 cursor-not-allowed';
      case 'reserved':
        return 'bg-enchant-lavender bg-opacity-50 cursor-not-allowed';
      default:
        return 'bg-white hover:bg-enchant-sage hover:shadow-md';
    }
  };

  return (
    <div className="space-y-6 md:space-y-12 py-4 md:py-8">
      <div className="text-center mb-4 md:mb-8 px-4">
        <h2 className="text-xl md:text-3xl font-bold text-enchant-plum font-enchant mb-2">
          Select Your Enchanted Seat
        </h2>
        <p className="text-enchant-gold text-sm md:text-base">Click a white seat to reserve, then confirm your choice</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-6 md:mb-8 text-xs md:text-sm px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border-2 border-enchant-pink rounded"></div>
          <span className="text-enchant-plum">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-400 rounded"></div>
          <span className="text-enchant-plum">Your Selection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-enchant-lavender bg-opacity-50 rounded"></div>
          <span className="text-enchant-plum">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-enchant-pink bg-opacity-60 rounded"></div>
          <span className="text-enchant-plum">Confirmed</span>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-6xl mx-auto px-2 md:px-4">
        {[1, 2, 3, 4, 5, 6].map((tableNum) => (
          <div key={tableNum} className="flex flex-col items-center">
            {/* Table Center */}
            <div className="relative">
              {/* Seats Circle */}
              <div className="relative w-56 sm:w-64 md:w-80 h-56 sm:h-64 md:h-80 flex items-center justify-center">
                {/* Table Visual */}
                <div className="absolute inset-0 bg-gradient-to-br from-enchant-gold to-enchant-gold bg-opacity-20 rounded-full border-4 border-dashed border-enchant-gold border-opacity-40 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-enchant-plum font-bold text-xl font-enchant">Table {tableNum}</p>
                    <p className="text-enchant-gold text-xs">Banquet</p>
                  </div>
                </div>

                {/* Seats positioned in circle */}
                {tableSeats[tableNum].map((seat, index) => {
                  const angle = (index / 10) * Math.PI * 2;
                  // Radius larger to place seats OUTSIDE the circle visual
                  const radius = 140;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const status = getSeatStatus(seat);
                  const isSelected = selectedSeat?.id === seat.id;
                  const isClickable = status === 'available' || isSelected;

                  return (
                    <button
                      key={seat.id}
                      onClick={() => isClickable && onSeatSelect(seat)}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                      className={`w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 rounded-lg font-bold text-xs sm:text-sm font-enchant border-2 border-enchant-pink transition-all duration-300 active:scale-95 ${
                        getSeatColor(status)
                      } ${
                        isSelected ? 'ring-2 sm:ring-4 ring-enchant-pink ring-opacity-60 scale-110' : ''
                      } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                        status === 'available' ? 'hover:scale-110 hover:shadow-lg' : ''
                      }`}
                      disabled={!isClickable}
                      title={`${status === 'confirmed' ? 'Confirmed' : status === 'reserved' ? 'Reserved' : 'Available'}`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Label */}
            <p className="mt-4 text-enchant-plum text-xs opacity-70">
              {tableSeats[tableNum].filter((s) => s.status === 'confirmed').length}/10 Confirmed
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
