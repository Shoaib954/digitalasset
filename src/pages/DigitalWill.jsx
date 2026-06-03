import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import {
  RiFileList3Line, RiSaveLine, RiLoader4Line, RiDownloadLine,
  RiCheckboxCircleLine, RiEditLine,
} from 'react-icons/ri';
import { getWill, createWill, updateWill, finalizeWill, getWillPdf } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DigitalWill = () => {
  const { user } = useAuth();
  const [will, setWill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: 'My Digital Will',
    personalInfo: { fullName: '', dateOfBirth: '', address: '', nationality: '' },
    executorInfo: { name: '', email: '', phone: '', relationship: '' },
    specialInstructions: '',
    digitalAccountInstructions: '',
    residualEstateClause: '',
  });

  useEffect(() => {
    getWill()
      .then((res) => {
        const w = res.data;
        setWill(w);
        setForm({
          title: w.title || 'My Digital Will',
          personalInfo: w.content?.personalInfo || {},
          executorInfo: w.content?.executorInfo || {},
          specialInstructions: w.content?.specialInstructions || '',
          digitalAccountInstructions: w.content?.digitalAccountInstructions || '',
          residualEstateClause: w.content?.residualEstateClause || '',
        });
      })
      .catch(() => { setEditing(true); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        content: {
          personalInfo: form.personalInfo,
          executorInfo: form.executorInfo,
          specialInstructions: form.specialInstructions,
          digitalAccountInstructions: form.digitalAccountInstructions,
          residualEstateClause: form.residualEstateClause,
        },
      };
      let res;
      if (will?._id) {
        res = await updateWill(will._id, payload);
      } else {
        res = await createWill(payload);
      }
      setWill(res.data.will || res.data);
      setEditing(false);
      toast.success('Will saved successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm('Finalize this will? It will be locked for editing.')) return;
    try {
      await finalizeWill(will._id);
      setWill({ ...will, status: 'finalized' });
      toast.success('Will finalized!');
    } catch (err) { console.error(err); }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await getWillPdf(will._id);
      const data = res.data;
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(data.title || 'Digital Will', 105, y, { align: 'center' });
      y += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Version ${data.version} | Status: ${data.status} | Generated: ${new Date(data.generatedAt).toLocaleDateString()}`, 105, y, { align: 'center' });
      y += 16;
      if (data.personalInfo?.fullName) {
        doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('Personal Information', 20, y); y += 8;
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${data.personalInfo.fullName}`, 20, y); y += 6;
        if (data.personalInfo.address) { doc.text(`Address: ${data.personalInfo.address}`, 20, y); y += 6; }
      }
      if (data.executorInfo?.name) {
        y += 6; doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('Executor', 20, y); y += 8;
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${data.executorInfo.name}`, 20, y); y += 6;
        if (data.executorInfo.email) { doc.text(`Email: ${data.executorInfo.email}`, 20, y); y += 6; }
      }
      if (data.specialInstructions) {
        y += 6; doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('Special Instructions', 20, y); y += 8;
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(data.specialInstructions, 170);
        doc.text(lines, 20, y); y += lines.length * 6;
      }
      doc.save(`DigiAsset-Will-v${data.version}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) { console.error(err); }
  };

  const setField = (section, key, value) => {
    if (section) {
      setForm({ ...form, [section]: { ...form[section], [key]: value } });
    } else {
      setForm({ ...form, [key]: value });
    }
  };

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-card" style={{ height: '400px' }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Will</h1>
          <p className="page-subtitle">Create and manage your digital testament</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {will && !editing && <button className="btn btn-ghost" onClick={() => setEditing(true)}><RiEditLine /> Edit</button>}
          {will?._id && <button className="btn btn-ghost" onClick={handleDownloadPDF}><RiDownloadLine /> PDF</button>}
          {will && will.status === 'draft' && !editing && (
            <button className="btn btn-secondary" onClick={handleFinalize}><RiCheckboxCircleLine /> Finalize</button>
          )}
        </div>
      </div>

      {will && !editing ? (
        <motion.div className="glass-card-static" style={{ padding: '32px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{will.title}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Version {will.version}</p>
            </div>
            <span className={`badge ${will.status === 'finalized' ? 'badge-success' : will.status === 'draft' ? 'badge-warning' : 'badge-info'}`}>
              {will.status}
            </span>
          </div>
          {form.personalInfo?.fullName && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>Personal Information</div>
              <div style={{ fontSize: '0.9rem' }}>{form.personalInfo.fullName} · {form.personalInfo.address}</div>
            </div>
          )}
          {form.executorInfo?.name && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>Executor</div>
              <div style={{ fontSize: '0.9rem' }}>{form.executorInfo.name} ({form.executorInfo.relationship}) · {form.executorInfo.email}</div>
            </div>
          )}
          {form.specialInstructions && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>Special Instructions</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{form.specialInstructions}</div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div className="glass-card-static" style={{ padding: '28px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="input-group">
            <label className="form-label">Will Title</label>
            <input type="text" className="form-input" value={form.title} onChange={(e) => setField(null, 'title', e.target.value)} />
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)', margin: '20px 0 14px' }}>Personal Information</h3>
          <div className="grid-2">
            {[
              ['fullName', 'Full Legal Name', 'text'],
              ['dateOfBirth', 'Date of Birth', 'date'],
              ['nationality', 'Nationality', 'text'],
              ['address', 'Address', 'text'],
            ].map(([key, label, type]) => (
              <div className="input-group" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" value={form.personalInfo[key] || ''} onChange={(e) => setField('personalInfo', key, e.target.value)} />
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)', margin: '20px 0 14px' }}>Executor Details</h3>
          <div className="grid-2">
            {[
              ['name', 'Full Name'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['relationship', 'Relationship'],
            ].map(([key, label]) => (
              <div className="input-group" key={key}>
                <label className="form-label">{label}</label>
                <input type="text" className="form-input" value={form.executorInfo[key] || ''} onChange={(e) => setField('executorInfo', key, e.target.value)} />
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)', margin: '20px 0 14px' }}>Instructions</h3>
          {[
            ['specialInstructions', 'Special Instructions', 'Any specific wishes or conditions...'],
            ['digitalAccountInstructions', 'Digital Account Instructions', 'Instructions for handling online accounts...'],
            ['residualEstateClause', 'Residual Estate Clause', 'What happens to remaining assets...'],
          ].map(([key, label, placeholder]) => (
            <div className="input-group" key={key}>
              <label className="form-label">{label}</label>
              <textarea className="form-textarea" placeholder={placeholder} value={form[key] || ''} onChange={(e) => setField(null, key, e.target.value)} />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            {will && <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><RiSaveLine /> Save Will</>}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DigitalWill;
