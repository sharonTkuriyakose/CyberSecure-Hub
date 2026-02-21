import React, { useState, useEffect } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaShieldAlt } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. GLOBAL THEME SYNC
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setSuccess(true);
      // Redirect to login after 2 seconds so they can perform MFA
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="glass-card">
        <FaShieldAlt style={iconStyle} />
        <h2 style={titleStyle}>Initialize Operative Profile</h2>
        
        {success && (
          <p style={successStyle}>
            Profile initialized successfully. Redirecting to login...
          </p>
        )}
        
        {error && <p style={errorStyle}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Operative Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. John Doe"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>System Email</label>
            <input
              type="email"
              name="email"
              placeholder="operator@cybersecure.com"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Master Access Key</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            <FaUserPlus /> Initialize Account
          </button>
        </form>
        
        <p style={footerLink}>
          Already registered? <span onClick={() => navigate('/login')} style={linkBtn}>Login</span>
        </p>
      </div>
    </div>
  );
};

/* ===== STYLES REFINED FOR GLOBAL THEME SYNC ===== */
const containerStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '100vh', 
  background: 'var(--bg-primary)',
  transition: 'background 0.3s ease'
};

const cardStyle = { 
  maxWidth: '450px', 
  width: '90%', 
  padding: '40px', 
  borderRadius: '24px', 
  background: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  textAlign: 'center',
  boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
};

const iconStyle = { fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '20px' };
const titleStyle = { color: 'var(--text-primary)', marginBottom: '30px', fontSize: '1.8rem', fontWeight: '900' };

const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' };

const inputStyle = { 
  padding: '12px 15px', 
  borderRadius: '10px', 
  border: '1px solid var(--border-color)', 
  background: 'var(--bg-secondary)', 
  color: 'var(--text-primary)',
  outline: 'none',
  transition: '0.3s'
};

const buttonStyle = { 
  padding: '14px', 
  background: 'var(--accent-color)', 
  color: '#020617', 
  fontWeight: '900', 
  border: 'none', 
  borderRadius: '10px', 
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  fontSize: '1rem',
  marginTop: '10px'
};

const errorStyle = { color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px' };
const successStyle = { color: '#10b981', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 'bold' };

const footerLink = { marginTop: '25px', color: 'var(--text-secondary)', fontSize: '0.9rem' };
const linkBtn = { color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' };

export default Register;