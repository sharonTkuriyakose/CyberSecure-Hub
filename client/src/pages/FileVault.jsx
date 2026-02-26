import React, { useState, useEffect } from 'react';
import API from '../services/api';
// ✅ Import the Supabase client
import { supabase } from '../supabaseClient'; 
import { 
  FaShieldAlt, 
  FaTrashAlt, 
  FaFileAlt, 
  FaCloudUploadAlt, 
  FaEye, 
  FaTimes, 
  FaDownload, 
  FaCalendarAlt,
  FaFolderOpen // ✅ New Folder Icon added
} from 'react-icons/fa';

const FileVault = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // ✅ State for Secure Preview
  const [previewFile, setPreviewFile] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await API.get('/data/files');
      const data = Array.isArray(res.data) ? res.data : [];
      
      const filesWithUrls = await Promise.all(data.map(async (f) => {
        if (f.fileType?.includes('image') && f.storagePath) {
          const { data: urlData } = await supabase.storage
            .from('vault') 
            .createSignedUrl(f.storagePath, 3600); 
          return { ...f, fileUrl: urlData?.signedUrl };
        }
        return f;
      }));

      filesWithUrls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFiles(filesWithUrls);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const formatSubmissionDate = (dateString) => {
    if (!dateString) return "Processing...";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date Unknown";

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * ✅ STABILITY HELPER: Exponential Backoff Retry
   * This specifically targets the "Network Error" caused by regional DNS issues.
   */
  const uploadWithRetry = async (path, fileData, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase.storage
          .from('vault')
          .upload(path, fileData, { upsert: true });

        if (error) throw error;
        return data; // Success!
      } catch (err) {
        const isNetworkError = err.message?.includes('fetch') || !navigator.onLine;
        if (isNetworkError && i < retries - 1) {
          console.warn(`[RETRY ${i + 1}] DNS fluctuation detected. Retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // Wait longer each time
          continue;
        }
        throw err; // Final fail
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    setMessage({ text: "Verifying Secure Cloud Path...", type: 'success' });

    try {
      // ✅ Wake up the connection first
      await supabase.auth.getSession();

      const userId = "dev_vault_user"; 
      const filePath = `${userId}/${Date.now()}_${file.name}`;

      // 1. Perform Upload with Auto-Retry Logic
      const storageData = await uploadWithRetry(filePath, file);

      // 2. Save metadata to MongoDB
      await API.post('/data/upload', {
        fileName: file.name,
        storagePath: storageData.path, 
        fileType: file.type,
        fileSize: file.size
      });

      setMessage({ text: "Success: Asset secured in Vault.", type: 'success' });
      setFile(null);
      fetchFiles(); 
    } catch (err) {
      console.error("Upload Error:", err);
      const errorMsg = err.message?.includes('fetch') 
        ? "Network Unstable: Your ISP DNS is blocking the connection. Please try again or use Google DNS (8.8.8.8)." 
        : (err.message || "Vault connection failed.");
      setMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, storagePath) => {
    if (window.confirm("Permanent delete? This action cannot be undone.")) {
      try {
        if (storagePath) {
          await supabase.storage.from('vault').remove([storagePath]);
        }
        await API.delete(`/data/files/${id}`);
        setFiles(files.filter(f => f._id !== id));
      } catch (err) {
        alert("Action denied: Server error.");
      }
    }
  };

  const handleView = async (f) => {
    if (!f.storagePath) {
      alert("Secure path missing for this asset.");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('vault') 
        .createSignedUrl(f.storagePath, 60);

      if (error) throw error;

      if (data?.signedUrl) {
        setPreviewFile({ ...f, fileUrl: data.signedUrl });
      }
    } catch (err) {
      console.error("Access Error:", err);
      alert("Unauthorized: Access restricted.");
    }
  };

  return (
    <div style={vaultWrapper}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* ✅ Integrated Folder Icon from your request */}
          <div style={iconBox}>
            <FaFolderOpen size={28} color="var(--accent-color)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem' }}>Secure File Vault</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Cloud-Based Encrypted Storage</p>
          </div>
        </div>
        <div style={securityBadge}>
          <FaShieldAlt /> <span>System Protected</span>
        </div>
      </header>

      {message.text && (
        <div style={{
          padding: '12px', 
          marginBottom: '20px', 
          borderRadius: '8px', 
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#10b981' : '#f87171',
          border: `1px solid ${message.type === 'success' ? '#064e3b' : '#7f1d1d'}`,
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {/* UPLOAD CARD */}
      <form onSubmit={handleUpload} style={uploadCard}>
        <input type="file" id="file-input" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
        <label htmlFor="file-input" style={uploadLabel}>
          <FaCloudUploadAlt size={40} color="var(--accent-color)" />
          <span style={{ marginTop: '15px', color: 'var(--accent-color)', fontWeight: '600' }}>
            {file ? file.name : "Select Document or Image"}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '5px' }}>Max file size: 50MB</span>
        </label>
        <button disabled={!file || uploading} style={file ? btnActive : btnDisabled}>
          {uploading ? "Verifying Vault Path..." : "Secure Upload"}
        </button>
      </form>

      {/* ASSET GRID */}
      <div style={gridStyle}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>Decrypting vault assets...</p>
        ) : files.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>No assets found in vault.</p>
        ) : files.map(f => (
          <div key={f._id} style={cardStyle}>
            <div style={previewBox}>
              {f.fileType?.includes('image') && f.fileUrl ? (
                <img src={f.fileUrl} alt="Secure Preview" style={imgStyle} />
              ) : (
                <FaFolderOpen size={45} color="rgba(56, 189, 248, 0.4)" />
              )}
            </div>
            <div style={infoStyle}>
              <p style={fileName} title={f.fileName}>{f.fileName}</p>
              
              <div style={dateWrapper}>
                <FaCalendarAlt size={10} color="var(--text-secondary)" />
                <span style={dateText}>Stored: {formatSubmissionDate(f.createdAt)}</span>
              </div>

              <div style={actions}>
                <button onClick={() => handleView(f)} style={iconBtn} title="View File">
                  <FaEye size={18} />
                </button>
                <button onClick={() => handleDelete(f._id, f.storagePath)} style={deleteBtn} title="Delete Forever">
                  <FaTrashAlt size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECURE PREVIEW MODAL */}
      {previewFile && (
        <div style={modalOverlay} onClick={() => setPreviewFile(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <header style={modalHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <FaShieldAlt color="var(--accent-color)" />
                <span style={{color:'var(--text-primary)', fontWeight:'800'}}>{previewFile.fileName}</span>
              </div>
              <button onClick={() => setPreviewFile(null)} style={closeBtn}><FaTimes /></button>
            </header>
            <div style={mediaContainer}>
              {previewFile.fileType?.includes('image') ? (
                <img src={previewFile.fileUrl} alt="Vault Preview" style={previewImage} />
              ) : 
              (previewFile.fileType?.includes('pdf') || previewFile.fileName?.toLowerCase().endsWith('.pdf')) ? (
                <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column'}}>
                  <iframe 
                    src={previewFile.fileUrl} 
                    title="Secure Document"
                    style={pdfFrameStyle}
                  />
                  <a href={previewFile.fileUrl} target="_blank" rel="noreferrer" style={downloadFallback}>
                    <FaDownload style={{marginRight: '8px'}} /> Open Secure Link
                  </a>
                </div>
              ) : (
                <div style={unsupportedBox}>
                  <FaFolderOpen size={60} color="var(--text-secondary)" />
                  <p style={{marginTop: '20px', color: 'var(--text-primary)'}}>Preview not available for this file type.</p>
                  <a href={previewFile.fileUrl} target="_blank" rel="noreferrer" style={downloadFallback}>Download Asset</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== STYLES ===== */
const vaultWrapper = { padding: '40px', maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '25px' };
const iconBox = { background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const securityBadge = { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #064e3b' };
const uploadCard = { background: 'var(--bg-secondary)', padding: '50px 40px', borderRadius: '20px', border: '2px dashed var(--border-color)', textAlign: 'center', transition: 'all 0.3s ease' };
const uploadLabel = { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const btnActive = { width: '100%', maxWidth: '300px', marginTop: '30px', padding: '14px', background: 'var(--accent-color)', borderRadius: '10px', border: 'none', fontWeight: '900', color: '#020617', cursor: 'pointer', transition: 'transform 0.2s ease', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.2)' };
const btnDisabled = { ...btnActive, background: 'var(--border-color)', color: 'var(--text-secondary)', cursor: 'not-allowed', boxShadow: 'none' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px', marginTop: '50px' };
const cardStyle = { background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, border-color 0.2s ease' };
const previewBox = { height: '160px', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const infoStyle = { padding: '20px' };
const fileName = { color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0' };
const dateWrapper = { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', marginBottom: '18px' };
const dateText = { color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '500' };
const actions = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const iconBtn = { color: 'var(--accent-color)', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', transition: 'all 0.2s ease' };
const deleteBtn = { ...iconBtn, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.92)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalContent = { background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', width: '95%', maxWidth: '1100px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' };
const modalHeader = { padding: '20px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' };
const mediaContainer = { padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a' };
const previewImage = { maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const pdfFrameStyle = { width: '100%', height: '70vh', border: 'none', borderRadius: '12px', background: '#fff' };
const unsupportedBox = { textAlign: 'center', padding: '40px' };
const downloadFallback = { display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', padding: '14px 28px', background: 'var(--accent-color)', color: '#020617', textDecoration: 'none', borderRadius: '10px', fontWeight: '800', transition: 'transform 0.2s ease' };

export default FileVault;