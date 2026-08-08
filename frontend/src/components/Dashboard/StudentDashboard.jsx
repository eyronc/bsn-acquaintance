import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useSeats } from '../../hooks/useSeats';
import { SeatMap } from './SeatMap';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from '../UI/Toast';
import { sendSeatConfirmationEmail } from '../../services/emailService';

export function StudentDashboard({ user, onLogout }) {
  const { seats, loading, error, getUserSeat, reserveSeat, confirmSeatWithAttendee, clearSeat } = useSeats();
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

    // Deselecting seat
    if (!seat) {
      if (selectedSeat) {
        const prevId = selectedSeat.id;
        setSelectedSeat(null);
        try {
          await clearSeat(prevId);
          setToast({ message: 'Seat selection cleared.', type: 'info' });
        } catch (err) {}
      }
      return;
    }

    const prevSeatId = selectedSeat?.id;

    // Toggling the same seat off
    if (prevSeatId === seat.id) {
      setSelectedSeat(null);
      try {
        await clearSeat(seat.id);
        setToast({ message: 'Seat selection cleared.', type: 'info' });
      } catch (err) {}
      return;
    }

    // Clear previous seat if switching to a new seat
    if (prevSeatId && prevSeatId !== seat.id) {
      try {
        await clearSeat(prevSeatId);
      } catch (err) {}
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
      // Call confirmSeatWithAttendee to update both tables
      await confirmSeatWithAttendee(selectedSeat.id, user.id);
      setUserSeat({ ...selectedSeat, status: 'confirmed' });
      setShowConfirmModal(false);

      // Send confirmation email
      const emailResult = await sendSeatConfirmationEmail(
        user,
        selectedSeat.table_number,
        selectedSeat.seat_number
      );

      if (emailResult.success) {
        setToast({
          message: 'Your seat is confirmed! Confirmation email sent.',
          type: 'success',
        });
      } else {
        setToast({
          message: 'Your seat is confirmed! (Email: check console)',
          type: 'success',
        });
        console.warn('Seat confirmation email:', emailResult.message);
      }
    } catch (err) {
      console.error('Error confirming seat:', err);
      setToast({ message: 'Failed to confirm seat: ' + err.message, type: 'error' });
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
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#f7e5ee]/95 backdrop-blur-md border-b border-rose-200/60 shadow-sm mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full neu-avatar object-contain p-1 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm xs:text-base sm:text-2xl font-extrabold text-[#3b1427] font-heading truncate leading-tight">
                BSN 2026 <span className="text-rose-600 font-extrabold text-xs sm:text-base ml-0.5 sm:ml-1">Acquaintance Party</span>
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-sm truncate font-medium">Welcome, {user.fullname}!</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="neu-button px-3 sm:px-5 py-2 text-[#3b1427] hover:text-rose-600 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shrink-0 active:scale-95 transition-transform"
            aria-label="Logout"
          >
            <LogOut size={16} className="text-rose-600 shrink-0" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 md:py-8">
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
            <SeatMap seats={seats} selectedSeat={null} onSeatSelect={() => {}} userSeat={userSeat} currentUserId={user?.id} />
          </div>
        ) : (
          // Seat Selection State
          <>
            <SeatMap
              seats={seats}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              userSeat={userSeat}
              currentUserId={user?.id}
            />
          </>
        )}
      </main>

      {/* Sticky "Choose this seat" action bar */}
      {selectedSeat && !isConfirmed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-md sm:w-auto">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto px-6 py-3.5 neu-button-primary text-white font-bold rounded-2xl text-sm md:text-base shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Choose This Seat (Table {selectedSeat.table_number} • Seat {selectedSeat.seat_number})
          </button>
        </div>
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