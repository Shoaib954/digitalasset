import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiUploadLine, RiFileTextLine, RiDeleteBinLine, RiDownloadLine,
  RiFilePdfLine, RiFileImageLine, RiFileWordLine, RiLockLine,
  RiSearchLine,
} from 'react-icons/ri';
import { getDocuments, uploadDocument, deleteDocument, downloadDocument } from '../services/api';

const categoryColors = {
  will: 'var(--accent-gold)',
  passport: 'var(--accent-blue)',
  property: 'var(--accent-teal)',
  tax: 'var(--accent-purple)',
  insurance: 'var(--accent-teal)',
  legal: 'var(--accent-red)',
  identity: 'var(--accent-blue)',
  financial: 'var(--accent-gold)',
  other: 'var(--text-muted)',
};

const getFileIcon = (mimetype) => {
  if (!mimetype) return <RiFileTextLine />;
  if (mimetype.includes('pdf')) return <RiFilePdfLine />;
  if (mimetype.includes('image')) return <RiFileImageLine />;
  if (mimetype.includes('word') || mimetype.includes('doc')) return <RiFileWordLine />;
  return <RiFileTextLine />;
};

const formatSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [category, setCategory] = useState('other');
  const [title, setTitle] = useState('');
  const fileInputRef = useRef();

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data.documents || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('category', category);
    try {
      const res = await uploadDocument(formData);
      setDocuments([res.data.document || res.data, ...documents]);
      toast.success('Document uploaded');
      setTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
      setDocuments(documents.filter((d) => d._id !== id));
      toast.success('Document deleted');
    } catch (err) { console.error(err); }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await downloadDocument(doc._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title || doc.filename || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  const filtered = documents.filter((d) =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.category?.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['will', 'passport', 'property', 'tax', 'insurance', 'legal', 'identity', 'financial', 'other'];

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-card" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Vault</h1>
          <p className="page-subtitle">Securely store your important documents</p>
        </div>
      </div>

      {/* Upload area */}
      <motion.div
        className="glass-card-static"
        style={{ padding: '24px', marginBottom: '28px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Document title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '180px' }}>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div
          className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
        >
          <div className="file-upload-zone-icon">
            {uploading ? <div className="spinner" /> : <RiUploadLine />}
          </div>
          <div className="file-upload-zone-text">
            {uploading ? 'Uploading...' : <><span>Click to upload</span> or drag and drop</>}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>PDF, DOC, Images up to 50MB</div>
        </div>
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e.target.files[0])} />
      </motion.div>

      {/* Search */}
      <div className="search-input" style={{ marginBottom: '24px' }}>
        <RiSearchLine className="search-icon" />
        <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Document list */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((doc, i) => (
            <motion.div
              key={doc._id}
              className="glass-card"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                background: `${categoryColors[doc.category] || 'var(--text-muted)'}20`,
                color: categoryColors[doc.category] || 'var(--text-muted)',
                flexShrink: 0,
              }}>
                {getFileIcon(doc.mimetype)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '2px' }}>{doc.title || doc.filename}</div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{doc.category}</span>
                  <span>{formatSize(doc.size)}</span>
                  <span>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</span>
                  {doc.encrypted && <span style={{ color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '3px' }}><RiLockLine /> Encrypted</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" title="Download" onClick={() => handleDownload(doc)}><RiDownloadLine /></button>
                <button className="btn-icon" title="Delete" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(doc._id)}><RiDeleteBinLine /></button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon"><RiFileTextLine /></div>
          <h3 className="empty-state-title">No Documents</h3>
          <p className="empty-state-text">Upload important documents to keep them safe and accessible.</p>
        </div>
      )}
    </div>
  );
};

export default Documents;
