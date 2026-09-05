import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { LogOut, Map, LayoutDashboard, Armchair, Ticket } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useSeats } from '../../hooks/useSeats';
import { StudentOverview } from './StudentOverview';
import { SeatSelectionView } from './SeatSelectionView';
import { DigitalTicketView } from './DigitalTicketView';
import { ConfirmModal } from './ConfirmModal';
import { FloorPlanModal } from './FloorPlanModal';
import { Toast } from '../UI/Toast';
import { getSocietyTheme, normalizeSocietyName, societyToSlug } from '../../utils/societyTheme';

function formatStudentClass(year, section) {
  const numYear = year ? String(year).replace(/\D/g, '') : '';
  const sec = section ? String(section).replace(/^Section\s*/i, '').trim().toUpperCase() : '';
  return `BSN - ${numYear}${sec}`;
}

export function StudentDashboard({ user, onLogout }) {
  const { seats, loading, error, getUserSeat, reserveSeat, confirmSeatWithAttendee, clearSeat } = useSeats();
  const location = useLocation();
  const { societySlug } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user);
  const [userSeat, setUserSeat] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Determine current active tab from route pathname
  const pathname = location.pathname;
  let currentTab = 'dashboard';
  if (pathname.startsWith('/seats') || societySlug) {
    currentTab = 'seats';
  } else if (pathname === '/pass' || pathname === '/ticket') {
    currentTab = 'pass';
  }

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

  // Fetch user's current seat on mount
  useEffect(() => {
    const fetchUserSeat = async () => {
      const userSeatData = await getUserSeat(user.id);
      if (userSeatData) {
        setUserSeat(userSeatData);
        setSelectedSeat(userSeatData);
      }
    };

    if (user?.id) {
      fetchUserSeat();
    }
  }, [user?.id, getUserSeat]);

  // Synchronize dynamic society theme across HTML & body
  useEffect(() => {
    document.documentElement.setAttribute('data-society', effectiveUserSociety);
    document.body.setAttribute('data-society', effectiveUserSociety);
    return () => {
      document.documentElement.removeAttribute('data-society');
      document.body.removeAttribute('data-society');
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

      setToast({
        message: 'Your seat is confirmed! Generating your digital pass...',
        type: 'success',
      });

      // Automatically navigate student to view their digital ticket pass
      setTimeout(() => {
        navigate('/pass');
      }, 600);
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
          <p className={`${currentTheme.textDark} font-semibold`}>Loading event portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-society={effectiveUserSociety} className={`min-h-screen ${currentTheme.pageBg} ${currentTheme.textDark} transition-colors duration-300`}>
      {/* Fixed Sticky Header */}
      <header className={`no-print sticky top-0 z-30 ${currentTheme.headerBg} backdrop-blur-md border-b ${currentTheme.border} shadow-sm mb-1 sm:mb-2 transition-colors`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-3">
          {/* User Identity & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full neu-avatar object-contain p-1 flex-shrink-0 cursor-pointer"
              onClick={() => navigate('/dashboard')}
              title="Return to Dashboard"
            />
            <div className="min-w-0">
              {/* Mobile View */}
              <div className="sm:hidden min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold ${currentTheme.textDark} font-heading truncate leading-tight`}>
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
                  <span className="text-[10px] font-extrabold text-slate-700 truncate font-mono">
                    {formatStudentClass(profile?.year || profile?.year_level || user?.year || user?.year_level, profile?.section || user?.section)}
                  </span>
                </div>
              </div>

              {/* Tablet & Desktop View */}
              <div className="hidden sm:block min-w-0">
                <h1 className={`text-xl md:text-2xl font-extrabold ${currentTheme.textDark} font-heading truncate leading-tight`}>
                  BSN 2026 <span className="font-extrabold text-sm md:text-base ml-1" style={{ color: currentTheme.accentColor }}>Acquaintance Party</span>
                </h1>
                <div className="flex items-center gap-2 text-slate-600 text-xs md:text-sm truncate font-medium mt-0.5">
                  <strong className="font-bold text-slate-800">{profile?.fullname || user?.fullname}</strong>
                  <span className="font-extrabold text-slate-700 font-mono text-xs px-2 py-0.5 rounded-md bg-black/5 border border-black/5">
                    {formatStudentClass(profile?.year || profile?.year_level || user?.year || user?.year_level, profile?.section || user?.section)}
                  </span>
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

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl neu-pressed border border-[var(--neu-border)]">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'neu-button text-[var(--neu-accent)] shadow-xs scale-[0.98]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/seats')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'seats'
                  ? 'neu-button text-[var(--neu-accent)] shadow-xs scale-[0.98]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Armchair size={14} />
              <span>Seat Selection</span>
            </button>

            <button
              onClick={() => navigate('/pass')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'pass'
                  ? 'neu-button text-[var(--neu-accent)] shadow-xs scale-[0.98]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket size={14} />
              <span>My Ticket</span>
              {isConfirmed && (
                <span 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: currentTheme.accentColor }}
                />
              )}
            </button>
          </nav>

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

      {/* Main Content Area Based on Current Route */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 pt-1 pb-20 md:pt-2 md:pb-8">
        {error && (
          <div className="mb-4 p-4 neu-pressed rounded-2xl text-red-500 text-sm font-semibold text-center max-w-lg mx-auto">
            Error: {error}
          </div>
        )}

        {currentTab === 'seats' && (
          <SeatSelectionView
            seats={seats}
            selectedSeat={selectedSeat}
            onSeatSelect={handleSeatSelect}
            userSeat={userSeat}
            currentUserId={user?.id}
            effectiveUserSociety={effectiveUserSociety}
            currentTheme={currentTheme}
            onOpenConfirmModal={() => setShowConfirmModal(true)}
          />
        )}

        {currentTab === 'pass' && (
          <DigitalTicketView
            user={user}
            profile={profile}
            userSeat={userSeat}
            currentTheme={currentTheme}
            effectiveUserSociety={effectiveUserSociety}
            onOpenFloorPlan={() => setShowFloorPlanModal(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <StudentOverview
            user={user}
            profile={profile}
            userSeat={userSeat}
            seats={seats}
            currentTheme={currentTheme}
            effectiveUserSociety={effectiveUserSociety}
            onOpenFloorPlan={() => setShowFloorPlanModal(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb friendly on phones - Hidden when printing) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--neu-bg)]/95 backdrop-blur-md border-t border-[var(--neu-border)] px-4 py-2 flex items-center justify-around shadow-xl">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'text-[var(--neu-accent)] scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/seats')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
            currentTab === 'seats'
              ? 'text-[var(--neu-accent)] scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Armchair size={18} />
          <span>Seats</span>
        </button>

        <button
          onClick={() => navigate('/pass')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-extrabold transition-all relative cursor-pointer ${
            currentTab === 'pass'
              ? 'text-[var(--neu-accent)] scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket size={18} />
          <span>My Ticket</span>
          {isConfirmed && (
            <span 
              className="absolute top-0 right-2 w-2 h-2 rounded-full ring-2" 
              style={{
                backgroundColor: currentTheme.accentColor,
                borderColor: currentTheme.badge.border,
              }}
            />
          )}
        </button>
      </nav>

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

      {/* Toast Notification — raised above the sticky "Choose this seat" bar so they don't overlap */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          raised={Boolean(selectedSeat && !isConfirmed)}
        />
      )}
    </div>
  );
}