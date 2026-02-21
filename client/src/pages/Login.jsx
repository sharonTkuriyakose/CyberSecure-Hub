import React, { useState, useEffect } from 'react';
import API, { loginUser, registerUser } from '../services/api'; 
import { 
  FaShieldAlt, FaFolderOpen, FaStickyNote, FaKey, 
  FaUserPlus, FaTerminal, FaFingerprint, FaEnvelope, FaArrowLeft
} from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); 
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. SECURITY RESET & THEME SYNC
  useEffect(() => {
    localStorage.removeItem('token'); 
    // Ensure the root theme is applied to the login page background
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setStep(1);
    setFormData({ username: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await loginUser({ email: formData.email, password: formData.password });
        if (res.data.mfaRequired) {
          setUserId(res.data.userId);
          setStep(2); 
        }
      } else {
        await registerUser({ 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        });
        setSuccessMsg("Operative profile initialized. Please log in.");
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Access denied. Verify system credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = async (method) => {
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/send-otp', { userId, method: 'email' }); 
      setStep(3); 
    } catch (err) {
      setError('Failed to transmit security code. System fault.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { userId, otp });
      
      if (res.data.token) {
        // Keep theme preference but clear other session data
        const currentTheme = localStorage.getItem('theme');
        localStorage.clear(); 
        if (currentTheme) localStorage.setItem('theme', currentTheme);
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user)); // Sync user metadata
        
        const isSet = !!localStorage.getItem('token');
        if (isSet) {
          setTimeout(() => {
            window.location.replace('/dashboard'); 
          }, 300); 
        } else {
          setError("Session storage failure. Verify browser permissions.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={fullPageWrapper}>
      <div style={contentSide}>
        <div style={brandHeader}>
          <FaShieldAlt style={{ fontSize: '3.5rem', color: 'var(--accent-color)' }} />
          <h1 style={brandName}>CyberSecure-Hub</h1>
        </div>
        
        <div style={infoSection}>
          <h2 style={infoTitle}>Security Core v1.0</h2>
          <p style={infoText}>
            A centralized, zero-knowledge platform for managing sensitive digital assets 
            with military-grade encryption standards.
          </p>
          
          <div style={featureGrid}>
            <div style={featureCard}><FaFolderOpen style={activeIcon} /><div><h4 style={featureHeader}>File Vault</h4><p style={featureDesc}>Encrypted storage.</p></div></div>
            <div style={featureCard}><FaStickyNote style={activeIcon} /><div><h4 style={featureHeader}>Secure Notes</h4><p style={featureDesc}>AES-256 E2EE.</p></div></div>
            <div style={featureCard}><FaKey style={activeIcon} /><div><h4 style={featureHeader}>Pass Manager</h4><p style={featureDesc}>Identity protection.</p></div></div>
            <div style={featureCard}><FaTerminal style={activeIcon} /><div><h4 style={featureHeader}>Key Generator</h4><p style={featureDesc}>Local entropy.</p></div></div>
          </div>
        </div>
      </div>

      <div style={formSide}>
        <div style={loginBox}>
          {step === 1 && (
            <>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                {isLogin ? "Authorized Access" : "Initialize Account"}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>
                {isLogin ? "Provide credentials to unlock vault." : "Establish new operative profile."}
              </p>
              
              {successMsg && <p style={successStyle}>✅ {successMsg}</p>}
              {error && <p style={errorStyle}>⚠️ {error}</p>}

              <form onSubmit={handleSubmit} style={formStyle}>
                {!isLogin && (
                  <div style={inputGroup}>
                    <label style={labelStyle}>Operative Name</label>
                    <input type="text" name="username" value={formData.username} placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
                  </div>
                )}
                <div style={inputGroup}>
                  <label style={labelStyle}>System Email</label>
                  <input type="email" name="email" value={formData.email} placeholder="operator@cybersecure.com" onChange={handleChange} required style={inputStyle} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Access Key</label>
                  <input type="password" name="password" value={formData.password} placeholder="••••••••" onChange={handleChange} required style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? "Processing..." : isLogin ? <><FaKey /> Unlock Session</> : <><FaUserPlus /> Create Account</>}
                </button>
              </form>
              <p style={registerLink}>
                {isLogin ? "New operative?" : "Already registered?"} 
                <button onClick={toggleAuthMode} style={toggleButton}>
                  {isLogin ? "Initialize Account" : "Back to Login"}
                </button>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Security Verification</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>
                Request a secure access code to your registered system email.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button onClick={() => handleSelectMethod('email')} disabled={loading} style={methodButtonStyle}>
                  <FaEnvelope style={{ color: 'var(--accent-color)' }} /> Transmit Code to Email
                </button>
                <button onClick={() => setStep(1)} style={toggleButton}>
                  <FaArrowLeft /> Back to Credentials
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <FaFingerprint style={{ fontSize: '3.5rem', color: 'var(--accent-color)', marginBottom: '20px' }} />
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Enter Access Key</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>
                Input the 6-digit code received in your inbox.
              </p>
              {error && <p style={errorStyle}>⚠️ {error}</p>}
              <form onSubmit={handleVerifyOTP} style={formStyle}>
                <div style={inputGroup}>
                  <label style={labelStyle}>One-Time Key</label>
                  <input 
                    type="text" 
                    placeholder="000000" 
                    maxLength="6" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    style={otpInputStyle} 
                  />
                </div>
                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? "Verifying..." : "Unlock Dashboard"}
                </button>
                <button type="button" onClick={() => setStep(2)} style={resendButtonStyle}>
                  Resend Email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES REFINED FOR THEME SYNC ---

const fullPageWrapper = { display: 'flex', width: '100vw', height: '100vh', background: 'var(--bg-primary)', position: 'fixed', top: 0, left: 0, zIndex: 999, overflow: 'hidden', transition: 'background 0.3s ease' };
const contentSide = { flex: 1.4, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)' };
const formSide = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' };
const brandHeader = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '60px' };
const brandName = { color: 'var(--text-primary)', fontSize: '2.8rem', fontWeight: '900', margin: 0 };
const infoSection = { maxWidth: '600px' };
const infoTitle = { color: 'var(--text-primary)', fontSize: '2rem', marginBottom: '15px' };
const infoText = { color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' };
const featureGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' };
const featureCard = { display: 'flex', gap: '15px' };
const activeIcon = { color: 'var(--accent-color)', fontSize: '1.5rem', marginTop: '4px' };
const featureHeader = { color: 'var(--text-primary)', margin: '0 0 5px 0', fontSize: '1rem', fontWeight: '600' };
const featureDesc = { color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' };
const loginBox = { width: '100%', maxWidth: '400px', padding: '40px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center', transition: '0.3s ease' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' };
const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' };

const inputStyle = { 
  padding: '12px', 
  borderRadius: '10px', 
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)', 
  color: 'var(--text-primary)', 
  outline: 'none',
  transition: '0.3s'
};

const otpInputStyle = {
  ...inputStyle,
  textAlign: 'center', 
  fontSize: '1.5rem', 
  letterSpacing: '8px'
};

const buttonStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', background: 'var(--accent-color)', color: '#020617', fontWeight: '800', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const methodButtonStyle = { ...buttonStyle, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' };
const errorStyle = { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' };
const successStyle = { color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' };
const registerLink = { marginTop: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' };

const toggleButton = { 
  background: 'none', 
  border: 'none', 
  color: 'var(--accent-color)', 
  fontWeight: 'bold', 
  cursor: 'pointer', 
  marginLeft: '5px', 
  textDecoration: 'underline', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '5px', 
  justifyContent: 'center' 
};

const resendButtonStyle = {
  ...toggleButton, 
  marginTop: '10px', 
  textDecoration: 'none'
};

export default Login;