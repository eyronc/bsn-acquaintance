import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { StudentLogin } from './components/Auth/StudentLogin';
import { AdminLogin } from './components/Auth/AdminLogin';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { AdminPanel } from './components/Admin/AdminPanel';

function App() {
  const { user, isAuthenticated, isAdmin, studentLogin, adminLogin, logout } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  if (!isAuthenticated) {
    return showAdminLogin ? (
      <AdminLogin
        onLogin={adminLogin}
        onSwitchToStudent={() => setShowAdminLogin(false)}
      />
    ) : (
      <StudentLogin
        onLogin={studentLogin}
      />
    );
  }

  if (isAdmin) {
    return <AdminPanel onLogout={logout} />;
  }

  return <StudentDashboard user={user} onLogout={logout} />;
}

export default App;
