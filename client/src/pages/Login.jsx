import React, { useState, useEffect, useRef } from 'react';
import API, { loginUser, registerUser } from '../services/api'; 
import { 
  FaShieldAlt, FaUserPlus, FaFingerprint, FaEnvelope, FaKey, FaArrowLeft, FaSyncAlt
} from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Creds, 2: MFA Method, 3: OTP, 4: Forgot Email, 5: Reset Final
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const canvasRef = useRef(null);

  const themeBlue = '#38bdf8'; 

  useEffect(() => {
    localStorage.removeItem('token'); 
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; 
      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    initCanvas(); animate();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    setLoading(true);
    try {
      if (isLogin) {
        const res = await loginUser({ email: formData.email, password: formData.password });
        if (res.data.mfaRequired) {
          setUserId(res.data.userId);
          setStep(2); 
        }
      } else {
        await registerUser({ username: formData.username, email: formData.email, password: formData.password });
        setSuccessMsg("Operative profile initialized. Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Access denied. Verify system credentials.');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: formData.email });
      setSuccessMsg("Recovery code transmitted. Check your inbox.");
      setStep(5);
    } catch (err) { setError(err.response?.data?.msg || 'Email not found.'); }
    finally { setLoading(false); }
  };

  const handleResetFinal = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { email: formData.email, otp, newPassword: formData.password });
      setSuccessMsg("Access Key updated. You may now login.");
      setStep(1); setOtp('');
    } catch (err) { setError(err.response?.data?.msg || 'Reset failed.'); }
    finally { setLoading(false); }
  };

  const handleSelectMethod = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/send-otp', { userId, method: 'email' }); 
      setStep(3); 
    } catch (err) { setError('Transmission failed.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { userId, otp });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.replace('/dashboard'); 
      }
    } catch (err) { setError('Invalid verification code.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={fullPageWrapper}>
      <canvas ref={canvasRef} style={canvasStyle} />
      
      <div style={mainContent}>
        <div style={brandOverlay}>
          <div style={logoContainer}>
            <FaShieldAlt style={{...logoIcon, color: themeBlue, filter: `drop-shadow(0 0 10px ${themeBlue})`}} />
            <span style={logoText}>CYBERHUB</span>
          </div>
          <div style={{...liveData, borderLeft: `2px solid ${themeBlue}`}}>
            <div style={dataLine}>NODE_STATUS: <span style={{color: themeBlue}}>ENCRYPTED</span></div>
            <div style={dataLine}>REGION: <span style={{color: themeBlue}}>SOUTH_ASIA</span></div>
          </div>
        </div>

        <div style={formContainer}>
          <div style={{...cornerTL, borderColor: themeBlue}} />
          <div style={{...cornerTR, borderColor: themeBlue}} />
          <div style={{...cornerBL, borderColor: themeBlue}} />
          <div style={{...cornerBR, borderColor: themeBlue}} />
          
          <div style={{...glassBox, border: `1px solid rgba(56, 189, 248, 0.2)`}}>
            {/* STEP 1: LOGIN/REGISTER */}
            {step === 1 && (
              <>
                <h2 style={{...formTitle, color: themeBlue}}>{isLogin ? "USER LOGIN" : "INITIALIZE"}</h2>
                <div style={{...divider, background: `linear-gradient(90deg, transparent, ${themeBlue}, transparent)`}} />
                
                {successMsg && <div style={successBox}>{successMsg}</div>}
                {error && <div style={errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={formFlow}>
                  {!isLogin && (
                    <div style={inputWrap}>
                      <FaUserPlus style={{...inputIcon, color: themeBlue}} />
                      <input type="text" name="username" value={formData.username} placeholder="OPERATIVE NAME" onChange={handleChange} required style={{...fieldStyle, border: `1px solid rgba(56, 189, 248, 0.3)`}} />
                    </div>
                  )}
                  <div style={inputWrap}>
                    <FaEnvelope style={{...inputIcon, color: themeBlue}} />
                    <input type="email" name="email" value={formData.email} placeholder="SYSTEM EMAIL" onChange={handleChange} required style={{...fieldStyle, border: `1px solid rgba(56, 189, 248, 0.3)`}} />
                  </div>
                  <div style={inputWrap}>
                    <FaKey style={{...inputIcon, color: themeBlue}} />
                    <input type="password" name="password" value={formData.password} placeholder="ACCESS KEY" onChange={handleChange} required style={{...fieldStyle, border: `1px solid rgba(56, 189, 248, 0.3)`}} />
                  </div>
                  <button type="submit" disabled={loading} style={{...primaryBtn, background: themeBlue, boxShadow: `0 0 15px rgba(56, 189, 248, 0.4)`}}>
                    {loading ? "PROCESSING..." : isLogin ? "DECRYPT ACCESS" : "REGISTER PROFILE"}
                  </button>
                </form>

                {isLogin && (
                  <button onClick={() => setStep(4)} style={{...toggleBtn, color: themeBlue, marginTop: '15px', textDecoration: 'none'}}>
                    Forgot Access Key?
                  </button>
                )}

                <div style={footerAction}>
                  <button onClick={toggleAuthMode} style={{...toggleBtn, color: themeBlue}}>
                    {isLogin ? "[ NEW OPERATIVE ]" : "[ BACK TO TERMINAL ]"}
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: MFA SELECT */}
            {step === 2 && (
              <div style={formFlow}>
                <h2 style={{...formTitle, color: themeBlue}}>MFA REQUIRED</h2>
                <p style={{textAlign: 'center', fontSize: '0.8rem', opacity: 0.7}}>Request a verification code to your email.</p>
                <button onClick={handleSelectMethod} style={{...primaryBtn, background: themeBlue}}>
                  TRANSMIT TO EMAIL
                </button>
                <button onClick={() => setStep(1)} style={toggleBtn}>CANCEL</button>
              </div>
            )}

            {/* STEP 3: OTP ENTRY */}
            {step === 3 && (
              <form onSubmit={handleVerifyOTP} style={formFlow}>
                <FaFingerprint style={{fontSize: '3rem', color: themeBlue, alignSelf:'center', marginBottom:'20px'}} />
                <h2 style={{...formTitle, color: themeBlue}}>VERIFICATION</h2>
                {error && <div style={errorBox}>{error}</div>}
                <input type="text" placeholder="000000" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} required style={{...otpInput, border: `1px solid rgba(56, 189, 248, 0.3)`}} />
                <button type="submit" disabled={loading} style={{...primaryBtn, background: themeBlue}}>AUTHORIZE</button>
                <button type="button" onClick={() => setStep(2)} style={toggleBtn}>RESEND CODE</button>
              </form>
            )}

            {/* STEP 4: FORGOT PASSWORD REQUEST */}
            {step === 4 && (
              <form onSubmit={handleForgotPassword} style={formFlow}>
                <h2 style={{...formTitle, color: themeBlue}}>RECOVER ACCESS</h2>
                <p style={{textAlign: 'center', fontSize: '0.8rem', opacity: 0.7}}>Enter your system email to initiate recovery.</p>
                {error && <div style={errorBox}>{error}</div>}
                <div style={inputWrap}>
                  <FaEnvelope style={{...inputIcon, color: themeBlue}} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="SYSTEM EMAIL" required style={{...fieldStyle, border: `1px solid rgba(56, 189, 248, 0.3)`}} />
                </div>
                <button type="submit" disabled={loading} style={{...primaryBtn, background: themeBlue}}>SEND RESET CODE</button>
                <button type="button" onClick={() => setStep(1)} style={toggleBtn}>CANCEL</button>
              </form>
            )}

            {/* STEP 5: FINAL RESET */}
            {step === 5 && (
              <form onSubmit={handleResetFinal} style={formFlow}>
                <FaSyncAlt style={{fontSize: '3rem', color: themeBlue, alignSelf:'center', marginBottom:'20px'}} />
                <h2 style={{...formTitle, color: themeBlue}}>RESET KEY</h2>
                {successMsg && <div style={successBox}>{successMsg}</div>}
                {error && <div style={errorBox}>{error}</div>}
                <div style={inputWrap}>
                  <FaFingerprint style={{...inputIcon, color: themeBlue}} />
                  <input type="text" placeholder="RESET CODE" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} required style={{...fieldStyle, border: `1px solid rgba(56, 189, 248, 0.3)`}} />
                </div>
                <div style={inputWrap}>
                  <FaKey style={{...inputIcon, color: themeBlue}} />
                  <input type="password" name="password" placeholder="NEW ACCESS KEY" onChange={handleChange} required style={{...fieldStyle, border: `1px solid rgba(56, 189, 248, 0.3)`}} />
                </div>
                <button type="submit" disabled={loading} style={{...primaryBtn, background: themeBlue}}>UPDATE ACCESS KEY</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== STYLES ===== */

const fullPageWrapper = { width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, #020617 0%, #000000 100%)', color: '#e2e8f0', display: 'flex', overflow: 'hidden', fontFamily: "'JetBrains Mono', monospace" };
const canvasStyle = { position: 'absolute', top: 0, left: 0, pointerEvents: 'none' };
const mainContent = { zIndex: 10, display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', padding: '0 5%' };
const brandOverlay = { display: 'flex', flexDirection: 'column', gap: '40px' };
const logoContainer = { display: 'flex', alignItems: 'center', gap: '15px' };
const logoIcon = { fontSize: '4rem' };
const logoText = { fontSize: '3rem', fontWeight: '900', letterSpacing: '5px' };
const liveData = { paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.7 };
const dataLine = { marginBottom: '5px' };
const formContainer = { position: 'relative', padding: '10px' };
const glassBox = { width: '400px', padding: '40px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(15px)', boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)', borderRadius: '2px' };
const cornerCommon = { position: 'absolute', width: '30px', height: '30px', borderWidth: '3px', borderStyle: 'solid' };
const cornerTL = { ...cornerCommon, top: 0, left: 0, borderRight: 'none', borderBottom: 'none' };
const cornerTR = { ...cornerCommon, top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' };
const cornerBL = { ...cornerCommon, bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' };
const cornerBR = { ...cornerCommon, bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' };
const formTitle = { fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', letterSpacing: '2px' };
const divider = { height: '1px', margin: '20px 0' };
const formFlow = { display: 'flex', flexDirection: 'column', gap: '25px' };
const inputWrap = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon = { position: 'absolute', left: '15px', opacity: 0.6 };
const fieldStyle = { width: '100%', padding: '15px 15px 15px 45px', background: 'rgba(30, 41, 59, 0.5)', color: '#fff', outline: 'none', fontSize: '0.9rem' };
const primaryBtn = { padding: '15px', color: '#0f172a', fontWeight: '900', border: 'none', cursor: 'pointer', letterSpacing: '2px', transition: '0.3s' };
const otpInput = { ...fieldStyle, textAlign: 'center', fontSize: '2rem', letterSpacing: '10px', paddingLeft: '15px' };
const footerAction = { marginTop: '30px', textAlign: 'center' };
const toggleBtn = { background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.7 };
const errorBox = { background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '10px', marginBottom: '20px', fontSize: '0.8rem', borderLeft: '3px solid #ef4444' };
const successBox = { background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '10px', marginBottom: '20px', fontSize: '0.8rem', borderLeft: '3px solid #22c55e' };

export default Login;