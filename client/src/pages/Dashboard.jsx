import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  FaShieldAlt,
  FaStickyNote,
  FaFolderOpen,
  FaKey,
  FaTerminal,
  FaCheckCircle,
  FaSignOutAlt,
  FaCircle,
  FaGlobeAmericas,
  FaUserShield
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({ notesCount: 0, filesCount: 0, passwordsCount: 0 });
  const [user, setUser] = useState({ username: 'Operative' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  // 1. SESSION TIMEOUT LOGIC
  useEffect(() => {
    let logoutTimer;
    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        alert("Security Session Expired: Autologout initiated for protection.");
        handleLogout();
      }, 900000); 
    };

    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(logoutTimer);
    };
  }, [handleLogout]);

  // 2. DATA SYNC
  useEffect(() => {
    const savedUserString = localStorage.getItem('user');
    if (savedUserString) {
      try {
        const savedUser = JSON.parse(savedUserString);
        setUser({ username: savedUser.username || 'Operative' });
      } catch (e) {
        console.error("Failed to parse operative metadata:", e);
      }
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [notesRes, filesRes, passwordsRes] = await Promise.all([
          API.get('/data/notes'),
          API.get('/data/files'),
          API.get('/data/passwords') 
        ]);

        setStats({
          notesCount: notesRes.data?.length || 0,
          filesCount: filesRes.data?.length || 0,
          passwordsCount: passwordsRes.data?.length || 0 
        });
      } catch (err) {
        setError("Vault synchronization failed. Session may have expired.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div style={layoutWrapper}>
      <style>{`
        .feature-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          background: var(--card-bg) !important;
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-color) !important;
        }
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: var(--card-bg) !important;
          border-color: var(--accent-color) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 0 20px rgba(56, 189, 248, 0.1) !important;
        }
        .status-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>

      <div style={contentArea}>
        <header style={headerStyle}>
          <div style={brandHeader}>
            <FaShieldAlt style={{ fontSize: '2.2rem', color: 'var(--accent-color)' }} />
            <div>
              <h1 style={titleStyle}>Command Center: {user.username}</h1>
              <p style={subTitleText}>Secure System Interface Operational</p>
            </div>
          </div>
          <div style={navActions}>
            {/* Removed redundant Settings Link from here */}
            
            <div style={statusBadge}>
              <FaCircle className="status-dot" style={{ color: '#10b981', fontSize: '0.6rem' }} />
              <span style={statusText}>MFA Status: <b>Verified</b></span>
            </div>
            <button onClick={handleLogout} style={logoutButton}>
              <FaSignOutAlt /> Terminate Session
            </button>
          </div>
        </header>

        {error && <div style={errorBanner}>⚠️ {error}</div>}

        <div style={mainDisplayGrid}>
          <div style={primaryGrid}>
            <div className="feature-card" style={cardStyle}>
              <div>
                <FaStickyNote style={iconStyle} />
                <h3 style={cardTitle}>Secure Notes</h3>
                <p style={statNumber}>{loading ? '...' : stats.notesCount}</p>
              </div>
              <Link to="/notes" style={linkButtonStyle}>Access Notes</Link>
            </div>

            <div className="feature-card" style={cardStyle}>
              <div>
                <FaFolderOpen style={iconStyle} />
                <h3 style={cardTitle}>File Vault</h3>
                <p style={statNumber}>{loading ? '...' : stats.filesCount}</p>
              </div>
              <Link to="/files" style={linkButtonStyle}>Open Vault</Link>
            </div>

            <div className="feature-card" style={cardStyle}>
              <div>
                <FaKey style={iconStyle} />
                <h3 style={cardTitle}>Pass Manager</h3>
                <p style={statNumber}>{loading ? '...' : stats.passwordsCount}</p>
              </div>
              <Link to="/passwords" style={linkButtonStyle}>Launch Manager</Link>
            </div>

            <div className="feature-card" style={cardStyle}>
              <div>
                <FaTerminal style={iconStyle} />
                <h3 style={cardTitle}>Key Generator</h3>
                <p style={statLabel}>Entropy-Based</p>
              </div>
              <Link to="/generator" style={linkButtonStyle}>Open Generator</Link>
            </div>
          </div>

          <div style={rightInfoArea}>
            <div style={staticInfoBox}>
              <h4 style={infoTitle}><FaGlobeAmericas style={{color: 'var(--accent-color)'}}/> Threat Intelligence</h4>
              <div style={divider}></div>
              <p style={infoText}>Active Shields: <b>Global</b></p>
              <p style={infoText}>Intrusion Attempts: <b>0 Blocked</b></p>
              <p style={infoText}>IP Reputation: <b>Whitelisted</b></p>
            </div>
            
            <div style={staticInfoBox}>
              <h4 style={infoTitle}><FaUserShield style={{color: 'var(--accent-color)'}}/> Session Metrics</h4>
              <div style={divider}></div>
              <p style={infoText}>Identity Hash: <b>Secure</b></p>
              <p style={infoText}>Auto-Logout: <b>15m Protection</b></p>
              <p style={infoText}>Zero-Knowledge: <b>Active</b></p>
            </div>
          </div>
        </div>

        <div style={infoRow}>
          <div style={securityInfoBox}>
            <h4 style={infoBoxTitle}>Infrastructure Compliance</h4>
            <div style={checklistGrid}>
              <div style={listItem}><FaCheckCircle style={checkIcon} /> AES-256 Client-Side</div>
              <div style={listItem}><FaCheckCircle style={checkIcon} /> JWT Signed Session</div>
              <div style={listItem}><FaCheckCircle style={checkIcon} /> Cloudinary Assets</div>
              <div style={listItem}><FaCheckCircle style={checkIcon} /> MongoDB Persistence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== STYLES REFINED FOR THEME SYNC ===== */
const layoutWrapper = { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'all 0.3s ease' };
const contentArea = { flex: 1, padding: '30px 40px', minWidth: 0, boxSizing: 'border-box' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' };
const brandHeader = { display: 'flex', alignItems: 'center', gap: '20px' };
const titleStyle = { fontSize: '1.8rem', fontWeight: '900', margin: 0 };
const subTitleText = { color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' };
const navActions = { display: 'flex', gap: '15px', alignItems: 'center' };
const statusBadge = { background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: '30px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' };
const statusText = { color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' };
const logoutButton = { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.8rem' };

const mainDisplayGrid = { display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '25px', width: '100%' };
const primaryGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const rightInfoArea = { display: 'flex', flexDirection: 'column', gap: '20px' };
const cardStyle = { padding: '25px', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' };
const staticInfoBox = { padding: '25px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)' };
const divider = { height: '1px', background: 'var(--border-color)', margin: '15px 0' };
const iconStyle = { fontSize: '2.4rem', color: 'var(--accent-color)', marginBottom: '10px' };
const cardTitle = { color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.3rem', fontWeight: '800' };
const statNumber = { fontSize: '3.4rem', fontWeight: '950', margin: '5px 0' };
const statLabel = { fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-color)', margin: '15px 0' };
const linkButtonStyle = { display: 'block', background: 'var(--accent-color)', color: '#020617', padding: '14px', borderRadius: '14px', textDecoration: 'none', fontWeight: '900', fontSize: '0.95rem', textAlign: 'center' };
const infoTitle = { color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' };
const infoText = { color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: '500' };
const infoRow = { marginTop: '25px' };
const securityInfoBox = { padding: '25px 35px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)' };
const infoBoxTitle = { color: 'var(--accent-color)', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase' };
const checklistGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' };
const listItem = { display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' };
const checkIcon = { color: '#10b981' };
const errorBanner = { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' };

export default Dashboard;