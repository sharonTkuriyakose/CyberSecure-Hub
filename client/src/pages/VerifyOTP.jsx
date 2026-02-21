import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP, sendOTP } from '../services/api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve userId and email passed from the Login page
  const { userId, email } = location.state || {};

  useEffect(() => {
    // Sync Theme on Mount
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (!userId) {
      navigate('/login');
    } else {
      sendOTP({ userId, method: 'email' });
    }
  }, [userId, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await verifyOTP({ userId, otp });

      if (res.data.token) {
        /**
         * 1. SESSION INITIALIZATION (WITH THEME PRESERVATION)
         * We save the theme choice before clearing the storage.
         */
        const currentTheme = localStorage.getItem('theme');
        localStorage.clear(); 
        if (currentTheme) localStorage.setItem('theme', currentTheme);
        
        // 2. Commit the new token
        localStorage.setItem('token', res.data.token);
        
        /**
         * 3. DATA PERSISTENCE FOR DASHBOARD
         * Mapping the user metadata explicitly.
         */
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify({
            username: res.data.user.username,
            email: res.data.user.email 
          }));
        }
        
        /**
         * 4. TIMING STABILITY FIX
         */
        const tokenVerified = localStorage.getItem('token');
        const userVerified = localStorage.getItem('user');

        if (tokenVerified && userVerified) {
          console.log("Vault Access Granted. Personalizing session...");
          setTimeout(() => {
            window.location.replace('/dashboard'); 
          }, 300); 
        } else {
          setError("Storage write failure. Please check browser privacy settings.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Identity Verification</h2>
        <p style={subtitleStyle}>A 6-digit code was sent to <strong>{email}</strong></p>
        
        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleVerify}>
          <input 
            type="text" 
            placeholder="000000" 
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required 
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'VERIFYING...' : 'UNLOCK VAULT'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- STYLES UPDATED FOR GLOBAL THEME SYNC ---

const containerStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  height: '100vh', 
  background: 'var(--bg-primary)',
  transition: 'background 0.3s ease'
};

const cardStyle = { 
  background: 'var(--card-bg)', 
  padding: '40px', 
  borderRadius: '24px', 
  border: '1px solid var(--border-color)',
  width: '400px', 
  textAlign: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease'
};

const titleStyle = { color: 'var(--text-primary)', marginBottom: '10px' };
const subtitleStyle = { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' };

const inputStyle = { 
  width: '100%', 
  padding: '15px', 
  marginBottom: '20px', 
  background: 'var(--bg-secondary)', 
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', 
  borderRadius: '12px', 
  fontSize: '1.5rem', 
  letterSpacing: '8px', 
  textAlign: 'center',
  outline: 'none',
  boxSizing: 'border-box',
  transition: '0.3s'
};

const buttonStyle = { 
  width: '100%', 
  padding: '12px', 
  background: 'var(--accent-color)', 
  color: '#020617', 
  fontWeight: '900', 
  border: 'none', 
  borderRadius: '10px', 
  cursor: 'pointer',
  fontSize: '1rem'
};

const errorStyle = { 
  color: '#ef4444', 
  background: 'rgba(239, 68, 68, 0.1)', 
  padding: '10px', 
  borderRadius: '8px',
  marginBottom: '15px', 
  fontSize: '0.85rem' 
};

export default VerifyOTP;