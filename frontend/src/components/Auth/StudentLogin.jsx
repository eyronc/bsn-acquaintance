import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Toast } from '../UI/Toast';

export function StudentLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  return (
    <div className="min-h-screen bg-[#f7e5ee] flex items-center justify-center p-4 md:p-6">
      <div className="neu-flat-lg rounded-3xl p-6 md:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full neu-avatar p-2 object-contain"
            />
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#3b1427] font-heading mb-1 tracking-tight">
            BSN 2026
          </h1>
          <p className="text-rose-600 text-base md:text-lg font-bold">Acquaintance Party</p>
          <p className="text-slate-600 text-xs md:text-sm mt-1 font-medium">Login to Reserve Your Seat</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-[#3b1427] font-semibold mb-2 text-sm">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="neu-input w-full px-4 py-3 rounded-xl text-[#3b1427] placeholder-slate-400 text-sm md:text-base font-medium"
            />
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-[#3b1427] font-semibold mb-2 text-sm">Access Code</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              required
              className="neu-input w-full px-4 py-3 rounded-xl text-[#3b1427] placeholder-slate-400 text-sm md:text-base font-medium"
            />
            <p className="text-slate-600 text-xs mt-1.5">Check your email for your access code</p>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="neu-button-primary w-full mt-6 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
          >
            <LogIn size={20} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6">
          <p className="text-center text-slate-600 text-xs">
            Registration not found? Contact the event organizer
          </p>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}