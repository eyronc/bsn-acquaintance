import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, MapPin, LogIn, LayoutDashboard, KeyRound } from 'lucide-react';
import { EVENT_START, getCountdownParts } from '../../utils/eventDate';
import { CelestialShell } from './CelestialShell';

const pad = (n) => String(n).padStart(2, '0');
const EMBLEM_TAPS_TO_ADMIN = 3;

export function LandingPage({ isAuthenticated = false, isAdmin = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(() => Date.now());

  // Easter egg: tap the NSBO emblem 3x to jump to the admin login. Resets on
  // route change. A ref (not state) keeps the count off the render path.
  const emblemTaps = useRef(0);
  useEffect(() => {
    emblemTaps.current = 0;
  }, [location.pathname]);

  const handleEmblemTap = () => {
    emblemTaps.current += 1;
    if (emblemTaps.current >= EMBLEM_TAPS_TO_ADMIN) {
      emblemTaps.current = 0;
      navigate('/admin');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'celestial');
    document.body.setAttribute('data-theme', 'celestial');
    document.documentElement.removeAttribute('data-society');
    document.body.removeAttribute('data-society');
    return () => {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = EVENT_START.getTime() - now;
  const started = diff <= 0;
  const { days, hours, minutes, seconds } = getCountdownParts(diff);
  const units = [
    { value: String(days), label: 'Days' },
    { value: pad(hours), label: 'Hours' },
    { value: pad(minutes), label: 'Minutes' },
    { value: pad(seconds), label: 'Seconds' },
  ];

  const cta = isAuthenticated
    ? isAdmin
      ? { to: '/admin/panel', text: 'Open Admin Panel', Icon: LayoutDashboard }
      : { to: '/dashboard', text: 'Enter Your Dashboard', Icon: LayoutDashboard }
    : { to: '/login', text: 'Reserve Your Seat', Icon: LogIn };
  const CtaIcon = cta.Icon;

  return (
    <CelestialShell className="min-h-screen w-full flex flex-col justify-start">
      {/* Background Celestial Astrolabe Ornament (Desktop only, balances the right side) */}
      <div
        className="pointer-events-none hidden md:block absolute right-[-4%] lg:right-[2%] top-[20%] lg:top-[15%] w-[420px] lg:w-[540px] h-[420px] lg:h-[540px] select-none opacity-20 lg:opacity-30"
        style={{ animation: 'spin 200s linear infinite' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 500 500" fill="none" className="w-full h-full">
          {/* Concentric Celestial Rings */}
          <circle cx="250" cy="250" r="230" stroke="#E7C15A" strokeWidth="1" strokeDasharray="3 6" opacity="0.6" />
          <circle cx="250" cy="250" r="210" stroke="#E7C15A" strokeWidth="1.2" opacity="0.4" />
          <circle cx="250" cy="250" r="170" stroke="#E7C15A" strokeWidth="1" strokeDasharray="8 8" opacity="0.5" />
          <circle cx="250" cy="250" r="120" stroke="#E7C15A" strokeWidth="1.5" opacity="0.6" />
          <circle cx="250" cy="250" r="70" stroke="#E7C15A" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
          <circle cx="250" cy="250" r="20" stroke="#E7C15A" strokeWidth="1.5" fill="rgba(231,193,90,0.1)" />

          {/* Planetary Orbits */}
          <ellipse cx="250" cy="250" rx="230" ry="110" stroke="#E7C15A" strokeWidth="1" opacity="0.35" transform="rotate(-30 250 250)" />
          <ellipse cx="250" cy="250" rx="230" ry="110" stroke="#E7C15A" strokeWidth="1" opacity="0.35" transform="rotate(45 250 250)" />

          {/* Golden Star Nodes */}
          <circle cx="250" cy="20" r="3" fill="#F5DE9B" />
          <circle cx="480" cy="250" r="3.5" fill="#F5DE9B" />
          <circle cx="250" cy="480" r="2.5" fill="#F5DE9B" />
          <circle cx="20" cy="250" r="3" fill="#F5DE9B" />
          <circle cx="398" cy="102" r="3" fill="#F5DE9B" />
          <circle cx="102" cy="398" r="2.5" fill="#F5DE9B" />
          <circle cx="370" cy="370" r="3" fill="#F5DE9B" />
          <circle cx="130" cy="130" r="3" fill="#F5DE9B" />

          {/* Center 8-point compass */}
          <path d="M250 215 L254 246 L285 250 L254 254 L250 285 L246 254 L215 250 L246 246 Z" fill="#E7C15A" opacity="0.75" />
        </svg>
      </div>
      <div className="pointer-events-none hidden md:block absolute right-[3%] top-[18%] w-[480px] h-[480px] rounded-full bg-[#E7C15A]/[0.05] blur-3xl select-none" aria-hidden="true" />
      {/* Header: emblem + countdown */}
      <header className="w-full flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-4 px-5 sm:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-center sm:justify-start gap-3 self-center sm:self-auto">
          <img
            src="/uclmnsbo.jpg"
            alt="UCLM Nursing Student Body Organization emblem"
            onClick={handleEmblemTap}
            draggable={false}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-[#E7C15A]/40 p-0.5 bg-white/5 backdrop-blur shrink-0 cursor-pointer select-none"
          />
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-[#E7C15A] font-bold tracking-[0.12em] text-[11px] sm:text-xs uppercase leading-tight text-center sm:text-left">
              Nursing Student Body Organization
            </span>
            <span className="text-[#9DB4C7] text-[10px] sm:text-[11px] mt-0.5 text-center sm:text-left">
              University of Cebu - Lapu-Lapu and Mandaue Campus
            </span>
          </div>
        </div>

        <div
          className="self-center sm:self-auto rounded-2xl px-4 py-3 sm:px-6 sm:py-4 md:px-7 md:py-5 flex flex-col items-center neu-flat-lg border border-[#E7C15A]/30 border-t-2 border-t-[#E7C15A]/70 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        >
          <span className="text-[#7FB6C9] text-[9px] sm:text-[11px] tracking-[0.2em] uppercase mb-2.5 sm:mb-3">
            {started ? 'The celebration is here' : 'The celebration begins in'}
          </span>
          {started ? (
            <span className="font-celestial text-[#E7C15A] text-2xl sm:text-4xl font-semibold">Happening now</span>
          ) : (
            <div className="flex gap-2.5 sm:gap-4 md:gap-6">
              {units.map(({ value, label }) => (
                <div key={label} className={`flex flex-col items-center neu-pressed px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl min-w-[50px] sm:min-w-[64px] border transition-all ${label === 'Seconds' ? 'border-[#E7C15A]/40 shadow-[0_0_12px_rgba(231,193,90,0.18)]' : 'border-[#E7C15A]/10'}`}>
                  <span className={`font-celestial text-xl sm:text-3xl md:text-4xl font-semibold leading-none tabular-nums ${label === 'Seconds' ? 'text-[#F5DE9B]' : 'text-[#E7C15A]'}`}>
                    {value}
                  </span>
                  <span className="text-[#7FB6C9] text-[8px] sm:text-[10px] tracking-[0.16em] uppercase mt-1">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Hero — left-aligned, single-view stack mirroring the event poster */}
      <main className="flex-grow flex flex-col justify-start items-center sm:items-start px-6 sm:px-8 pt-1 sm:pt-2 pb-4 sm:pb-6 w-full max-w-5xl">
        <div className="w-full max-w-2xl flex flex-col items-center sm:items-start text-center sm:text-left">
          {/* Ornate gold lettering � centered on mobile, left on desktop */}
          <img
            src="/CELESTIALGARDEN.svg"
            alt="Nursing Acquaintance 2026 � Celestial Garden: A Night of Wonder and Grace"
            draggable={false}
            className="select-none w-auto max-w-full h-[clamp(12rem,40vh,30rem)] object-contain object-center sm:object-left mb-3 sm:mb-4 drop-shadow-[0_6px_30px_rgba(231,193,90,0.3)]"
          />

          <button
            onClick={() => navigate(cta.to)}
            className="group btn-shimmer inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 sm:px-8 sm:py-3.5 font-bold text-[#0A1A33] text-sm sm:text-base transition-transform active:scale-95 hover:scale-[1.03]"
            style={{
              background: 'linear-gradient(90deg, #F5DE9B 0%, #E7C15A 50%, #C99A3C 100%)',
              boxShadow: '0 0 22px rgba(231,193,90,0.35)',
            }}
          >
            <CtaIcon size={18} />
            {cta.text}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <div className="mt-2.5 flex items-center justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-[#C5D5E4] bg-[#0F2A44]/80 border border-[#E7C15A]/25 backdrop-blur-md shadow-sm whitespace-nowrap">
              {!isAuthenticated && <KeyRound size={12} className="text-[#E7C15A] shrink-0" />}
              <span>
                {isAuthenticated
                  ? 'You are signed in.'
                  : 'Use your email & event access code'}
              </span>
            </span>
          </div>

          <div
            className="mt-5 sm:mt-7 inline-flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 px-5 py-3 rounded-2xl sm:rounded-full backdrop-blur-md text-xs sm:text-sm neu-flat border border-[#E7C15A]/20"
          >
            <span className="flex items-center gap-2 text-[#F3ECDF]/90">
              <CalendarDays size={16} className="text-[#E7C15A]" />
              September 26, 2026 &bull; Saturday
            </span>
            <span className="hidden sm:block w-px h-4 bg-[#E7C15A]/25" aria-hidden="true" />
            <span className="flex items-center gap-2 text-[#F3ECDF]/90">
              <Clock size={16} className="text-[#E7C15A]" />
              5:00 PM &ndash; 10:00 PM
            </span>
            <span className="hidden sm:block w-px h-4 bg-[#E7C15A]/25" aria-hidden="true" />
            <span className="flex items-center gap-2 text-[#F3ECDF]/90">
              <MapPin size={16} className="text-[#E7C15A]" />
              Mactan Expo Center
            </span>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-center py-3 opacity-70">
        <p className="text-[9.5px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] uppercase text-[#9DB4C7] text-center px-4 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2">
          <span>UCLM College of Nursing</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>BSN Acquaintance Party 2026</span>
        </p>
      </footer>
    </CelestialShell>
  );
}
