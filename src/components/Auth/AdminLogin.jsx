import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Toast } from '../UI/Toast';

export function AdminLogin({ onLogin, onSwitchToStudent }) {
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
    <div className="min-h-screen bg-gradient-to-br from-enchant-cream via-enchant-pink via-enchant-lavender to-enchant-sage flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-enchant-gold opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-enchant-pink opacity-15 rounded-full blur-3xl"></div>

      <div className="bg-white bg-opacity-95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full border border-enchant-gold border-opacity-30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Lock size={48} className="text-enchant-pink" />
          </div>
          <h1 className="text-3xl font-bold text-enchant-plum font-enchant mb-2">Admin Portal</h1>
          <p className="text-enchant-gold text-sm">Event Management Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-enchant-plum font-semibold mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-enchant-pink border-opacity-30 focus:border-enchant-pink focus:outline-none transition-all placeholder-enchant-plum placeholder-opacity-40 bg-enchant-light"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-enchant-pink to-enchant-lavender text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            {loading ? 'Verifying...' : 'Enter Admin Panel'}
          </button>
        </form>

        {/* Switch to Student */}
        <button
          onClick={onSwitchToStudent}
          className="w-full mt-4 py-2 text-enchant-plum font-semibold hover:bg-enchant-light rounded-lg transition-colors"
        >
          Student Login Instead →
        </button>

        {/* Dev Skip Button */}
        <button
          onClick={handleDevSkip}
          className="w-full mt-3 py-2 text-center text-enchant-gold font-semibold hover:bg-enchant-light rounded-lg transition-colors text-xs border border-dashed border-enchant-gold border-opacity-50"
        >
          ⚡ Dev: Skip to Admin Panel
        </button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
