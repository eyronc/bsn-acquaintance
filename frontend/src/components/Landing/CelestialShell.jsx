import React from 'react';

// Shared "Celestial Garden" backdrop — midnight gradient, radial glow, twinkling
// starfield, drifting line-art butterflies and floating fireflies. Used by the
// landing page and the auth pages.

const SPARKLES = [
  { top: '13%', left: '17%', delay: '0s' },
  { top: '21%', left: '67%', delay: '1s' },
  { top: '57%', left: '84%', delay: '.5s' },
  { top: '79%', left: '12%', delay: '1.5s' },
  { top: '39%', left: '43%', delay: '2s' },
  { top: '31%', left: '88%', delay: '.8s' },
  { top: '66%', left: '31%', delay: '1.2s' },
  { top: '10%', left: '50%', delay: '2.4s' },
];

// Fireflies drift from top to bottom with a gentle side-to-side wobble. Each is
// seeded deterministically so the field is stable across renders. Negative delays
// stagger them so the screen is already full on first paint.
const FIREFLIES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`,
  size: 2 + (i % 3),
  duration: `${12 + (i % 8) * 2.5}s`,
  delay: `-${(i * 2.3) % 18}s`,
  bright: i % 4 === 0,
}));

function Butterfly({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 50 C20 10, 0 40, 50 50 C0 60, 20 90, 50 50 C80 90, 100 60, 50 50 C100 40, 80 10, 50 50 Z"
        fill="none"
        stroke="#E7C15A"
        strokeWidth="1"
      />
    </svg>
  );
}

export function CelestialShell({ children, className = '' }) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden text-[#F3ECDF] ${className}`}
      style={{ background: 'linear-gradient(135deg, #0A1A33 0%, #10314A 55%, #0C2036 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 28% 62%, rgba(231,193,90,0.16) 0%, transparent 60%)' }}
        aria-hidden="true"
      />
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="pointer-events-none absolute w-[3px] h-[3px] rounded-full bg-[#F3ECDF] animate-celestial-twinkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          aria-hidden="true"
        />
      ))}

      {/* Floating fireflies */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="celestial-firefly"
            style={{
              left: f.left,
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDuration: f.duration,
              animationDelay: f.delay,
              boxShadow: f.bright
                ? '0 0 8px 2px rgba(252,233,184,0.8), 0 0 16px 4px rgba(231,193,90,0.4)'
                : '0 0 5px 1px rgba(252,233,184,0.6), 0 0 10px 3px rgba(231,193,90,0.28)',
            }}
          />
        ))}
      </div>
      <Butterfly className="pointer-events-none absolute top-[17%] right-[8%] w-10 opacity-15 rotate-[-15deg]" />
      <Butterfly className="pointer-events-none absolute bottom-[24%] left-[5%] w-16 opacity-10 rotate-[22deg]" />
      <Butterfly className="pointer-events-none absolute top-[52%] left-[30%] w-8 opacity-[0.08] rotate-[-40deg]" />

      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
