import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  FaKey, FaPlus, FaSearch, FaCopy, FaTrash, FaEye, FaEyeSlash, FaShieldAlt, FaTimes, FaEdit 
} from 'react-icons/fa';

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPass, setShowPass] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({ title: '', username: '', password: '' });

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const res = await API.get('/data/passwords');
      setPasswords(res.data || []);
    } catch (err) {
      console.error("Vault access failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await API.put(`/data/passwords/${editingId}`, newEntry);
        setPasswords(passwords.map(p => p._id === editingId ? res.data : p));
      } else {
        const res = await API.post('/data/passwords', newEntry);
        setPasswords([...passwords, res.data]); 
      }
      closeModal();
    } catch (err) {
      alert("Failed to secure credential. Check backend connection.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this credential from your vault?")) {
      try {
        await API.delete(`/data/passwords/${id}`);
        setPasswords(passwords.filter(p => p._id !== id));
      } catch (err) {
        alert("Delete failed. Vault is locked.");
      }
    }
  };

  const handleEdit = (pw) => {
    setEditingId(pw._id);
    setNewEntry({ title: pw.title, username: pw.username, password: pw.password });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewEntry({ title: '', username: '', password: '' });
  };

  const toggleVisibility = (id) => {
    setShowPass(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to secure clipboard!");
  };

  const filteredPasswords = passwords.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={pageWrapper}>
      {/* Updated dynamic styles using CSS variables */}
      <style>{`
        .pass-card {
          transition: all 0.3s ease;
          background: var(--card-bg) !important;
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color) !important;
        }
        .pass-card:hover {
          border-color: var(--accent-color) !important;
          transform: translateX(5px);
        }
        .action-btn:hover { color: var(--accent-color); cursor: pointer; }
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px);
          display: flex; justify-content: center; align-items: center; z-index: 1000;
        }
      `}</style>

      <div style={container}>
        <header style={header}>
          <div>
            <h1 style={title}><FaKey style={{color: 'var(--accent-color)'}}/> Password Vault</h1>
            <p style={subtitle}>Military-Grade Credential Management</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={addBtn}>
            <FaPlus /> Add Credential
          </button>
        </header>

        <div style={searchContainer}>
          <FaSearch style={searchIcon} />
          <input 
            type="text" 
            placeholder="Search vault..." 
            style={searchInput}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={listContainer}>
          {loading ? <p style={{color: 'var(--text-secondary)'}}>Decrypting Vault...</p> : filteredPasswords.map(pw => (
            <div key={pw._id} className="pass-card" style={cardStyle}>
              <div style={infoArea}>
                <h4 style={pwTitle}>{pw.title}</h4>
                <p style={pwUser}>{pw.username}</p>
              </div>
              
              <div style={passArea}>
                <input 
                  type={showPass[pw._id] ? "text" : "password"} 
                  value={pw.password} 
                  readOnly 
                  style={passInput}
                />
                <div style={iconGroup}>
                  <span onClick={() => toggleVisibility(pw._id)} className="action-btn">
                    {showPass[pw._id] ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <FaCopy className="action-btn" onClick={() => copyToClipboard(pw.password)} />
                  <FaEdit className="action-btn" onClick={() => handleEdit(pw)} />
                  <FaTrash className="action-btn" style={{color: '#ef4444'}} onClick={() => handleDelete(pw._id)} />
                </div>
              </div>
            </div>
          ))}
          {!loading && filteredPasswords.length === 0 && (
            <div style={emptyState}>
              <FaShieldAlt style={{fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px'}}/>
              <p style={{color: 'var(--text-secondary)'}}>Your vault is empty. Start securing your digital life.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div style={modalContent}>
            <div style={modalHeader}>
              <h2 style={{margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)'}}>{editingId ? 'Edit Entry' : 'Secure New Entry'}</h2>
              <FaTimes onClick={closeModal} style={{cursor: 'pointer', color: 'var(--text-secondary)'}} />
            </div>
            <form onSubmit={handleSave} style={modalForm}>
              <div style={inputGroup}>
                <label style={labelStyle}>Service / Website Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Google, GitHub" 
                  style={modalInput}
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Username / Email</label>
                <input 
                  required
                  type="text" 
                  placeholder="admin@example.com" 
                  style={modalInput}
                  value={newEntry.username}
                  onChange={(e) => setNewEntry({...newEntry, username: e.target.value})}
                />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••" 
                  style={modalInput}
                  value={newEntry.password}
                  onChange={(e) => setNewEntry({...newEntry, password: e.target.value})}
                />
              </div>
              <button type="submit" style={saveBtn}>
                {editingId ? 'Update & Encrypt' : 'Encrypt & Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== STYLES REFINED FOR GLOBAL THEME SYNC ===== */
const pageWrapper = { minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '40px', transition: 'all 0.3s ease' };
const container = { maxWidth: '900px', margin: '0 auto' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const title = { fontSize: '2rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' };
const subtitle = { color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' };

const addBtn = { background: 'var(--accent-color)', color: '#020617', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };

const searchContainer = { position: 'relative', marginBottom: '30px' };
const searchIcon = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' };
const searchInput = { width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '15px 15px 15px 45px', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' };

const listContainer = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '15px' };

const infoArea = { flex: 1 };
const pwTitle = { margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' };
const pwUser = { margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' };

const passArea = { display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-secondary)', padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-color)' };
const passInput = { background: 'transparent', border: 'none', color: 'var(--accent-color)', fontSize: '1rem', width: '150px', outline: 'none', fontFamily: 'monospace' };
const iconGroup = { display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '1.1rem' };

const emptyState = { textAlign: 'center', padding: '60px', background: 'var(--card-bg)', borderRadius: '24px', border: '2px dashed var(--border-color)' };

const modalContent = { background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '450px' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const modalForm = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' };
const modalInput = { background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' };
const saveBtn = { background: 'var(--accent-color)', color: '#020617', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' };

export default PasswordManager;