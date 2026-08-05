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
      setToast({ message: 'Seat reserved! Click "Confirm" to finalize.', type: 'info' });
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
        message: '🎉 Your seat is confirmed! See you at the party!',
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
      <div className="min-h-screen bg-gradient-to-br from-enchant-cream via-enchant-pink via-enchant-lavender to-enchant-sage flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-enchant-pink border-t-enchant-lavender rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-enchant-plum font-semibold">Loading the magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-enchant-cream via-enchant-pink via-enchant-lavender to-enchant-sage">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur border-b border-enchant-gold border-opacity-30 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-enchant-pink to-enchant-lavender font-enchant truncate">
              ✨ BSN 2026 ✨
            </h1>
            <p className="text-enchant-gold text-xs md:text-sm truncate">Welcome, {user.fullname}!</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-enchant-pink text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm md:text-base whitespace-nowrap"
          >
            <LogOut size={16} className="md:w-[18px]" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}

        {isConfirmed ? (
          // Confirmed State
          <div className="text-center space-y-6">
            <div className="p-8 bg-white bg-opacity-90 rounded-3xl border-4 border-dashed border-enchant-gold shadow-lg">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-enchant-pink font-enchant mb-4">
                Your Seat is Confirmed!
              </h2>
              <div className="bg-enchant-light p-6 rounded-2xl mb-6 inline-block">
                <p className="text-enchant-plum mb-2">Your Reserved Seat:</p>
                <p className="text-3xl font-bold text-enchant-pink font-enchant">
                  Table {userSeat.table_number} • Seat {userSeat.seat_number}
                </p>
              </div>
              <p className="text-enchant-gold text-lg">
                See you at the BSN Acquaintance Party 2026! ✨
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

            {/* Confirm Button */}
            {selectedSeat && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-enchant-pink to-enchant-lavender text-white font-bold rounded-xl hover:shadow-xl transition-all text-lg"
                >
                  Confirm This Seat
                </button>
              </div>
            )}
          </>
        )}
      </main>

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
