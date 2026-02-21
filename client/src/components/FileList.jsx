import React, { useState, useEffect } from 'react';
import API from '../services/api';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await API.get('/data/files'); // We'll add this route next
        setFiles(res.data);
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this file from the vault?")) {
      try {
        await API.delete(`/data/files/${id}`);
        setFiles(files.filter(file => file._id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  if (loading) return <p style={{ color: '#94a3b8' }}>Scanning vault...</p>;

  return (
    <div style={listContainer}>
      <h3 style={{ color: '#f8fafc', marginBottom: '15px' }}>Stored Documents</h3>
      {files.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No files found in your secure storage.</p>
      ) : (
        <div style={gridStyle}>
          {files.map(file => (
            <div key={file._id} style={fileCard}>
              <div style={fileInfo}>
                <span style={{ fontSize: '1.5rem' }}>📄</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={fileNameStyle}>{file.fileName}</p>
                  <p style={fileSizeStyle}>{(file.fileSize / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button onClick={() => handleDelete(file._id)} style={deleteBtn}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const listContainer = { marginTop: '40px', borderTop: '1px solid #334155', paddingTop: '30px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' };
const fileCard = { background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const fileInfo = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' };
const fileNameStyle = { color: '#e2e8f0', fontWeight: 'bold', margin: 0, fontSize: '0.9rem', wordBreak: 'break-all' };
const fileSizeStyle = { color: '#64748b', fontSize: '0.8rem', margin: 0 };
const deleteBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

export default FileList;