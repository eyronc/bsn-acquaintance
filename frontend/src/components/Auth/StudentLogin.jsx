import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { Toast } from '../UI/Toast';
import { CelestialShell } from '../Landing/CelestialShell';

export function StudentLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Login page always uses the celestial theme, never a society palette
  useEffect(() => {
    document.documentElement.removeAttribute('data-society');
    document.body.removeAttribute('data-society');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, code);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-sm md:text-base font-medium text-[#F3ECDF] bg-white/5 border border-[#E7C15A]/25 placeholder-[#9DB4C7]/40 transition-colors focus:outline-none focus:border-[#E7C15A]/60 focus:ring-1 focus:ring-[#E7C15A]/40';
  const labelClass =
    'block text-[#7FB6C9] text-[11px] font-bold uppercase tracking-[0.14em] mb-2';

  return (
    <CelestialShell>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-md rounded-3xl p-6 sm:p-8 backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(231,193,90,0.25)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 24px rgba(231,193,90,0.08)',
          }}
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7FB6C9] hover:text-[#E7C15A] transition-colors mb-5"
          >
            <ArrowLeft size={13} />
            Back to home
          </button>

          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <img
              src="/uclmnursing.svg"
              alt="UCLM Nursing Emblem"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-contain mx-auto mb-4 p-2 border border-[#E7C15A]/40 bg-white/5"
            />
            <p className="font-celestial italic text-[#F5DE9B]/90 text-sm md:text-base mb-1">
              Nursing Acquaintance 2026
            </p>
            <h1
              className="font-celestial text-[#E7C15A] text-3xl md:text-4xl font-bold tracking-tight"
              style={{ textShadow: '0 0 20px rgba(231,193,90,0.35)' }}
            >
              Celestial Garden
            </h1>
            <p className="text-[#9DB4C7] text-xs md:text-sm mt-2 font-medium">
              Sign in to reserve your seat
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Access Code</label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
              />
              <p className="text-[#9DB4C7]/80 text-xs mt-1.5">
                Check your email for your access code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-full py-3.5 font-bold text-[#0A1A33] text-sm md:text-base inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.98] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(90deg, #F5DE9B 0%, #E7C15A 50%, #C99A3C 100%)',
                boxShadow: '0 0 22px rgba(231,193,90,0.3)',
              }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[#9DB4C7]/70 text-xs mt-6">
            Registration not found? Contact the event organizer.
          </p>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </CelestialShell>
  );
}
