import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Toast } from '../UI/Toast';
import { CelestialShell } from '../Landing/CelestialShell';

export function AdminLogin({ onLogin, onBackToStudent }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Admin login always uses the celestial theme, never a society palette
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(password);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={onBackToStudent}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7FB6C9] hover:text-[#E7C15A] transition-colors mb-5"
          >
            <ArrowLeft size={13} />
            Back to student login
          </button>

          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-4">
              <img
                src="/uclmnursing.svg"
                alt="UCLM Nursing Emblem"
                className="w-full h-full rounded-full object-contain p-2 border border-[#E7C15A]/40 bg-white/5"
              />
              <div className="absolute -bottom-1 right-1/4 bg-gradient-to-br from-[#F5DE9B] to-[#C99A3C] text-[#0A1A33] p-1.5 rounded-full border border-[#0A1A33]/20 shadow-md flex items-center justify-center">
                <Lock size={14} className="stroke-[2.5]" />
              </div>
            </div>
            <h1
              className="font-celestial text-[#E7C15A] text-3xl md:text-4xl font-bold tracking-tight"
              style={{ textShadow: '0 0 20px rgba(231,193,90,0.35)' }}
            >
              Admin Portal
            </h1>
            <p className="text-[#9DB4C7] text-xs md:text-sm mt-2 font-medium">
              BSN Acquaintance Party 2026 · Celestial Garden
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-[#7FB6C9] text-[11px] font-bold uppercase tracking-[0.14em] mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm md:text-base font-medium text-[#F3ECDF] bg-white/5 border border-[#E7C15A]/25 placeholder-[#9DB4C7]/40 transition-colors focus:outline-none focus:border-[#E7C15A]/60 focus:ring-1 focus:ring-[#E7C15A]/40"
              />
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
              <Lock size={18} />
              {loading ? 'Verifying…' : 'Enter Admin Panel'}
            </button>
          </form>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </CelestialShell>
  );
}
