import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SeatMap } from './SeatMap';
import { CheckCircle2, Ticket } from 'lucide-react';

export function SeatSelectionView({
  seats,
  selectedSeat,
  onSeatSelect,
  userSeat,
  currentUserId,
  effectiveUserSociety,
  currentTheme,
  onOpenConfirmModal,
}) {
  const { societyParam } = useParams();
  const navigate = useNavigate();
  const isConfirmed = userSeat?.status === 'confirmed';

  // Format society from URL if provided (e.g. "Society-E" -> "Society E")
  const initialSociety = societyParam
    ? societyParam.replace(/-/g, ' ')
    : effectiveUserSociety;

  return (
    <div className="space-y-3 sm:space-y-4 pb-24 sm:pb-12 page-transition">
      {/* Confirmed Reservation Ribbon */}
      {isConfirmed && (
        <div className="neu-pressed px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-emerald-300/80 bg-emerald-50/70 max-w-xl mx-auto flex items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[9.5px] uppercase font-extrabold text-emerald-700 leading-none">
                Confirmed Reservation
              </p>
              <p className="text-xs sm:text-sm font-black text-emerald-950 truncate mt-0.5 font-heading">
                Table {userSeat.table_code || userSeat.table_number} &bull; Seat {userSeat.seat_number}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/pass')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all"
          >
            <Ticket size={13} />
            <span>View Ticket</span>
          </button>
        </div>
      )}

      {/* Dedicated SeatMap Component */}
      <SeatMap
        seats={seats}
        selectedSeat={selectedSeat}
        onSeatSelect={onSeatSelect}
        userSeat={userSeat}
        currentUserId={currentUserId}
        userSociety={effectiveUserSociety}
        initialSociety={initialSociety}
      />

      {/* Sticky Bottom Action Bar when seat is selected */}
      {selectedSeat && !isConfirmed && (
        <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-40 max-w-md sm:w-auto flex justify-center mx-auto animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={onOpenConfirmModal}
            className={`w-full sm:w-auto px-6 py-3.5 ${currentTheme.buttonPrimary} font-extrabold rounded-2xl text-xs sm:text-sm md:text-base shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer border border-white/20`}
          >
            Choose This Seat (Table {selectedSeat.table_code || selectedSeat.table_number} &bull; Seat {selectedSeat.seat_number})
          </button>
        </div>
      )}
    </div>
  );
}
