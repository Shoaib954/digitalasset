/* ============================================
   DigiAsset — Add/Edit Asset Page
   Dynamic form based on asset category
   ============================================ */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiBankLine, RiBitCoinLine, RiGlobalLine, RiCoinsLine,
  RiBriefcaseLine, RiFileTextLine, RiArrowLeftLine, RiSaveLine,
  RiLoader4Line,
} from 'react-icons/ri';
import { createAsset, getAsset, updateAsset, getBeneficiaries } from '../services/api';

// Category options with icons
const categories = [
  { value: 'Financial', label: 'Financial', icon: <RiBankLine />, color: 'var(--accent-gold)' },
  { value: 'Crypto', label: 'Crypto', icon: <RiBitCoinLine />, color: 'var(--accent-teal)' },
  { value: 'Digital', label: 'Digital', icon: <RiGlobalLine />, color: 'var(--accent-blue)' },
  { value: 'IP', label: 'Intellectual Property', icon: <RiCoinsLine />, color: 'var(--accent-purple)' },
  { value: 'Business', label: 'Business', icon: <RiBriefcaseLine />, color: 'var(--accent-gold)' },
  { value: 'Documents', label: 'Documents', icon: <RiFileTextLine />, color: 'var(--accent-teal)' },
];

const AddAsset = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [beneficiaryList, setBeneficiaryList] = useState([]);
  const [form, setForm] = useState({
    name: '', category: '', description: '', notes: '',
    institution: '', accountNumber: '', value: '', currency: 'USD',
    walletType: '', walletAddress: '', exchange: '', coinType: '',
    platform: '', username: '', url: '', accountType: '',
    title: '', registrationNumber: '', ipType: '',
    businessName: '', businessType: '', ownershipPercentage: '',
    documentType: '', referenceNumber: '',
    beneficiary: '',
  });

  useEffect(() => {
    // Load beneficiaries for dropdown
    getBeneficiaries()
      .then((res) => setBeneficiaryList(res.data.beneficiaries || res.data || []))
      .catch(() => {});

    // If editing, load existing asset data
    if (isEdit) {
      getAsset(id)
        .then((res) => {
          const data = res.data.asset || res.data;
          setForm((prev) => ({ ...prev, ...data }));
        })
        .catch(() => navigate('/assets'));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      toast.error('Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateAsset(id, form);
        toast.success('Asset updated successfully');
      } else {
        await createAsset(form);
        toast.success('Asset created successfully');
      }
      navigate('/assets');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic fields based on category
  const renderCategoryFields = () => {
    switch (form.category) {
      case 'Financial':
        return (
          <>
            <div className="input-group">
              <label className="form-label">Institution</label>
              <input type="text" name="institution" className="form-input" placeholder="e.g., Chase Bank" value={form.institution} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="form-label">Account Number</label>
              <input type="text" name="accountNumber" className="form-input" placeholder="****1234" value={form.accountNumber} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Value</label>
                <input type="number" name="value" className="form-input" placeholder="50000" value={form.value} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="form-label">Currency</label>
                <select name="currency" className="form-select" value={form.currency} onChange={handleChange}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="INR">INR</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'Crypto':
        return (
          <>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Wallet Type</label>
                <select name="walletType" className="form-select" value={form.walletType} onChange={handleChange}>
                  <option value="">Select type</option><option value="Hot">Hot Wallet</option><option value="Cold">Cold Wallet</option><option value="Exchange">Exchange</option>
                </select>
              </div>
              <div className="input-group">
                <label className="form-label">Coin Type</label>
                <input type="text" name="coinType" className="form-input" placeholder="Bitcoin, ETH..." value={form.coinType} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Wallet Address</label>
              <input type="text" name="walletAddress" className="form-input" placeholder="0x..." value={form.walletAddress} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Exchange</label>
                <input type="text" name="exchange" className="form-input" placeholder="Coinbase, Binance..." value={form.exchange} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="form-label">Value (USD)</label>
                <input type="number" name="value" className="form-input" placeholder="10000" value={form.value} onChange={handleChange} />
              </div>
            </div>
          </>
        );
      case 'Digital':
        return (
          <>
            <div className="input-group">
              <label className="form-label">Platform Name</label>
              <input type="text" name="platform" className="form-input" placeholder="Google, Twitter..." value={form.platform} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Username</label>
                <input type="text" name="username" className="form-input" placeholder="@username" value={form.username} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="form-label">Account Type</label>
                <input type="text" name="accountType" className="form-input" placeholder="Personal, Business..." value={form.accountType} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">URL</label>
              <input type="url" name="url" className="form-input" placeholder="https://..." value={form.url} onChange={handleChange} />
            </div>
          </>
        );
      case 'IP':
        return (
          <>
            <div className="input-group">
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-input" placeholder="Patent/Trademark name" value={form.title} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Registration Number</label>
                <input type="text" name="registrationNumber" className="form-input" placeholder="REG-12345" value={form.registrationNumber} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="form-label">IP Type</label>
                <select name="ipType" className="form-select" value={form.ipType} onChange={handleChange}>
                  <option value="">Select type</option><option value="Patent">Patent</option><option value="Trademark">Trademark</option><option value="Copyright">Copyright</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Estimated Value</label>
              <input type="number" name="value" className="form-input" placeholder="25000" value={form.value} onChange={handleChange} />
            </div>
          </>
        );
      case 'Business':
        return (
          <>
            <div className="input-group">
              <label className="form-label">Business Name</label>
              <input type="text" name="businessName" className="form-input" placeholder="Company LLC" value={form.businessName} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Business Type</label>
                <input type="text" name="businessType" className="form-input" placeholder="LLC, Corp..." value={form.businessType} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="form-label">Ownership %</label>
                <input type="number" name="ownershipPercentage" className="form-input" placeholder="100" value={form.ownershipPercentage} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Value (USD)</label>
              <input type="number" name="value" className="form-input" placeholder="500000" value={form.value} onChange={handleChange} />
            </div>
          </>
        );
      case 'Documents':
        return (
          <>
            <div className="grid-2">
              <div className="input-group">
                <label className="form-label">Document Type</label>
                <input type="text" name="documentType" className="form-input" placeholder="Passport, License..." value={form.documentType} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="form-label">Reference Number</label>
                <input type="text" name="referenceNumber" className="form-input" placeholder="DOC-12345" value={form.referenceNumber} onChange={handleChange} />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-icon" onClick={() => navigate('/assets')}><RiArrowLeftLine /></button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Asset' : 'Add New Asset'}</h1>
            <p className="page-subtitle">Fill in the details of your digital asset</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Category selection */}
        <div style={{ marginBottom: '28px' }}>
          <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Select Category *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {categories.map((cat) => (
              <motion.div
                key={cat.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setForm({ ...form, category: cat.value })}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${form.category === cat.value ? cat.color : 'var(--border-color)'}`,
                  background: form.category === cat.value ? `${cat.color}15` : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '1.5rem', color: cat.color, marginBottom: '6px' }}>{cat.icon}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: form.category === cat.value ? cat.color : 'var(--text-secondary)' }}>{cat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-card-static" style={{ padding: '28px', marginBottom: '20px' }}>
          {/* Common fields */}
          <div className="input-group">
            <label className="form-label">Asset Name *</label>
            <input type="text" name="name" className="form-input" placeholder="My Bank Account" value={form.name} onChange={handleChange} required />
          </div>

          {/* Category-specific fields */}
          {renderCategoryFields()}

          <div className="input-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea" placeholder="Brief description of this asset..." value={form.description} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="form-label">Notes</label>
            <textarea name="notes" className="form-textarea" placeholder="Additional notes or instructions..." value={form.notes} onChange={handleChange} style={{ minHeight: '70px' }} />
          </div>

          {/* Beneficiary assignment */}
          {beneficiaryList.length > 0 && (
            <div className="input-group">
              <label className="form-label">Assign Beneficiary</label>
              <select name="beneficiary" className="form-select" value={form.beneficiary} onChange={handleChange}>
                <option value="">Select a beneficiary (optional)</option>
                {beneficiaryList.map((b) => (
                  <option key={b._id} value={b._id}>{b.name} — {b.relationship}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/assets')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><RiSaveLine /> {isEdit ? 'Update Asset' : 'Create Asset'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAsset;
