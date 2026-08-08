import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Toast } from '../UI/Toast';

export function AdminLogin({ onLogin, onBackToStudent }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
    <div className="min-h-screen bg-[#f7e5ee] flex items-center justify-center p-4 md:p-6">
      <div className="neu-flat-lg rounded-3xl p-6 md:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-4 relative">
            <img 
              src="/uclmnursing.svg" 
              alt="UCLM Nursing Emblem" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full neu-avatar p-2 object-contain"
            />
            <div className="absolute bottom-0 right-1/3 bg-rose-600 text-white p-1.5 rounded-full neu-flat-sm">
              <Lock size={16} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3b1427] font-heading mb-1">Admin Portal</h1>
          <p className="text-rose-600 font-bold text-xs md:text-sm">BSN Acquaintance Party 2026</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-[#3b1427] font-semibold mb-2 text-sm">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="neu-input w-full px-4 py-3 rounded-xl text-[#3b1427] placeholder-slate-400 text-sm md:text-base font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neu-button-primary w-full mt-6 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
          >
            <Lock size={18} />
            {loading ? 'Verifying...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}