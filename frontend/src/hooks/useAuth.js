import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('bsn_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const studentLogin = async (email, code) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('attendees')
        .select('id, email, fullname')
        .eq('email', email)
        .eq('unique_code', code)
        .single();

      if (error) throw new Error('Invalid email or code');

      const userData = { ...data, role: 'student' };
      setUser(userData);
      localStorage.setItem('bsn_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const adminLogin = async (password) => {
    try {
      setError(null);
      const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
      
      if (password !== ADMIN_PASSWORD) {
        throw new Error('Invalid admin password');
      }

      const adminUser = { id: 'admin', email: 'admin@bsn', fullname: 'Admin', role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('bsn_user', JSON.stringify(adminUser));
      return adminUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bsn_user');
  };

  return {
    user,
    loading,
    error,
    studentLogin,
    adminLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
}
