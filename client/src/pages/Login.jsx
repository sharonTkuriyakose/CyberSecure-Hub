import React, { useState, useEffect } from 'react';
import API, { loginUser, registerUser } from '../services/api'; 
import { 
  FaShieldAlt, FaKey, FaUserPlus, FaTerminal, FaFingerprint, FaEnvelope, FaArrowLeft, FaSyncAlt,
  FaRegUser, FaRegEnvelope, FaLock, FaSearch, FaCode, FaCheck
} from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Credentials, 2: Method, 3: Login OTP, 4: Forgot Email, 5: Reset Final
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // UI state for matching design
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    localStorage.removeItem('token'); 
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

  // --- HANDLERS ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!isLogin && !agreeTerms) {
      setError('Please agree to the Terms & Conditions to continue.');
      return;
    }
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

  // Triggered when user clicks "Forgot Access Key?"
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: formData.email });
      setSuccessMsg("Recovery code transmitted. Check your inbox.");
      setStep(5); // Move to OTP verification and New Password entry
    } catch (err) {
      setError(err.response?.data?.msg || 'Email not found in system records.');
    } finally {
      setLoading(false);
    }
  };

  // Finalizes the password reset using the OTP and new password
  const handleResetFinal = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { 
        email: formData.email, 
        otp, 
        newPassword: formData.password 
      });
      setSuccessMsg("Access Key updated. You may now login.");
      setStep(1);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid code or reset failed.');
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
        const currentTheme = localStorage.getItem('theme');
        localStorage.clear(); 
        if (currentTheme) localStorage.setItem('theme', currentTheme);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.replace('/dashboard'); 
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <style>{`
        /* --- SCOPED HIGH-FIDELITY DESIGN MATCHING SCREENSHOT --- */
        .login-page-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #030712;
          background-image: 
            radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.22) 0%, rgba(3, 7, 18, 0) 50%),
            radial-gradient(circle at 15% 85%, rgba(37, 99, 235, 0.18) 0%, rgba(3, 7, 18, 0) 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
          z-index: 1000;
          overflow-y: auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-card-container {
          width: 100%;
          max-width: 1040px;
          min-height: 600px;
          background: #090d16;
          border-radius: 28px;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: row;
          overflow: hidden;
          position: relative;
        }

        /* LEFT SIDE - ILLUSTRATION & BRAND */
        .card-left {
          flex: 1.1;
          background: #090d16;
          padding: 38px 42px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.04);
        }

        .brand-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }

        .brand-icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          font-size: 1.2rem;
        }

        .brand-title-text {
          color: #f8fafc;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.4px;
          margin: 0;
        }

        .illustration-portal {
          width: 360px;
          height: 360px;
          margin: 10px auto;
          background: radial-gradient(circle at 35% 35%, #18233e 0%, #0d1326 65%, #070a14 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.65), 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        /* Subtle float animation for illustration items */
        @keyframes floatItem {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes floatItemRev {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(6px); }
        }

        .float-fast { animation: floatItem 4s ease-in-out infinite; }
        .float-slow { animation: floatItemRev 5.5s ease-in-out infinite; }

        /* RIGHT SIDE - FORM CONTAINER */
        .card-right {
          flex: 1;
          background: #090d16;
          padding: 48px 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #f8fafc;
          position: relative;
        }

        .form-heading {
          font-size: 1.65rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .form-subheading {
          font-size: 0.88rem;
          color: #64748b;
          margin: 0 0 28px 0;
          font-weight: 500;
        }

        .form-fields-wrapper {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .input-group-box {
          position: relative;
          width: 100%;
        }

        .custom-input {
          width: 100% !important;
          height: 50px !important;
          background: #161b22 !important;
          border: 1px solid #21262d !important;
          border-radius: 10px !important;
          padding: 0 16px 0 44px !important;
          color: #f8fafc !important;
          font-size: 0.92rem !important;
          outline: none !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          font-family: inherit !important;
          box-shadow: none !important;
        }

        .custom-input:hover {
          border-color: #30363d !important;
          background: #191f28 !important;
        }

        .custom-input:focus {
          border-color: #3b82f6 !important;
          background: #181f2a !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
        }

        .input-icon-left {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1rem;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .input-group-box:focus-within .input-icon-left {
          color: #3b82f6;
        }

        .password-toggle-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none !important;
          border: none !important;
          color: #cbd5e1 !important;
          font-size: 0.82rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          padding: 4px !important;
          margin: 0 !important;
          width: auto !important;
          height: auto !important;
          box-shadow: none !important;
          transition: color 0.2s ease !important;
        }

        .password-toggle-btn:hover {
          color: #ffffff !important;
        }

        .options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 6px 0 22px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .custom-checkbox {
          width: 18px !important;
          height: 18px !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          background: #161b22 !important;
          border: 1px solid #2d333b !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          position: relative !important;
          margin: 0 !important;
          padding: 0 !important;
          transition: all 0.2s ease !important;
          display: inline-block !important;
          flex-shrink: 0 !important;
          outline: none !important;
        }

        .custom-checkbox:checked {
          background: #2563eb !important;
          border-color: #2563eb !important;
        }

        .custom-checkbox:checked::after {
          content: '✓';
          position: absolute;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .forgot-link-btn {
          background: none !important;
          border: none !important;
          color: #94a3b8 !important;
          font-size: 0.85rem !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          padding: 0 !important;
          margin: 0 !important;
          width: auto !important;
          height: auto !important;
          box-shadow: none !important;
          transition: color 0.2s ease !important;
        }

        .forgot-link-btn:hover {
          color: #3b82f6 !important;
        }

        .submit-btn {
          width: 100% !important;
          height: 50px !important;
          background: #2563eb !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 0.95rem !important;
          border: none !important;
          border-radius: 10px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3) !important;
          margin: 0 !important;
          font-family: inherit !important;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1d4ed8 !important;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45) !important;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.65 !important;
          cursor: not-allowed !important;
        }

        .secondary-btn {
          width: 100% !important;
          height: 50px !important;
          background: #161b22 !important;
          color: #f8fafc !important;
          font-weight: 600 !important;
          font-size: 0.92rem !important;
          border: 1px solid #21262d !important;
          border-radius: 10px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          transition: all 0.2s ease !important;
          margin-top: 12px !important;
        }

        .secondary-btn:hover {
          border-color: #3b82f6 !important;
          background: #181f2a !important;
        }

        .switch-mode-footer {
          margin-top: 26px;
          text-align: center;
          font-size: 0.88rem;
          color: #64748b;
        }

        .switch-action-btn {
          background: none !important;
          border: none !important;
          color: #3b82f6 !important;
          font-weight: 700 !important;
          font-size: 0.88rem !important;
          cursor: pointer !important;
          padding: 0 !important;
          margin: 0 0 0 6px !important;
          width: auto !important;
          height: auto !important;
          box-shadow: none !important;
          display: inline !important;
        }

        .switch-action-btn:hover {
          text-decoration: underline;
          color: #60a5fa !important;
        }

        .alert-error {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-success {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.25);
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .otp-input-box {
          text-align: center !important;
          font-size: 1.5rem !important;
          letter-spacing: 10px !important;
          padding-left: 16px !important;
          font-weight: 700 !important;
        }

        /* Autofill dark fix */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #161b22 inset !important;
          -webkit-text-fill-color: #f8fafc !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        @media (max-width: 900px) {
          .login-card-container {
            flex-direction: column;
            max-width: 480px;
            min-height: auto;
          }
          .card-left {
            padding: 28px 28px 10px 28px;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          }
          .illustration-portal {
            width: 260px;
            height: 260px;
            margin: 15px auto;
          }
          .card-right {
            padding: 36px 28px;
          }
        }
      `}</style>

      <div className="login-card-container">
        {/* LEFT COLUMN: BRAND AND SCREENSHOT-MATCHING ILLUSTRATION */}
        <div className="card-left">
          <div className="brand-header-row">
            <div className="brand-icon-bubble">
              <FaShieldAlt />
            </div>
            <h1 className="brand-title-text">CyberSecure-Hub</h1>
          </div>

          <div className="illustration-portal">
            {/* Custom SVG Illustration recreating the open vault with developer & security elements */}
            <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="boxInner" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#090d16" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>

              {/* Background glow circle */}
              <circle cx="200" cy="200" r="160" fill="rgba(37, 99, 235, 0.08)" />

              {/* 3D Open Chest / Vault Box at bottom */}
              <g transform="translate(65, 175) rotate(-12, 135, 120)">
                {/* Vault Back Wall */}
                <path d="M 40 50 L 230 50 L 210 170 L 60 170 Z" fill="url(#boxInner)" stroke="#2563eb" strokeWidth="2" />
                {/* Vault Open Lid Tilted Up */}
                <path d="M 40 50 L 230 50 L 205 -50 L 65 -50 Z" fill="#131c33" stroke="#3b82f6" strokeWidth="2.5" opacity="0.95" />
                <path d="M 75 -40 L 195 -40 L 215 40 L 55 40 Z" fill="#0f172a" />
                <circle cx="135" cy="-5" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="135" cy="-5" r="6" fill="#38bdf8" />
                
                {/* Vault Front Wall */}
                <path d="M 60 170 L 210 170 L 245 230 L 25 230 Z" fill="url(#boxGrad)" stroke="#3b82f6" strokeWidth="2.5" />
                {/* Front lock clasp */}
                <rect x="120" y="180" width="30" height="36" rx="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
                <path d="M 135 194 A 4 4 0 0 1 135 206 Z" fill="#38bdf8" />
              </g>

              {/* Floating Element 1: Padlock (Top Left) */}
              <g className="float-fast" style={{ transformOrigin: '110px 110px' }}>
                <rect x="90" y="115" width="44" height="38" rx="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" transform="rotate(-15, 112, 134)" />
                <path d="M 102 115 L 102 98 A 12 12 0 0 1 126 98 L 126 115" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" transform="rotate(-15, 112, 134)" />
                <circle cx="112" cy="132" r="5" fill="#ffffff" transform="rotate(-15, 112, 134)" />
              </g>

              {/* Floating Element 2: Silver Key (Top Center) */}
              <g className="float-slow" style={{ transformOrigin: '190px 95px' }}>
                <g transform="translate(160, 65) rotate(25)">
                  <circle cx="30" cy="30" r="18" fill="#f8fafc" stroke="#94a3b8" strokeWidth="4" />
                  <circle cx="30" cy="30" r="7" fill="#18233e" />
                  <rect x="45" y="26" width="42" height="8" rx="4" fill="#e2e8f0" />
                  <rect x="70" y="34" width="6" height="10" rx="2" fill="#e2e8f0" />
                  <rect x="80" y="34" width="6" height="14" rx="2" fill="#e2e8f0" />
                </g>
              </g>

              {/* Floating Element 3: Check Shield (Top Right) */}
              <g className="float-fast" style={{ transformOrigin: '275px 145px' }}>
                <g transform="translate(245, 115) rotate(12)">
                  <path d="M 30 5 L 55 15 C 55 45 42 65 30 75 C 18 65 5 45 5 15 Z" fill="url(#shieldGrad)" stroke="#60a5fa" strokeWidth="2.5" />
                  <path d="M 21 38 L 28 45 L 42 28" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>

              {/* Floating Element 4: Developer Badge </> (Mid Left) */}
              <g className="float-slow" style={{ transformOrigin: '95px 210px' }}>
                <g transform="translate(60, 185) rotate(-22)">
                  <rect x="0" y="0" width="56" height="46" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="11" y="31" fill="#f8fafc" fontSize="20" fontWeight="800" fontFamily="monospace">&lt;/&gt;</text>
                </g>
              </g>

              {/* Floating Element 5: Magnifying Glass (Mid Left Bottom) */}
              <g className="float-fast" style={{ transformOrigin: '120px 260px' }}>
                <g transform="translate(90, 235) rotate(-10)">
                  <circle cx="24" cy="24" r="18" fill="none" stroke="#3b82f6" strokeWidth="6" />
                  <line x1="36" y1="36" x2="55" y2="55" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
                </g>
              </g>

              {/* Floating Element 6: Contract Document & Hands (Center Right) */}
              <g className="float-slow" style={{ transformOrigin: '240px 230px' }}>
                {/* Blue Contract Document */}
                <g transform="translate(170, 160) rotate(8)">
                  <rect x="0" y="0" width="90" height="116" rx="10" fill="url(#scrollGrad)" stroke="#bae6fd" strokeWidth="2" />
                  {/* Rolled top scroll effect */}
                  <path d="M 0 0 C 45 -12 45 12 90 0" fill="none" stroke="#e0f2fe" strokeWidth="3" />
                  {/* Document lines */}
                  <line x1="18" y1="26" x2="72" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                  <line x1="18" y1="40" x2="72" y2="40" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                  <line x1="18" y1="54" x2="56" y2="54" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                  {/* Signature wave */}
                  <path d="M 28 85 Q 38 72 48 88 T 68 80" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                </g>

                {/* Left Hand holding bottom left of scroll */}
                <path d="M 175 240 C 175 220 185 210 195 215 C 200 218 202 226 195 235 L 180 275 L 155 285 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M 155 285 L 180 275 L 172 320 L 148 315 Z" fill="#ffffff" />

                {/* Right Hand holding pen & signing */}
                <path d="M 275 215 C 265 225 255 232 250 228 C 246 224 252 216 260 210 L 305 245 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M 305 245 L 285 225 L 325 255 L 335 275 Z" fill="#ffffff" />
                {/* Pen */}
                <line x1="248" y1="230" x2="280" y2="200" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
                <polygon points="244,234 249,229 246,226" fill="#f8fafc" />
              </g>
            </svg>
          </div>

          <div style={{ height: '20px' }}></div>
        </div>

        {/* RIGHT COLUMN: FORM MATCHING SCREENSHOT EXACTLY */}
        <div className="card-right">
          {/* STEP 1: INITIAL CREDENTIALS (LOGIN / REGISTER) */}
          {step === 1 && (
            <>
              <h2 className="form-heading">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </h2>
              <p className="form-subheading">
                {isLogin ? "Created for developers by developers" : "Created for developers by developers"}
              </p>

              {successMsg && <div className="alert-success"><FaCheck /> {successMsg}</div>}
              {error && <div className="alert-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} className="form-fields-wrapper">
                {!isLogin && (
                  <div className="input-group-box">
                    <FaRegUser className="input-icon-left" />
                    <input 
                      type="text" 
                      name="username" 
                      value={formData.username} 
                      placeholder="Full Name" 
                      onChange={handleChange} 
                      required 
                      className="custom-input" 
                    />
                  </div>
                )}

                <div className="input-group-box">
                  <FaRegEnvelope className="input-icon-left" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    placeholder="operator@cybersecure.com" 
                    onChange={handleChange} 
                    required 
                    className="custom-input" 
                  />
                </div>

                <div className="input-group-box">
                  <FaLock className="input-icon-left" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    placeholder="••••••••••••" 
                    onChange={handleChange} 
                    required 
                    className="custom-input" 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Checkbox row matching screenshot */}
                <div className="options-row">
                  {isLogin ? (
                    <>
                      <label className="checkbox-label" onClick={() => setRememberMe(!rememberMe)}>
                        <input 
                          type="checkbox" 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)} 
                          className="custom-checkbox" 
                        />
                        <span>Remember me for 30 days</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => { setError(''); setStep(4); }} 
                        className="forgot-link-btn"
                      >
                        Forgot password?
                      </button>
                    </>
                  ) : (
                    <label className="checkbox-label" onClick={() => setAgreeTerms(!agreeTerms)}>
                      <input 
                        type="checkbox" 
                        checked={agreeTerms} 
                        onChange={(e) => setAgreeTerms(e.target.checked)} 
                        className="custom-checkbox" 
                      />
                      <span>I agree to the Terms & Conditions</span>
                    </label>
                  )}
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Processing..." : isLogin ? "Sign in" : "Create my account"}
                </button>
              </form>

              <div className="switch-mode-footer">
                <span>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
                <button type="button" onClick={toggleAuthMode} className="switch-action-btn">
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </>
          )}

          {/* STEP 2: MFA METHOD SELECT */}
          {step === 2 && (
            <>
              <h2 className="form-heading">Security Verification</h2>
              <p className="form-subheading">
                Select where to transmit your one-time verification code.
              </p>

              {error && <div className="alert-error">⚠️ {error}</div>}

              <div className="form-fields-wrapper">
                <button onClick={() => handleSelectMethod('email')} disabled={loading} className="submit-btn">
                  <FaEnvelope style={{ fontSize: '1.1rem' }} /> Transmit Code to Email
                </button>
                <button onClick={() => setStep(1)} className="secondary-btn">
                  <FaArrowLeft /> Back to Credentials
                </button>
              </div>
            </>
          )}

          {/* STEP 3: MFA OTP VERIFY */}
          {step === 3 && (
            <>
              <h2 className="form-heading">Enter Access Key</h2>
              <p className="form-subheading">
                Input the 6-digit verification code sent to your email inbox.
              </p>

              {error && <div className="alert-error">⚠️ {error}</div>}

              <form onSubmit={handleVerifyOTP} className="form-fields-wrapper">
                <div className="input-group-box">
                  <input 
                    type="text" 
                    placeholder="000000" 
                    maxLength="6" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    className="custom-input otp-input-box" 
                  />
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Verifying..." : "Unlock Dashboard"}
                </button>
                <button type="button" onClick={() => setStep(2)} className="secondary-btn">
                  Resend Security Code
                </button>
              </form>
            </>
          )}

          {/* STEP 4: FORGOT PASSWORD - EMAIL REQUEST */}
          {step === 4 && (
            <>
              <h2 className="form-heading">Recover Access</h2>
              <p className="form-subheading">
                Enter your system email to initiate a password reset.
              </p>

              {error && <div className="alert-error">⚠️ {error}</div>}

              <form onSubmit={handleForgotPassword} className="form-fields-wrapper">
                <div className="input-group-box">
                  <FaRegEnvelope className="input-icon-left" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="operator@cybersecure.com" 
                    required 
                    className="custom-input" 
                  />
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Transmitting..." : "Send Reset Code"}
                </button>
                <button type="button" onClick={() => { setError(''); setStep(1); }} className="secondary-btn">
                  <FaArrowLeft /> Cancel
                </button>
              </form>
            </>
          )}

          {/* STEP 5: FORGOT PASSWORD - OTP + NEW PASSWORD */}
          {step === 5 && (
            <>
              <h2 className="form-heading">Reset Credentials</h2>
              <p className="form-subheading">
                Verify the reset code and establish a new access key.
              </p>

              {successMsg && <div className="alert-success"><FaCheck /> {successMsg}</div>}
              {error && <div className="alert-error">⚠️ {error}</div>}

              <form onSubmit={handleResetFinal} className="form-fields-wrapper">
                <div className="input-group-box">
                  <input 
                    type="text" 
                    placeholder="000000" 
                    maxLength="6" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    className="custom-input otp-input-box" 
                  />
                </div>
                <div className="input-group-box">
                  <FaLock className="input-icon-left" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="New Access Key" 
                    onChange={handleChange} 
                    required 
                    className="custom-input" 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Updating..." : "Update Credentials"}
                </button>
                <button type="button" onClick={() => { setError(''); setSuccessMsg(''); setStep(4); }} className="secondary-btn">
                  Resend Recovery Email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;