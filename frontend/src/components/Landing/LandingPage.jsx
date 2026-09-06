import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, MapPin, LogIn, LayoutDashboard } from 'lucide-react';
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
    <CelestialShell>
      {/* Header: emblem + countdown */}
      <header className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 px-5 sm:px-8 pt-6 sm:pt-8">
        <div className="flex items-center gap-3">
          <img
            src="/uclmnsbo.jpg"
            alt="UCLM Nursing Student Body Organization emblem"
            onClick={handleEmblemTap}
            draggable={false}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-[#E7C15A]/40 p-0.5 bg-white/5 backdrop-blur shrink-0 cursor-pointer select-none"
          />
          <div className="flex flex-col">
            <span className="text-[#E7C15A] font-bold tracking-[0.12em] text-[11px] sm:text-xs uppercase leading-tight">
              Nursing Student Body Organization
            </span>
            <span className="text-[#9DB4C7] text-[10px] sm:text-[11px] mt-0.5">
              College of Nursing · University of Cebu Lapu-Lapu and Mandaue
            </span>
          </div>
        </div>

        <div
          className="self-start rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex flex-col items-center backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(231,193,90,0.25)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.2), 0 0 18px rgba(231,193,90,0.08)',
          }}
        >
          <span className="text-[#7FB6C9] text-[9px] sm:text-[10px] tracking-[0.2em] uppercase mb-2.5">
            {started ? 'The celebration is here' : 'The celebration begins in'}
          </span>
          {started ? (
            <span className="font-celestial text-[#E7C15A] text-2xl sm:text-3xl font-semibold">Happening now</span>
          ) : (
            <div className="flex gap-4 sm:gap-6">
              {units.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="font-celestial text-[#E7C15A] text-2xl sm:text-3xl font-semibold leading-none tabular-nums">
                    {value}
                  </span>
                  <span className="text-[#7FB6C9] text-[8px] sm:text-[9px] tracking-[0.16em] uppercase mt-1.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Hero — left-aligned, single-view stack mirroring the event poster */}
      <main className="flex-grow flex flex-col justify-center px-6 sm:px-12 py-4 sm:py-6 w-full max-w-5xl">
        <div className="w-full max-w-2xl flex flex-col items-start text-left">
          {/* Ornate gold lettering — single composed poster PNG (transparent, in
              /public). Height is clamped to viewport height so it always fits one
              screen; alt text carries the headline for screen readers. */}
          <img
            src="/CELESTIAL%20GARDEN.png"
            alt="Nursing Acquaintance 2026 — Celestial Garden: A Night of Wonder and Grace"
            draggable={false}
            className="select-none w-auto max-w-full h-[clamp(13rem,44vh,32rem)] object-contain object-left mb-3 sm:mb-5 drop-shadow-[0_6px_30px_rgba(231,193,90,0.3)]"
          />

          <button
            onClick={() => navigate(cta.to)}
            className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3 sm:px-8 sm:py-3.5 font-bold text-[#0A1A33] text-sm sm:text-base transition-transform active:scale-95 hover:scale-[1.03]"
            style={{
              background: 'linear-gradient(90deg, #F5DE9B 0%, #E7C15A 50%, #C99A3C 100%)',
              boxShadow: '0 0 22px rgba(231,193,90,0.35)',
            }}
          >
            <CtaIcon size={18} />
            {cta.text}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="text-[#9DB4C7] text-[11px] sm:text-xs mt-2.5 opacity-80">
            {isAuthenticated
              ? 'You are signed in.'
              : 'Use the email and access code sent to you by the event organizer.'}
          </p>

          <div
            className="mt-5 sm:mt-7 inline-flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 rounded-2xl sm:rounded-full backdrop-blur-md text-xs sm:text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(231,193,90,0.2)' }}
          >
            <span className="flex items-center gap-2 text-[#F3ECDF]/90">
              <CalendarDays size={16} className="text-[#E7C15A]" />
              September 26, 2026 · Saturday
            </span>
            <span className="hidden sm:block w-px h-4 bg-[#E7C15A]/25" aria-hidden="true" />
            <span className="flex items-center gap-2 text-[#F3ECDF]/90">
              <Clock size={16} className="text-[#E7C15A]" />
              5:00 PM – 10:00 PM
            </span>
            <span className="hidden sm:block w-px h-4 bg-[#E7C15A]/25" aria-hidden="true" />
            <span className="flex items-center gap-2 text-[#F3ECDF]/90">
              <MapPin size={16} className="text-[#E7C15A]" />
              Mactan Expo Center
            </span>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-center pb-6 opacity-60">
        <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#9DB4C7] text-center px-4">
          UCLM College of Nursing · BSN Acquaintance Party 2026
        </p>
      </footer>
    </CelestialShell>
  );
}
