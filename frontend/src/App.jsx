import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { StudentLogin } from './components/Auth/StudentLogin';
import { AdminLogin } from './components/Auth/AdminLogin';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { AdminPanel } from './components/Admin/AdminPanel';

function App() {
  const { user, isAuthenticated, isAdmin, studentLogin, adminLogin, logout } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (email, code) => {
    await studentLogin(email, code);
    navigate('/dashboard');
  };

  const handleAdminLogin = async (password) => {
    await adminLogin(password);
    navigate('/admin/panel');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Routes>
      {/* Student Login Route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin ? <Navigate to="/admin/panel" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <StudentLogin onLogin={handleStudentLogin} />
          )
        }
      />
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Student Protected Routes */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated && !isAdmin ? (
            <StudentDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/seats"
        element={
          isAuthenticated && !isAdmin ? (
            <StudentDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/seats/:societyParam"
        element={
          isAuthenticated && !isAdmin ? (
            <StudentDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/pass"
        element={
          isAuthenticated && !isAdmin ? (
            <StudentDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/ticket" element={<Navigate to="/pass" replace />} />
      <Route path="/student" element={<Navigate to="/dashboard" replace />} />

      {/* Admin Login Route */}
      <Route
        path="/admin"
        element={
          isAuthenticated && isAdmin ? (
            <Navigate to="/admin/panel" replace />
          ) : (
            <AdminLogin
              onLogin={handleAdminLogin}
              onBackToStudent={() => navigate('/')}
            />
          )
        }
      />
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />

      {/* Admin Management Panel Route */}
      <Route
        path="/admin/panel"
        element={
          isAuthenticated && isAdmin ? (
            <AdminPanel onLogout={handleLogout} />
          ) : (
            <Navigate to="/admin" replace />
          )
        }
      />
      <Route path="/admin/dashboard" element={<Navigate to="/admin/panel" replace />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;