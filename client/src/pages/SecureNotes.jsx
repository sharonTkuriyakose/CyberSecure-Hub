import React, { useState, useEffect } from 'react';
import { getNotes, addNote, deleteNote } from '../services/api';
import CryptoJS from 'crypto-js';
import { FaShieldAlt, FaPlus, FaTrashAlt, FaStickyNote, FaLock } from 'react-icons/fa';

const SecureNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  // Security Note: In production, this should be moved to a secure environment variable.
  const secretKey = "a_very_strong_32_char_vault_key_!"; 

  useEffect(() => {
    fetchAndDecryptNotes();
  }, []);

  /**
   * ✅ Safely formats the MongoDB timestamp
   */
  const formatStoredDate = (dateString) => {
    if (!dateString) return "Date Unknown";
    const date = new Date(dateString);
    
    // Check if the date object is valid to prevent "Invalid Date" display
    if (isNaN(date.getTime())) return "Date Unknown";

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fetchAndDecryptNotes = async () => {
    try {
      setLoading(true);
      const res = await getNotes();
      
      const decryptedData = res.data.map(note => {
        try {
          const bytes = CryptoJS.AES.decrypt(note.content, secretKey);
          const originalText = bytes.toString(CryptoJS.enc.Utf8);
          return {
            ...note,
            content: originalText || "Error: Unable to decrypt content." 
          };
        } catch (e) {
          return { ...note, content: "[Encrypted Data]" };
        }
      });
      
      setNotes(decryptedData);
    } catch (err) {
      console.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;

    const encryptedContent = CryptoJS.AES.encrypt(newNote.content, secretKey).toString();
    
    try {
      await addNote({ title: newNote.title, content: encryptedContent });
      setNewNote({ title: '', content: '' });
      fetchAndDecryptNotes(); 
    } catch (err) {
      console.error("Encryption/Upload failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently destroy this encrypted record?")) {
      try {
        await deleteNote(id);
        setNotes(notes.filter(n => n._id !== id));
      } catch (err) {
        console.error("Delete failed");
      }
    }
  };

  return (
    <div style={pageWrapper}>
      <style>{`
        .glass-card {
          background: var(--card-bg) !important;
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-color) !important;
          transition: 0.3s ease;
        }
        .note-item:hover {
          border-color: var(--accent-color) !important;
          transform: translateY(-4px);
        }
        textarea::placeholder, input::placeholder { color: var(--text-secondary); }
      `}</style>

      <div style={container}>
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}><FaStickyNote style={{color: 'var(--accent-color)'}}/> Secure Notes</h1>
            <p style={subtitleStyle}>Zero-Knowledge AES-256 Storage</p>
          </div>
          <div style={securityBadge}>
            <FaShieldAlt /> <span>Vault Active</span>
          </div>
        </header>

        {/* Input Section */}
        <div className="glass-card" style={inputAreaStyle}>
          <form onSubmit={handleAddNote} style={formStyle}>
            <input 
              required
              value={newNote.title} 
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              placeholder="Note Title (e.g., Server Credentials)"
              style={inputStyle}
            />
            <textarea 
              required
              value={newNote.content} 
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              placeholder="Enter sensitive information here... (Will be encrypted locally)"
              style={textareaStyle}
            />
            <button type="submit" style={buttonStyle}>
              <FaLock /> Encrypt & Save to Cloud
            </button>
          </form>
        </div>

        {/* Notes Grid */}
        <div style={gridStyle}>
          {loading ? (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Decrypting vault entries...</p>
          ) : notes.map(note => (
            <div key={note._id} className="glass-card note-item" style={noteCardStyle}>
              <div style={noteHeader}>
                <h3 style={noteTitle}>{note.title}</h3>
                <FaTrashAlt 
                  style={deleteIcon} 
                  onClick={() => handleDelete(note._id)}
                />
              </div>
              <p style={noteContent}>{note.content}</p>
              
              {/* ✅ UPDATED DATE DISPLAY */}
              <div style={timestamp}>
                Stored: {formatStoredDate(note.createdAt)}
              </div>
            </div>
          ))}
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

const container = { maxWidth: '1000px', margin: '0 auto' };

const headerStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '40px' 
};

const titleStyle = { 
  fontSize: '2rem', 
  fontWeight: '900', 
  margin: 0, 
  display: 'flex', 
  alignItems: 'center', 
  gap: '15px' 
};

const subtitleStyle = { 
  color: 'var(--text-secondary)', 
  fontSize: '0.9rem', 
  marginTop: '5px' 
};

const securityBadge = { 
  background: 'rgba(56, 189, 248, 0.1)', 
  color: 'var(--accent-color)', 
  padding: '8px 16px', 
  borderRadius: '20px', 
  fontSize: '0.8rem', 
  fontWeight: 'bold', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  border: '1px solid var(--border-color)' 
};

const inputAreaStyle = { padding: '30px', borderRadius: '20px', marginBottom: '40px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };

const inputStyle = { 
  padding: '12px 18px', 
  background: 'var(--bg-secondary)', 
  color: 'var(--text-primary)', 
  border: '1px solid var(--border-color)', 
  borderRadius: '10px', 
  fontSize: '1rem', 
  outline: 'none',
  transition: 'all 0.3s ease'
};

const textareaStyle = { ...inputStyle, minHeight: '120px', resize: 'vertical' };

const buttonStyle = { 
  padding: '14px', 
  background: 'var(--accent-color)', 
  color: '#020617', 
  cursor: 'pointer', 
  border: 'none', 
  borderRadius: '10px', 
  fontWeight: '900', 
  fontSize: '1rem', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '10px' 
};

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
  gap: '20px' 
};

const noteCardStyle = { 
  padding: '20px', 
  borderRadius: '16px', 
  display: 'flex', 
  flexDirection: 'column' 
};

const noteHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' };
const noteTitle = { margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-color)' };
const deleteIcon = { color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem', transition: '0.2s' };

const noteContent = { 
  fontSize: '0.95rem', 
  color: 'var(--text-primary)', 
  lineHeight: '1.6', 
  margin: '0 0 15px 0', 
  flex: 1, 
  whiteSpace: 'pre-wrap' 
};

const timestamp = { 
  fontSize: '0.75rem', 
  color: 'var(--text-secondary)', 
  fontWeight: '600' 
};

export default SecureNotes;