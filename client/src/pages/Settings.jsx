import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaMoon, FaSun, FaLock, FaShieldAlt, 
  FaArrowLeft, FaEye, FaEyeSlash 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Settings = () => {
  const [user, setUser] = useState({ username: 'Operative', email: 'N/A' });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [status, setStatus] = useState({ msg: '', type: '' });
  
  // Visibility Toggles
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // 1. IDENTITY & THEME SYNC ON MOUNT
  useEffect(() => {
    // Sync User Identity
    const savedUserString = localStorage.getItem('user');
    if (savedUserString) {
      try {
        const savedUser = JSON.parse(savedUserString);
        setUser({
          username: savedUser.username || 'Operative',
          email: savedUser.email || 'N/A'
        });
      } catch (e) {
        console.error("Session parse error:", e);
      }
    }

    // ✅ Sync Theme Toggle State with Global Attribute
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // 2. GLOBAL THEME TOGGLE (MASTER SWITCH)
  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    
    // Persist for all pages to detect
    localStorage.setItem('theme', newTheme);
    
    // ✅ Apply immediate global attribute update to trigger CSS variables
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Fallback for body background (Legacy support)
    document.body.style.backgroundColor = newTheme === 'dark' ? '#020617' : '#f1f5f9';
  };

  // 3. SECURE PASSWORD UPDATE
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatus({ msg: 'Processing cryptographic update...', type: 'info' });

    try {
      await API.post('/auth/change-password', passwordData);
      setStatus({ msg: 'Access credentials updated successfully.', type: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setStatus({ msg: err.response?.data?.msg || 'Update failed.', type: 'error' });
    }
  };

  return (
    <div style={{...pageWrapper, background: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <div style={fullWidthContainer}>
        <header style={header}>
          <Link to="/dashboard" style={{...backLink, color: 'var(--accent-color)'}}>
            <FaArrowLeft /> Back to Command Center
          </Link>
          <h1 style={title}>
            <FaShieldAlt style={{color: 'var(--accent-color)'}}/> Security Settings
          </h1>
        </header>

        <div style={gridDisplay}>
          {/* Identity Section */}
          <div style={{...settingCard, background: 'var(--card-bg)'}}>
            <h3 style={sectionTitle}><FaUser /> Identity Profile</h3>
            <div style={{...infoBox, background: 'var(--bg-secondary)'}}>
              <p style={label}>Operative Username</p>
              <p style={{...value, color: 'var(--text-primary)'}}>{user.username}</p>
              <p style={label}>Registered Email</p>
              <p style={{...value, color: 'var(--text-primary)'}}>{user.email}</p>
            </div>
          </div>

          {/* Theme Section */}
          <div style={{...settingCard, background: 'var(--card-bg)'}}>
            <h3 style={sectionTitle}>{isDarkMode ? <FaMoon /> : <FaSun />} Interface Theme</h3>
            <div style={toggleRow}>
              <span>System currently in <b>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</b></span>
              <button onClick={toggleTheme} style={{...toggleBtn, background: isDarkMode ? '#38bdf8' : '#94a3b8'}}>
                <div style={{...toggleCircle, transform: isDarkMode ? 'translateX(20px)' : 'translateX(0)'}} />
              </button>
            </div>
          </div>

          {/* Password Section with Eye Option */}
          <div style={{...settingCard, background: 'var(--card-bg)', gridColumn: 'span 2'}}>
            <h3 style={sectionTitle}><FaLock /> Update Access Credentials</h3>
            <form onSubmit={handlePasswordChange} style={form}>
              <div style={inputGroup}>
                
                {/* Old Password Input */}
                <div style={relativeContainer}>
                  <input 
                    type={showOldPass ? "text" : "password"} 
                    placeholder="Old Password" 
                    style={{...input, background: 'var(--bg-secondary)', color: 'var(--text-primary)'}}
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    required
                  />
                  <div style={eyeIcon} onClick={() => setShowOldPass(!showOldPass)}>
                    {showOldPass ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>

                {/* New Password Input */}
                <div style={relativeContainer}>
                  <input 
                    type={showNewPass ? "text" : "password"} 
                    placeholder="New Secure Password" 
                    style={{...input, background: 'var(--bg-secondary)', color: 'var(--text-primary)'}}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                  <div style={eyeIcon} onClick={() => setShowNewPass(!showNewPass)}>
                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>

              </div>
              <button type="submit" style={saveBtn}>Save New Password</button>
            </form>
            {status.msg && <p style={{marginTop: '15px', fontWeight: 'bold', color: status.type === 'success' ? '#10b981' : '#ef4444'}}>{status.msg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== STYLES (Switched to CSS Variables) ===== */
const pageWrapper = { minHeight: '100vh', width: '100%', padding: '40px', boxSizing: 'border-box', transition: '0.3s' };
const fullWidthContainer = { width: '100%', maxWidth: '1400px', margin: '0 auto' };
const header = { marginBottom: '40px' };
const backLink = { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold' };
const title = { fontSize: '2.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '20px' };
const gridDisplay = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' };
const settingCard = { padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: '0.3s' };
const sectionTitle = { fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '15px' };
const infoBox = { padding: '25px', borderRadius: '16px', transition: '0.3s' };
const label = { color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' };
const value = { fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600' };
const toggleRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1rem' };
const toggleBtn = { width: '50px', height: '28px', borderRadius: '20px', padding: '3px', cursor: 'pointer', border: 'none', transition: '0.3s' };
const toggleCircle = { width: '22px', height: '22px', background: 'white', borderRadius: '50%', transition: '0.3s' };
const form = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };

const relativeContainer = { position: 'relative', width: '100%' };
const input = { width: '100%', padding: '15px 45px 15px 15px', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: '0.3s' };
const eyeIcon = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center' };

const saveBtn = { width: 'fit-content', padding: '15px 40px', background: 'var(--accent-color)', color: '#020617', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' };

export default Settings;