import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaShieldAlt, 
  FaChartPie,
  FaFolderOpen, 
  FaStickyNote, 
  FaSignOutAlt, 
  FaKey, 
  FaTerminal,
  FaCog // Added for Settings link
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  /**
   * TERMINATE SESSION
   * Clears all local storage data to ensure no sensitive MFA traces remain.
   */
  const handleLogout = () => {
    console.log("Terminating secure session...");
    localStorage.clear(); 
    window.location.href = '/login'; 
  };

  return (
    <div style={sidebarStyle}>
      {/* Brand Section */}
      <div style={logoSection}>
        <FaShieldAlt style={{ color: 'var(--accent-color)', fontSize: '1.8rem' }} />
        <h2 style={logoText}>CyberSecure</h2>
      </div>

      {/* Navigation Links */}
      <nav style={navStyle}>
        <NavLink 
          to="/dashboard" 
          style={({ isActive }) => isActive ? activeLink : linkStyle}
        >
          <FaChartPie /> <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/notes" 
          style={({ isActive }) => isActive ? activeLink : linkStyle}
        >
          <FaStickyNote /> <span>Secure Notes</span>
        </NavLink>

        <NavLink 
          to="/files" 
          style={({ isActive }) => isActive ? activeLink : linkStyle}
        >
          <FaFolderOpen /> <span>File Vault</span>
        </NavLink>

        <NavLink 
          to="/passwords" 
          style={({ isActive }) => isActive ? activeLink : linkStyle}
        >
          <FaKey /> <span>Pass Manager</span>
        </NavLink>

        <NavLink 
          to="/generator" 
          style={({ isActive }) => isActive ? activeLink : linkStyle}
        >
          <FaTerminal /> <span>Pass Generator</span>
        </NavLink>

        {/* ✅ ADDED SETTINGS LINK */}
        <NavLink 
          to="/settings" 
          style={({ isActive }) => isActive ? activeLink : linkStyle}
        >
          <FaCog /> <span>Settings</span>
        </NavLink>
      </nav>

      {/* Logout Action */}
      <div style={logoutContainer}>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          <FaSignOutAlt /> <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );
};

// --- STYLES UPDATED FOR GLOBAL THEME VARIABLES ---

const sidebarStyle = {
  width: '260px', 
  height: '100vh',
  // Use variable for dynamic theme response
  background: 'var(--bg-secondary)', 
  borderRightWidth: '1px',
  borderRightStyle: 'solid',
  borderRightColor: 'var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  padding: '25px 15px',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1000,
  transition: 'background 0.3s ease, border-color 0.3s ease'
};

const logoSection = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  marginBottom: '40px', 
  paddingLeft: '10px' 
};

const logoText = { 
  color: 'var(--text-primary)', 
  fontSize: '1.4rem', 
  fontWeight: '800', 
  margin: 0,
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const navStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '8px', 
  flex: 1 
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  padding: '14px 18px',
  borderRadius: '12px',
  transition: 'all 0.2s ease-in-out',
  fontSize: '1rem',
  background: 'transparent',
  cursor: 'pointer',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'transparent'
};

const activeLink = {
  ...linkStyle,
  color: 'var(--accent-color)',
  background: 'rgba(56, 189, 248, 0.08)',
  borderColor: 'var(--border-color)',
  fontWeight: '600'
};

const logoutContainer = {
  marginTop: 'auto',
  paddingTop: '20px',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'var(--border-color)'
};

const logoutButtonStyle = {
  ...linkStyle,
  color: '#f87171',
  fontWeight: '700',
  background: 'rgba(248, 113, 113, 0.05)',
  textAlign: 'left',
  width: '100%',
  justifyContent: 'center',
  borderColor: 'rgba(248, 113, 113, 0.1)'
};

export default Sidebar;