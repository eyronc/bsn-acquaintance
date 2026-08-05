import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { StudentLogin } from './components/Auth/StudentLogin';
import { AdminLogin } from './components/Auth/AdminLogin';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { AdminPanel } from './components/Admin/AdminPanel';

function App() {
  const { user, isAuthenticated, isAdmin, studentLogin, adminLogin, logout } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Demo mode: Show dashboard directly (toggle to false to see login)
  const DEMO_MODE = false;

  if (DEMO_MODE) {
    return <StudentDashboard 
      user={{ id: 'demo-user', fullname: 'Demo Student', email: 'demo@example.com', role: 'student' }} 
      onLogout={() => window.location.reload()} 
    />;
  }

  if (!isAuthenticated) {
    return showAdminLogin ? (
      <AdminLogin
        onLogin={adminLogin}
        onSwitchToStudent={() => setShowAdminLogin(false)}
      />
    ) : (
      <StudentLogin
        onLogin={studentLogin}
        onSwitchToAdmin={() => setShowAdminLogin(true)}
      />
    );
  }

  if (isAdmin) {
    return <AdminPanel onLogout={logout} />;
  }

  return <StudentDashboard user={user} onLogout={logout} />;
}

export default App;
