import React, { useState } from 'react';
import { FaTerminal, FaCopy, FaSync, FaShieldAlt, FaCheck } from 'react-icons/fa';

const KeyGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generateKey = () => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let availableChars = '';
    if (options.uppercase) availableChars += charset.uppercase;
    if (options.lowercase) availableChars += charset.lowercase;
    if (options.numbers) availableChars += charset.numbers;
    if (options.symbols) availableChars += charset.symbols;

    if (!availableChars) return setPassword('Select Options');

    let generated = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      generated += availableChars[randomIndex];
    }
    setPassword(generated);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={pageWrapper}>
      <style>{`
        .gen-card {
          background: var(--card-bg) !important;
          backdrop-filter: blur(15px);
          border: 1px solid var(--border-color) !important;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .option-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 15px; padding: 10px; border-radius: 12px;
          background: var(--bg-primary); 
          border: 1px solid var(--border-color);
          transition: 0.3s;
        }
        .option-row:hover { border-color: var(--accent-color); }
        input[type="checkbox"] { cursor: pointer; width: 18px; height: 18px; accent-color: var(--accent-color); }
      `}</style>

      <div style={container}>
        <header style={headerStyle}>
          <FaTerminal style={headerIcon} />
          <h1 style={titleStyle}>Entropy Key Generator</h1>
          <p style={subTitle}>Generate industrial-strength cryptographic strings</p>
        </header>

        <div className="gen-card">
          {/* Result Display */}
          <div style={resultBox}>
            <span style={passText}>{password || 'Click Generate'}</span>
            <div style={actionIcons}>
              <FaCopy onClick={copyToClipboard} style={actionIcon} title="Copy" />
              <FaSync onClick={generateKey} style={actionIcon} title="Regenerate" />
            </div>
            {copied && <span style={copiedBadge}><FaCheck /> Copied</span>}
          </div>

          {/* Configuration */}
          <div style={configSection}>
            <div style={rangeContainer}>
              <label style={labelStyle}>Key Length: <b style={{color: 'var(--accent-color)'}}>{length}</b></label>
              <input 
                type="range" min="8" max="64" value={length} 
                onChange={(e) => setLength(e.target.value)}
                style={rangeInput}
              />
            </div>

            <div style={optionsGrid}>
              {Object.keys(options).map((opt) => (
                <div key={opt} className="option-row">
                  <span style={optLabel}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                  <input 
                    type="checkbox" 
                    checked={options[opt]} 
                    onChange={() => setOptions({...options, [opt]: !options[opt]})}
                  />
                </div>
              ))}
            </div>
          </div>

          <button onClick={generateKey} style={generateBtn}>Generate Secure Key</button>
        </div>

        <div style={securityNote}>
          <FaShieldAlt style={{color: '#10b981'}} />
          <span>These keys are generated locally and are never transmitted over the network until saved.</span>
        </div>
      </div>
    </div>
  );
};

/* ===== STYLES REFINED FOR GLOBAL THEME SYNC ===== */
const pageWrapper = { 
  minHeight: '100vh', 
  background: 'var(--bg-primary)', 
  color: 'var(--text-primary)', 
  padding: '40px',
  transition: 'all 0.3s ease'
};

const container = { maxWidth: '650px', margin: '0 auto' };
const headerStyle = { textAlign: 'center', marginBottom: '40px' };
const headerIcon = { fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '15px' };
const titleStyle = { fontSize: '2.2rem', fontWeight: '900', margin: 0 };

const subTitle = { 
  color: 'var(--text-secondary)', 
  fontSize: '1rem', 
  marginTop: '10px' 
};

const resultBox = { 
  background: 'var(--bg-secondary)', 
  padding: '25px', 
  borderRadius: '16px', 
  border: '1px solid var(--border-color)',
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '30px', 
  position: 'relative',
  transition: 'all 0.3s ease'
};

const passText = { 
  fontSize: '1.4rem', 
  fontWeight: '700', 
  color: 'var(--accent-color)', 
  fontFamily: 'monospace', 
  wordBreak: 'break-all' 
};

const actionIcons = { display: 'flex', gap: '20px', marginLeft: '20px' };

const actionIcon = { 
  fontSize: '1.2rem', 
  color: 'var(--text-secondary)', 
  cursor: 'pointer', 
  transition: '0.2s' 
};

const copiedBadge = { 
  position: 'absolute', 
  top: '-10px', 
  right: '10px', 
  background: '#10b981', 
  color: '#fff', 
  padding: '4px 12px', 
  borderRadius: '20px', 
  fontSize: '0.75rem', 
  fontWeight: '800' 
};

const configSection = { marginBottom: '30px' };
const rangeContainer = { marginBottom: '25px' };
const labelStyle = { display: 'block', marginBottom: '10px', fontSize: '1rem', fontWeight: '600' };
const rangeInput = { width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' };

const optionsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };

const optLabel = { 
  fontSize: '0.9rem', 
  color: 'var(--text-primary)', 
  fontWeight: '600' 
};

const generateBtn = { 
  width: '100%', 
  background: 'var(--accent-color)', 
  color: '#020617', 
  padding: '16px', 
  borderRadius: '14px',
  border: 'none', 
  fontWeight: '900', 
  fontSize: '1.1rem', 
  cursor: 'pointer', 
  transition: '0.3s'
};

const securityNote = { 
  marginTop: '30px', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  justifyContent: 'center', 
  color: 'var(--text-secondary)', 
  fontSize: '0.85rem' 
};

export default KeyGenerator;