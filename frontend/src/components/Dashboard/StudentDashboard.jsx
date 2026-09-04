import React, { useState, useEffect } from 'react';
import { LogOut, Map } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSeats } from '../../hooks/useSeats';
import { SeatMap } from './SeatMap';
import { ConfirmModal } from './ConfirmModal';
import { FloorPlanModal } from './FloorPlanModal';
import { Toast } from '../UI/Toast';
import { sendSeatConfirmationEmail } from '../../services/emailService';
import { getSocietyTheme } from '../../utils/societyTheme';

export function StudentDashboard({ user, onLogout }) {
  const { seats, loading, error, getUserSeat, reserveSeat, confirmSeatWithAttendee, clearSeat } = useSeats();
  const [profile, setProfile] = useState(user);
  const [userSeat, setUserSeat] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch fresh attendee data from Supabase to guarantee exact society from database
  useEffect(() => {
    if (!user?.id) return;
    const fetchFreshProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('attendees')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data && !error) {
          setProfile(data);
          localStorage.setItem('bsn_user', JSON.stringify({ ...user, ...data, role: 'student' }));
        }
      } catch (e) {
        console.warn('Could not refresh profile from DB:', e.message);
      }
    };
    fetchFreshProfile();
  }, [user?.id]);

  const effectiveUserSociety = profile?.society || user?.society || 'Society A';
  const currentTheme = getSocietyTheme(effectiveUserSociety);

  // Fetch user's current seat on mount (or seed Aaron Cumahig Table B-02 Seat 6)
  useEffect(() => {
    const fetchUserSeat = async () => {
      const userSeatData = await getUserSeat(user.id);
      if (userSeatData) {
        setUserSeat(userSeatData);
        setSelectedSeat(userSeatData);
      } else if (user?.fullname?.toLowerCase().includes('aaron') && user?.fullname?.toLowerCase().includes('cumahig')) {
        // Default reservation for Aaron Cumahig: Table B-02, Seat 6
        const aaronSeat = {
          id: 'table-B-02-seat-06',
          table_code: 'B-02',
          table_number: 2,
          seat_number: 6,
          society: 'Society B',
          status: 'confirmed',
          attendee_id: user.id,
        };
        setUserSeat(aaronSeat);
        setSelectedSeat(aaronSeat);
      }
    };

    if (user?.id) {
      fetchUserSeat();
    }
  }, [user?.id, user?.fullname, getUserSeat]);

  // Synchronize dynamic society theme across HTML & body
  useEffect(() => {
    document.documentElement.setAttribute('data-society', effectiveUserSociety);
    return () => {
      document.documentElement.removeAttribute('data-society');
    };
  }, [effectiveUserSociety]);

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
      <div className={`min-h-screen ${currentTheme.pageBg} flex items-center justify-center`}>
        <div className="text-center neu-flat p-8 rounded-3xl">
          <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ color: currentTheme.accentColor }}></div>
          <p className={`${currentTheme.textDark} font-semibold`}>Loading seat map...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-society={effectiveUserSociety} className={`min-h-screen ${currentTheme.pageBg} ${currentTheme.textDark} transition-colors duration-300`}>
      {/* Fixed Sticky Header - z-30 so FloorPlanModal at z-[9999] completely covers it */}
      <header className={`sticky top-0 z-30 ${currentTheme.headerBg} backdrop-blur-md border-b ${currentTheme.border} shadow-sm mb-3 sm:mb-6 transition-colors`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-3">
          {/* User Identity & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full neu-avatar object-contain p-1 flex-shrink-0"
            />
            <div className="min-w-0">
              {/* Mobile View: High-contrast, clean student identity without long clipping text */}
              <div className="sm:hidden min-w-0">
                <p className={`text-sm font-extrabold ${currentTheme.textDark} font-heading truncate leading-tight`}>
                  {profile?.fullname || user?.fullname}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className="px-2 py-0.5 font-extrabold text-[10px] rounded-md border shadow-xs"
                    style={{
                      backgroundColor: currentTheme.badge.bg,
                      color: currentTheme.badge.text,
                      borderColor: currentTheme.badge.border
                    }}
                  >
                    {effectiveUserSociety}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold truncate">
                    BSN 2026
                  </span>
                </div>
              </div>

              {/* Tablet & Desktop View */}
              <div className="hidden sm:block min-w-0">
                <h1 className={`text-xl md:text-2xl font-extrabold ${currentTheme.textDark} font-heading truncate leading-tight`}>
                  BSN 2026 <span className="font-extrabold text-sm md:text-base ml-1" style={{ color: currentTheme.accentColor }}>Acquaintance Party</span>
                </h1>
                <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm truncate font-medium mt-0.5">
                  <span>Welcome, <strong>{profile?.fullname || user?.fullname}</strong>!</span>
                  <span 
                    className="px-2.5 py-0.5 font-extrabold text-[11px] rounded-full border shadow-xs transition-all"
                    style={{
                      backgroundColor: currentTheme.badge.bg,
                      color: currentTheme.badge.text,
                      borderColor: currentTheme.badge.border
                    }}
                  >
                    {effectiveUserSociety}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowFloorPlanModal(true)}
              className={`neu-button px-2.5 sm:px-4 py-2 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border ${currentTheme.border} active:scale-95 transition-transform cursor-pointer shadow-sm`}
              title="View Stage & Floor Plan"
              style={{ color: currentTheme.subtext }}
            >
              <Map size={16} className="shrink-0" />
              <span className="font-bold hidden md:inline">Floor Plan</span>
            </button>

            <button
              onClick={onLogout}
              className={`neu-button px-2.5 sm:px-4 py-2 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border ${currentTheme.border} active:scale-95 transition-transform cursor-pointer shadow-sm`}
              aria-label="Logout"
              title="Logout"
              style={{ color: currentTheme.textDark }}
            >
              <LogOut size={16} className="shrink-0" />
              <span className="font-bold hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-3 md:py-6">
        {error && (
          <div className="mb-6 p-4 neu-pressed rounded-2xl text-red-500 text-sm font-semibold text-center max-w-lg mx-auto">
            Error: {error}
          </div>
        )}

        {isConfirmed ? (
          // Confirmed State - Fully Centered and Adapted to Society Theme
          <div className="text-center space-y-6 sm:space-y-8 flex flex-col items-center justify-center">
            <div className={`p-5 sm:p-8 w-full max-w-lg mx-auto neu-flat-lg rounded-3xl text-center ${currentTheme.cardBg} border ${currentTheme.border}`}>
              <h2 className={`text-2xl md:text-3xl font-extrabold font-heading mb-3 sm:mb-4 ${currentTheme.textDark}`}>
                Your Seat is Confirmed!
              </h2>
              <div className={`neu-pressed px-4 sm:px-6 py-3 sm:py-4 rounded-2xl mb-4 sm:mb-6 inline-block max-w-full border ${currentTheme.border}`}>
                <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium">Your Reserved Seat &bull; {effectiveUserSociety}</p>
                <p className={`text-xl sm:text-3xl font-extrabold font-heading ${currentTheme.textDark}`}>
                  Table {userSeat.table_code || userSeat.table_number} • Seat {userSeat.seat_number}
                </p>
              </div>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                See you at the BSN Acquaintance Party 2026!
              </p>
            </div>

            {/* Show seat map in read-only mode */}
            <div className="w-full">
              <SeatMap
                seats={seats}
                selectedSeat={null}
                onSeatSelect={() => {}}
                userSeat={userSeat}
                currentUserId={user?.id}
                userSociety={effectiveUserSociety}
              />
            </div>
          </div>
        ) : (
          // Seat Selection State
          <div className="w-full">
            <SeatMap
              seats={seats}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              userSeat={userSeat}
              currentUserId={user?.id}
              userSociety={effectiveUserSociety}
            />
          </div>
        )}
      </main>

      {/* Sticky "Choose this seat" action bar */}
      {selectedSeat && !isConfirmed && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-md sm:w-auto flex justify-center mx-auto">
          <button
            onClick={() => setShowConfirmModal(true)}
            className={`w-full sm:w-auto px-6 py-3.5 ${currentTheme.buttonPrimary} font-bold rounded-2xl text-sm md:text-base shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform`}
          >
            Choose This Seat (Table {selectedSeat.table_code || selectedSeat.table_number} • Seat {selectedSeat.seat_number})
          </button>
        </div>
      )}

      {/* Floor Plan Modal */}
      <FloorPlanModal
        isOpen={showFloorPlanModal}
        onClose={() => setShowFloorPlanModal(false)}
        society={effectiveUserSociety}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        seat={selectedSeat}
        onConfirm={handleConfirmSeat}
        onCancel={() => setShowConfirmModal(false)}
        loading={confirmLoading}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}