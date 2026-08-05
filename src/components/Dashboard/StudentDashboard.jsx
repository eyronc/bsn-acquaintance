import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useSeats } from '../../hooks/useSeats';
import { SeatMap } from './SeatMap';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from '../UI/Toast';

export function StudentDashboard({ user, onLogout }) {
  const { seats, loading, error, getUserSeat, reserveSeat, confirmSeat } = useSeats();
  const [userSeat, setUserSeat] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch user's current seat on mount
  useEffect(() => {
    const fetchUserSeat = async () => {
      const userSeatData = await getUserSeat(user.id);
      setUserSeat(userSeatData);
      if (userSeatData) {
        setSelectedSeat(userSeatData);
      }
    };

    if (user?.id) {
      fetchUserSeat();
    }
  }, [user?.id, getUserSeat]);

  const handleSeatSelect = async (seat) => {
    if (userSeat?.status === 'confirmed') {
      setToast({ message: 'Your seat is already confirmed!', type: 'info' });
      return;
    }

    setSelectedSeat(seat);

    // Auto-reserve the seat
    try {
      await reserveSeat(seat.id, user.id);
      setToast({ message: 'Seat reserved! Click "Choose this seat" to confirm.', type: 'info' });
    } catch (err) {
      setToast({ message: 'Failed to reserve seat', type: 'error' });
    }
  };

  const handleConfirmSeat = async () => {
    setConfirmLoading(true);
    try {
      await confirmSeat(selectedSeat.id);
      setUserSeat({ ...selectedSeat, status: 'confirmed' });
      setShowConfirmModal(false);
      setToast({
        message: 'Your seat is confirmed! See you at the party!',
        type: 'success',
      });
    } catch (err) {
      setToast({ message: 'Failed to confirm seat', type: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  };

  const isConfirmed = userSeat?.status === 'confirmed';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7e5ee] flex items-center justify-center">
        <div className="text-center neu-flat p-8 rounded-3xl">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3b1427] font-semibold">Loading seat map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7e5ee] text-[#3b1427]">
      {/* Header - Tactile Extruded Top Bar */}
      <header className="neu-flat sticky top-0 z-40 mx-2 md:mx-6 my-2 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-11 h-11 md:w-12 md:h-12 rounded-full neu-avatar object-contain p-1 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-extrabold text-[#3b1427] font-heading truncate tracking-tight">
                BSN 2026 <span className="text-rose-600 font-extrabold text-sm md:text-base ml-1">Acquaintance Party</span>
              </h1>
              <p className="text-slate-500 text-xs md:text-sm truncate font-medium">Welcome, {user.fullname}!</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="neu-button px-3.5 md:px-5 py-2 text-[#3b1427] hover:text-rose-600 font-semibold rounded-xl text-xs md:text-sm flex items-center gap-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {error && (
          <div className="mb-6 p-4 neu-pressed rounded-2xl text-rose-600 text-sm font-semibold">
            Error: {error}
          </div>
        )}

        {isConfirmed ? (
          // Confirmed State
          <div className="text-center space-y-8">
            <div className="p-8 max-w-xl mx-auto neu-flat-lg rounded-3xl">
              <h2 className="text-2xl md:text-4xl font-extrabold text-rose-600 font-heading mb-4">
                Your Seat is Confirmed!
              </h2>
              <div className="neu-pressed px-6 py-4 rounded-2xl mb-6 inline-block">
                <p className="text-slate-500 text-sm mb-1 font-medium">Your Reserved Seat</p>
                <p className="text-2xl md:text-3xl font-extrabold text-rose-600 font-heading">
                  Table {userSeat.table_number} • Seat {userSeat.seat_number}
                </p>
              </div>
              <p className="text-slate-600 text-base md:text-lg font-medium">
                See you at the BSN Acquaintance Party 2026!
              </p>
            </div>

            {/* Show seat map in read-only mode */}
            <SeatMap seats={seats} selectedSeat={null} onSeatSelect={() => {}} userSeat={userSeat} />
          </div>
        ) : (
          // Seat Selection State
          <>
            <SeatMap
              seats={seats}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              userSeat={userSeat}
            />
          </>
        )}
      </main>

      {/* Sticky "Choose this seat" button */}
      {selectedSeat && !isConfirmed && (
        <button
          onClick={() => setShowConfirmModal(true)}
          className="fixed bottom-6 right-6 z-30 px-6 py-3.5 neu-button-primary text-white font-bold rounded-2xl text-sm md:text-base animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          Choose This Seat (Table {selectedSeat.table_number} • Seat {selectedSeat.seat_number})
        </button>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        seat={selectedSeat}
        onConfirm={handleConfirmSeat}
        onCancel={() => setShowConfirmModal(false)}
        loading={confirmLoading}
      />

      {/* Toast Notifications */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
