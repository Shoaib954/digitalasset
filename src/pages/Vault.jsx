import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import {
  RiShieldKeyholeLine, RiAddLine, RiDeleteBinLine, RiEyeLine,
  RiEyeOffLine, RiLockLine, RiFileCopyLine, RiKeyLine,
} from 'react-icons/ri';

const VAULT_KEY = 'digiasset_vault';

const loadVault = () => {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveVault = (entries) => {
  localStorage.setItem(VAULT_KEY, JSON.stringify(entries));
};

const Vault = () => {
  const [entries, setEntries] = useState(loadVault());
  const [masterPassword, setMasterPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [form, setForm] = useState({ label: '', username: '', password: '', notes: '' });
  const [tempPass, setTempPass] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (tempPass.length < 4) { toast.error('Master password too short'); return; }
    setMasterPassword(tempPass);
    setUnlocked(true);
    toast.success('Vault unlocked');
  };

  const handleLock = () => {
    setUnlocked(false);
    setMasterPassword('');
    setTempPass('');
    setRevealed({});
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.label || !form.password) { toast.error('Label and password required'); return; }
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(form), masterPassword).toString();
    const newEntries = [...entries, { id: Date.now(), label: form.label, encrypted }];
    setEntries(newEntries);
    saveVault(newEntries);
    setForm({ label: '', username: '', password: '', notes: '' });
    setShowAdd(false);
    toast.success('Secret stored');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this entry?')) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveVault(updated);
    toast.success('Entry deleted');
  };

  const decrypt = (encrypted) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, masterPassword);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch { return null; }
  };

  const toggleReveal = (id) => setRevealed(prev => ({ ...prev, [id]: !prev[id] }));

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!unlocked) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div
          className="glass-card-static"
          style={{ padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px' }}>
            <RiShieldKeyholeLine />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>Secret Vault</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Enter your master password to unlock your encrypted secrets. Stored locally with AES-256 encryption.
          </p>
          <form onSubmit={handleUnlock}>
            <div className="input-group">
              <div className="input-icon-wrapper">
                <RiLockLine className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Master password"
                  value={tempPass}
                  onChange={(e) => setTempPass(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '8px' }}>
              <RiShieldKeyholeLine /> Unlock Vault
            </button>
          </form>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '16px' }}>
            If you forget your master password, secrets cannot be recovered.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Secret Vault</h1>
          <p className="page-subtitle">AES-256 encrypted password & secret storage</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={handleLock}><RiLockLine /> Lock</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><RiAddLine /> Add Secret</button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map((entry, i) => {
            const decrypted = revealed[entry.id] ? decrypt(entry.encrypted) : null;
            return (
              <motion.div
                key={entry.id}
                className="glass-card"
                style={{ padding: '18px 22px' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    <RiKeyLine />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{entry.label}</div>
                    {decrypted ? (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {decrypted.username && <span>User: {decrypted.username}</span>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Pass: {decrypted.password}</span>
                          <button
                            className="btn-icon"
                            style={{ width: '24px', height: '24px', fontSize: '0.8rem', border: 'none' }}
                            onClick={() => copyToClipboard(decrypted.password)}
                          >
                            <RiFileCopyLine />
                          </button>
                        </div>
                        {decrypted.notes && <span style={{ color: 'var(--text-muted)' }}>{decrypted.notes}</span>}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>••••••••</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon" onClick={() => toggleReveal(entry.id)}>
                      {revealed[entry.id] ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                    <button className="btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(entry.id)}>
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon"><RiShieldKeyholeLine /></div>
          <h3 className="empty-state-title">Vault is Empty</h3>
          <p className="empty-state-text">Store passwords, seed phrases, and sensitive notes encrypted locally.</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><RiAddLine /> Add Secret</button>
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <motion.div className="modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="modal-header">
              <h3>Add Secret</h3>
              <button className="btn-icon" style={{ border: 'none' }} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="form-label">Label *</label>
                  <input type="text" className="form-input" placeholder="e.g. Gmail Account" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="form-label">Username / Email</label>
                  <input type="text" className="form-input" placeholder="username@example.com" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="form-label">Password / Secret *</label>
                  <input type="text" className="form-input" placeholder="password or seed phrase" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Additional info..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ minHeight: '70px' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><RiShieldKeyholeLine /> Encrypt & Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Vault;
