import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { StudentLogin } from './components/Auth/StudentLogin';
import { AdminLogin } from './components/Auth/AdminLogin';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { AdminPanel } from './components/Admin/AdminPanel';

function App() {
  const { user, isAuthenticated, isAdmin, studentLogin, adminLogin, logout } = useAuth();
  
  // Demo mode: Show dashboard directly (toggle to false to see login)
  const DEMO_MODE = false;

  // Check if user is trying to access /admin route
  const isAdminRoute = window.location.pathname === '/admin';

  if (DEMO_MODE) {
    return <StudentDashboard 
      user={{ id: 'demo-user', fullname: 'Demo Student', email: 'demo@example.com', role: 'student' }} 
      onLogout={() => window.location.reload()} 
    />;
  }

  // Show admin login if /admin route and not authenticated
  if (isAdminRoute && !isAuthenticated) {
    return (
      <AdminLogin
        onLogin={adminLogin}
        onBackToStudent={() => window.location.pathname = '/'}
      />
    );
  }

  if (!isAuthenticated) {
    return <StudentLogin onLogin={studentLogin} />;
  }

  if (isAdmin) {
    return <AdminPanel onLogout={logout} />;
  }

  return <StudentDashboard user={user} onLogout={logout} />;
}

export default App;
