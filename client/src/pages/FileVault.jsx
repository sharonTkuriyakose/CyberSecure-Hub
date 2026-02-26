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
  FaCalendarAlt 
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
        <div style={{display:'flex', flexDirection:'column'}}>
            <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Secure File Vault</h1>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '5px'}}>Cloud-Based Encrypted Storage</p>
        </div>
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

      {/* UPLOAD CARD */}
      <form onSubmit={handleUpload} style={uploadCard}>
        <input type="file" id="file-input" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
        <label htmlFor="file-input" style={uploadLabel}>
          <FaCloudUploadAlt size={35} color="var(--accent-color)" />
          <span style={{ marginTop: '10px', color: 'var(--accent-color)' }}>
            {file ? file.name : "Select Document or Image"}
          </span>
        </label>
        <button disabled={!file || uploading} style={file ? btnActive : btnDisabled}>
          {uploading ? "Securing Connection..." : "Secure Upload"}
        </button>
      </form>

      {/* ASSET GRID */}
      <div style={gridStyle}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1' }}>Decrypting vault assets...</p>
        ) : files.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1' }}>No assets found in vault.</p>
        ) : files.map(f => (
          <div key={f._id} style={cardStyle}>
            <div style={previewBox}>
              {f.fileType?.includes('image') && f.fileUrl ? (
                <img src={f.fileUrl} alt="Secure Preview" style={imgStyle} />
              ) : (
                <FaFileAlt size={45} color="var(--text-secondary)" />
              )}
            </div>
            <div style={infoStyle}>
              <p style={fileName} title={f.fileName}>{f.fileName}</p>
              
              <div style={dateWrapper}>
                <FaCalendarAlt size={10} color="var(--text-secondary)" />
                <span style={dateText}>Stored: {formatSubmissionDate(f.createdAt)}</span>
              </div>

              <div style={actions}>
                <button onClick={() => handleView(f)} style={iconBtn}>
                  <FaEye size={18} />
                </button>
                <button onClick={() => handleDelete(f._id, f.storagePath)} style={deleteBtn}>
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
                  <FaFileAlt size={60} color="var(--text-secondary)" />
                  <p style={{marginTop: '20px', color: 'var(--text-primary)'}}>Preview not available.</p>
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
const vaultWrapper = { padding: '40px', maxWidth: '1100px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' };
const securityBadge = { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #064e3b' };
const uploadCard = { background: 'var(--bg-secondary)', padding: '40px', borderRadius: '16px', border: '2px dashed var(--border-color)', textAlign: 'center' };
const uploadLabel = { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const btnActive = { width: '100%', maxWidth: '300px', marginTop: '25px', padding: '12px', background: 'var(--accent-color)', borderRadius: '8px', border: 'none', fontWeight: '900', color: '#020617', cursor: 'pointer' };
const btnDisabled = { ...btnActive, background: 'var(--border-color)', color: 'var(--text-secondary)', cursor: 'not-allowed' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginTop: '40px' };
const cardStyle = { background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const previewBox = { height: '150px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const infoStyle = { padding: '15px' };
const fileName = { color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0' };
const dateWrapper = { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', marginBottom: '15px' };
const dateText = { color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '500' };
const actions = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const iconBtn = { color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' };
const deleteBtn = { ...iconBtn, color: '#ef4444' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalContent = { background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', width: '95%', maxWidth: '1100px', height: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const modalHeader = { padding: '15px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' };
const mediaContainer = { padding: '10px', flex: 1, overflowY: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1a1a1a' };
const previewImage = { maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' };
const pdfFrameStyle = { width: '100%', height: '75vh', border: 'none', borderRadius: '8px', background: '#fff' };
const unsupportedBox = { textAlign: 'center', padding: '20px' };
const downloadFallback = { display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px', padding: '12px 20px', background: 'var(--accent-color)', color: '#020617', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' };

export default FileVault;