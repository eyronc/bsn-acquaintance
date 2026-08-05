import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Toast } from '../UI/Toast';

export function StudentLogin({ onLogin, onSwitchToAdmin }) {
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

  // Dev mode: Skip login
  const handleDevSkip = () => {
    const demoUser = { 
      id: 'dev-user', 
      fullname: 'Dev Student', 
      email: 'dev@example.com', 
      role: 'student' 
    };
    localStorage.setItem('bsn_user', JSON.stringify(demoUser));
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
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-enchant-pink to-enchant-lavender font-enchant mb-1 md:mb-2">
            ✨ BSN 2026 ✨
          </h1>
          <p className="text-enchant-plum text-base md:text-lg font-semibold">Acquaintance Party</p>
          <p className="text-enchant-gold text-xs md:text-sm mt-2">Login to Reserve Your Seat</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-enchant-plum font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-enchant-pink border-opacity-30 focus:border-enchant-pink focus:outline-none transition-all placeholder-enchant-plum placeholder-opacity-40 bg-enchant-light"
            />
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-enchant-plum font-semibold mb-2">Access Code</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-enchant-pink border-opacity-30 focus:border-enchant-pink focus:outline-none transition-all placeholder-enchant-plum placeholder-opacity-40 bg-enchant-light"
            />
            <p className="text-enchant-gold text-xs mt-1">Check your email for your access code</p>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-enchant-pink to-enchant-lavender text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            {loading ? 'Logging in...' : 'Enter the Magic'}
          </button>
        </form>

        {/* Footer */}
        <div className="space-y-3 mt-6">
          <p className="text-center text-enchant-plum text-xs opacity-70">
            Registration not found? Contact the event organizer
          </p>
          
          {/* Admin Login Link */}
          <button
            onClick={onSwitchToAdmin}
            className="w-full py-2 text-center text-enchant-plum font-semibold hover:bg-enchant-light rounded-lg transition-colors text-sm"
          >
            🔐 Admin Login
          </button>

          {/* Dev Skip Button */}
          <button
            onClick={handleDevSkip}
            className="w-full py-2 text-center text-enchant-gold font-semibold hover:bg-enchant-light rounded-lg transition-colors text-xs border border-dashed border-enchant-gold border-opacity-50"
          >
            ⚡ Dev: Skip to Dashboard
          </button>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
