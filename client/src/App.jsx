import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP'; 
import Dashboard from './pages/Dashboard';
import SecureNotes from './pages/SecureNotes';
import FileVault from './pages/FileVault'; 
import PasswordManager from './pages/PasswordManager';
import KeyGenerator from './pages/KeyGenerator';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './pages/Settings';

const AppContent = () => {
  const location = useLocation();
  
  // 1. AUTHENTICATION STATE
  // We check for the token but rely on the Routes to handle the "entry" logic
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // 2. GLOBAL THEME STATE
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // 3. GLOBAL CSS APPLICATION
    if (savedTheme === 'dark') {
      document.body.style.backgroundColor = '#020617';
      document.body.style.color = '#f8fafc';
    } else {
      document.body.style.backgroundColor = '#f1f5f9';
      document.body.style.color = '#0f172a';
    }
  }, [location.pathname]);

  // Identify special pages
  const authPaths = ['/login', '/register', '/verifyOTP'];
  const isAuthPage = authPaths.includes(location.pathname);
  
  // Only show sidebar if authenticated AND not on an auth/login page
  const shouldShowSidebar = isAuthenticated && !isAuthPage;

  return (
    <div style={{
      ...appContainerStyle, 
      background: theme === 'dark' ? '#020617' : '#f1f5f9' 
    }}>
      {shouldShowSidebar && <Sidebar />}
      
      <div style={{ 
        flex: 1, 
        marginLeft: shouldShowSidebar ? '260px' : '0', 
        transition: 'all 0.3s ease',
        background: 'transparent',
        minHeight: '100vh',
        width: '100%',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a'
      }}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verifyOTP" element={<VerifyOTP />} />
          
          {/* Protected Vault Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes" element={<SecureNotes />} />
            <Route path="/files" element={<FileVault />} />
            <Route path="/passwords" element={<PasswordManager />} />
            <Route path="/generator" element={<KeyGenerator />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 🛡️ FIXED REDIRECTION LOGIC */}
          {/* If the user hits '/', we always send them to Login. 
              The Login page itself has logic to clear old tokens. */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Fallback for unknown paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const appContainerStyle = { 
  display: 'flex', 
  minHeight: '100vh', 
  width: '100vw', 
  overflowX: 'hidden',
  transition: 'background 0.3s ease' 
};

export default App;