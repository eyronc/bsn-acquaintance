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

  // Dev mode: Skip admin login
  const handleDevSkip = () => {
    const adminUser = { 
      id: 'dev-admin', 
      fullname: 'Dev Admin', 
      email: 'dev-admin@example.com', 
      role: 'admin' 
    };
    localStorage.setItem('bsn_user', JSON.stringify(adminUser));
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-enchant-cream via-enchant-pink via-enchant-lavender to-enchant-sage flex items-center justify-center p-4 md:p-6">
      {/* Decorative background elements */}
      <div className="absolute top-5 md:top-10 left-5 md:left-10 w-16 md:w-20 h-16 md:h-20 bg-enchant-gold opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 md:bottom-20 right-5 md:right-20 w-24 md:w-32 h-24 md:h-32 bg-enchant-pink opacity-15 rounded-full blur-3xl"></div>

      <div className="bg-white bg-opacity-95 backdrop-blur rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-enchant-gold border-opacity-30">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3 md:mb-4">
            <Lock size={36} className="md:w-12 md:h-12 text-enchant-pink" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-enchant-plum font-enchant mb-1 md:mb-2">Admin Portal</h1>
          <p className="text-enchant-gold text-xs md:text-sm">Event Management Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-enchant-plum font-semibold mb-1 md:mb-2 text-sm md:text-base">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-enchant-pink border-opacity-30 focus:border-enchant-pink focus:outline-none transition-all placeholder-enchant-plum placeholder-opacity-40 bg-enchant-light text-sm md:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 md:mt-6 py-2 md:py-3 bg-gradient-to-r from-enchant-pink to-enchant-lavender text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Lock size={18} className="md:w-5 md:h-5" />
            {loading ? 'Verifying...' : 'Enter Admin Panel'}
          </button>
        </form>

        {/* Dev Skip Button */}
        <button
          onClick={handleDevSkip}
          className="w-full mt-2 md:mt-3 py-2 text-center text-enchant-gold font-semibold hover:bg-enchant-light rounded-lg transition-colors text-xs md:text-sm border border-dashed border-enchant-gold border-opacity-50"
        >
          Dev: Skip to Admin Panel
        </button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
