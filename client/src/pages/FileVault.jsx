import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FaShieldAlt, FaTrashAlt, FaFileAlt, FaCloudUploadAlt, FaEye } from 'react-icons/fa';

const FileVault = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await API.get('/data/files');
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await API.post('/data/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ text: "Success: Asset encrypted.", type: 'success' });
      setFile(null);
      fetchFiles();
    } catch (err) {
      setMessage({ text: "Error: Could not reach secure server.", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanent delete?")) {
      try {
        await API.delete(`/data/files/${id}`);
        setFiles(files.filter(f => f._id !== id));
      } catch (err) {
        alert("Action denied: Server error.");
      }
    }
  };

  const handleView = (url) => {
    if (!url) return;
    let secureUrl = url.replace('http://', 'https://');
    window.open(secureUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={vaultWrapper}>
      {/* HEADER: Responsive to text color variables */}
      <header style={headerStyle}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Secure File Vault</h1>
        <div style={securityBadge}>
          <FaShieldAlt /> <span>System Protected</span>
        </div>
      </header>

      {message.text && (
        <div style={{
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '8px', 
          background: message.type === 'success' ? '#064e3b' : '#7f1d1d',
          color: message.type === 'success' ? '#10b981' : '#f87171',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {/* UPLOAD CARD: Responsive to secondary background and accent colors */}
      <form onSubmit={handleUpload} style={uploadCard}>
        <input type="file" id="file-input" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
        <label htmlFor="file-input" style={uploadLabel}>
          <FaCloudUploadAlt size={35} color="var(--accent-color)" />
          <span style={{ marginTop: '10px', color: 'var(--accent-color)' }}>{file ? file.name : "Click to select asset"}</span>
        </label>
        <button disabled={!file || uploading} style={file ? btnActive : btnDisabled}>
          {uploading ? "Encrypting..." : "Secure Upload"}
        </button>
      </form>

      <div style={gridStyle}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1' }}>Decrypting vault assets...</p>
        ) : files.map(f => (
          <div key={f._id} style={cardStyle}>
            <div style={previewBox}>
              {f.fileType?.includes('image') ? (
                <img src={f.fileUrl} alt="Secure" style={imgStyle} />
              ) : (
                <FaFileAlt size={45} color="var(--text-secondary)" />
              )}
            </div>
            <div style={infoStyle}>
              <p style={fileName} title={f.fileName}>{f.fileName}</p>
              <div style={actions}>
                <button onClick={() => handleView(f.fileUrl)} style={iconBtn}>
                  <FaEye size={18} />
                </button>
                <button onClick={() => handleDelete(f._id)} style={deleteBtn}>
                  <FaTrashAlt size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===== STYLES REFINED FOR GLOBAL THEME SYNC ===== */
const vaultWrapper = { padding: '40px', maxWidth: '1100px', margin: '0 auto' };

const headerStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '40px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '20px'
};

const securityBadge = { 
  background: 'rgba(16, 185, 129, 0.1)', 
  color: '#10b981', 
  padding: '8px 16px', 
  borderRadius: '20px', 
  fontSize: '0.8rem', 
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #064e3b' 
};

const uploadCard = { 
  background: 'var(--bg-secondary)', 
  padding: '40px', 
  borderRadius: '16px', 
  border: '2px dashed var(--border-color)', 
  textAlign: 'center',
  transition: 'all 0.3s ease'
};

const uploadLabel = { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' };

const btnActive = { 
  width: '100%', 
  maxWidth: '300px', 
  marginTop: '25px', 
  padding: '12px', 
  background: 'var(--accent-color)', 
  borderRadius: '8px', 
  border: 'none', 
  fontWeight: '900', 
  color: '#020617', 
  cursor: 'pointer' 
};

const btnDisabled = { ...btnActive, background: 'var(--border-color)', color: 'var(--text-secondary)', cursor: 'not-allowed' };

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
  gap: '25px', 
  marginTop: '40px' 
};

const cardStyle = { 
  background: 'var(--card-bg)', 
  borderRadius: '12px', 
  border: '1px solid var(--border-color)', 
  overflow: 'hidden',
  transition: 'all 0.3s ease'
};

const previewBox = { 
  height: '150px', 
  background: 'rgba(0,0,0,0.05)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center' 
};

const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const infoStyle = { padding: '15px' };

const fileName = { 
  color: 'var(--text-primary)', 
  fontSize: '0.85rem', 
  fontWeight: '600', 
  whiteSpace: 'nowrap', 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  margin: '0 0 10px 0' 
};

const actions = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

const iconBtn = { 
  color: 'var(--accent-color)', 
  background: 'none', 
  border: 'none', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  padding: '5px' 
};

const deleteBtn = { ...iconBtn, color: '#ef4444' };

export default FileVault;