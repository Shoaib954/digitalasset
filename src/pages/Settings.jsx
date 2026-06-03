import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiUserLine, RiMailLine, RiPhoneLine, RiMapPinLine, RiCalendarLine,
  RiShieldCheckLine, RiTimeLine, RiSaveLine, RiLoader4Line,
  RiToggleLine, RiToggleFill,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { getSwitch, updateSwitch, checkIn, toggleSwitch } from '../services/api';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [switchData, setSwitchData] = useState(null);
  const [switchLoading, setSwitchLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
  });
  const [switchForm, setSwitchForm] = useState({
    intervalDays: 90,
    maxMissedCheckIns: 3,
    enabled: false,
    emergencyContacts: [],
  });
  const [newContact, setNewContact] = useState({ name: '', email: '' });

  useEffect(() => {
    getSwitch()
      .then((res) => {
        if (res.data.exists) {
          setSwitchData(res.data);
          setSwitchForm({
            intervalDays: res.data.intervalDays || 90,
            maxMissedCheckIns: res.data.maxMissedCheckIns || 3,
            enabled: res.data.enabled || false,
            emergencyContacts: res.data.emergencyContacts || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setSwitchLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone, dateOfBirth: form.dateOfBirth, address: form.address };
      if (form.newPassword) payload.password = form.newPassword;
      await updateProfile(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateSwitch(switchForm);
      setSwitchData(res.data);
      toast.success('Dead Man\'s Switch updated');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await checkIn();
      toast.success('Check-in successful! Timer reset.');
      const res = await getSwitch();
      if (res.data.exists) setSwitchData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleToggle = async () => {
    try {
      const res = await toggleSwitch({});
      setSwitchData(prev => ({ ...prev, enabled: res.data.enabled, status: res.data.status }));
      setSwitchForm(prev => ({ ...prev, enabled: res.data.enabled }));
      toast.success(`Switch ${res.data.enabled ? 'enabled' : 'disabled'}`);
    } catch (err) { console.error(err); }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) return;
    setSwitchForm(prev => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, { ...newContact }] }));
    setNewContact({ name: '', email: '' });
  };

  const removeContact = (i) => {
    setSwitchForm(prev => ({ ...prev, emergencyContacts: prev.emergencyContacts.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and security settings</p>
        </div>
      </div>

      <div className="tabs">
        {['profile', 'security', 'switch'].map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'profile' ? <><RiUserLine /> Profile</> : t === 'security' ? <><RiShieldCheckLine /> Security</> : <><RiTimeLine /> Dead Man's Switch</>}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.form
          onSubmit={handleProfileSave}
          className="glass-card-static"
          style={{ padding: '28px', maxWidth: '640px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid-2">
            <div className="input-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrapper">
                <RiUserLine className="input-icon" />
                <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrapper">
                <RiMailLine className="input-icon" />
                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Phone</label>
              <div className="input-icon-wrapper">
                <RiPhoneLine className="input-icon" />
                <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Date of Birth</label>
              <div className="input-icon-wrapper">
                <RiCalendarLine className="input-icon" />
                <input type="date" className="form-input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="input-group">
            <label className="form-label">Address</label>
            <div className="input-icon-wrapper">
              <RiMapPinLine className="input-icon" />
              <input type="text" className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><RiSaveLine /> Save Profile</>}
            </button>
          </div>
        </motion.form>
      )}

      {tab === 'security' && (
        <motion.form
          onSubmit={handleProfileSave}
          className="glass-card-static"
          style={{ padding: '28px', maxWidth: '480px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '16px' }}>Change Password</h3>
          <div className="input-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Min 6 characters" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </div>
          <div style={{ padding: '16px', background: 'var(--accent-blue-dim)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--accent-blue)' }}>
            <strong>Account Info</strong><br />
            Role: {user?.role} · KYC: {user?.kycVerified ? '✓ Verified' : '✗ Not Verified'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.newPassword}>
              {saving ? <><RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><RiSaveLine /> Update Password</>}
            </button>
          </div>
        </motion.form>
      )}

      {tab === 'switch' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Status card */}
          {switchData?.exists && (
            <div className="glass-card-static" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                  Status: <span style={{ color: switchData.enabled ? 'var(--accent-teal)' : 'var(--text-muted)' }}>{switchData.status || 'disabled'}</span>
                </div>
                {switchData.daysRemaining !== undefined && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {switchData.daysRemaining} days until next required check-in
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={handleCheckIn} disabled={checkingIn || !switchData.enabled}>
                  {checkingIn ? <RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> : <RiShieldCheckLine />}
                  {checkingIn ? 'Checking in...' : 'Check In Now'}
                </button>
                <button className={`btn ${switchData.enabled ? 'btn-outline' : 'btn-primary'}`} onClick={handleToggle}>
                  {switchData.enabled ? <RiToggleFill /> : <RiToggleLine />}
                  {switchData.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSwitchSave} className="glass-card-static" style={{ padding: '28px', maxWidth: '640px' }}>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Check-in Interval (days)</label>
                <input type="number" className="form-input" min="7" max="365" value={switchForm.intervalDays} onChange={(e) => setSwitchForm({ ...switchForm, intervalDays: parseInt(e.target.value) })} />
              </div>
              <div className="input-group">
                <label className="form-label">Max Missed Check-ins</label>
                <input type="number" className="form-input" min="1" max="10" value={switchForm.maxMissedCheckIns} onChange={(e) => setSwitchForm({ ...switchForm, maxMissedCheckIns: parseInt(e.target.value) })} />
              </div>
            </div>

            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', marginTop: '8px' }}>Emergency Contacts</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input type="text" className="form-input" placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} style={{ flex: 1, minWidth: '140px' }} />
              <input type="email" className="form-input" placeholder="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} style={{ flex: 2, minWidth: '200px' }} />
              <button type="button" className="btn btn-outline btn-sm" onClick={addContact}>Add</button>
            </div>
            {switchForm.emergencyContacts.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                <span style={{ flex: 1, fontSize: '0.88rem' }}>{c.name} — {c.email}</span>
                <button type="button" className="btn-icon" style={{ width: '28px', height: '28px', color: 'var(--accent-red)', border: 'none' }} onClick={() => removeContact(i)}>✕</button>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><RiSaveLine /> Save Settings</>}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;
