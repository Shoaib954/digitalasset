import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiArrowLeftLine, RiSaveLine, RiLoader4Line,
  RiUserLine, RiMailLine, RiPhoneLine, RiCalendarLine, RiMapPinLine,
} from 'react-icons/ri';
import { createBeneficiary, getBeneficiary, updateBeneficiary } from '../services/api';

const AddBeneficiary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', relationship: '',
    dateOfBirth: '', address: '', allocationPercentage: '', notes: '',
  });

  useEffect(() => {
    if (editId) {
      getBeneficiary(editId)
        .then((res) => {
          const data = res.data.beneficiary || res.data;
          setForm((prev) => ({ ...prev, ...data, allocationPercentage: data.allocationPercentage || '' }));
        })
        .catch(() => navigate('/beneficiaries'));
    }
  }, [editId, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.relationship) {
      toast.error('Name, email and relationship are required');
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateBeneficiary(editId, form);
        toast.success('Beneficiary updated');
      } else {
        await createBeneficiary(form);
        toast.success('Beneficiary added');
      }
      navigate('/beneficiaries');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Partner', 'Colleague', 'Charity', 'Other'];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-icon" onClick={() => navigate('/beneficiaries')}><RiArrowLeftLine /></button>
          <div>
            <h1 className="page-title">{editId ? 'Edit Beneficiary' : 'Add Beneficiary'}</h1>
            <p className="page-subtitle">Enter the beneficiary's details</p>
          </div>
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="glass-card-static" style={{ padding: '28px', maxWidth: '640px' }}>
          <div className="grid-2">
            <div className="input-group">
              <label className="form-label">Full Name *</label>
              <div className="input-icon-wrapper">
                <RiUserLine className="input-icon" />
                <input type="text" name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Relationship *</label>
              <select name="relationship" className="form-select" value={form.relationship} onChange={handleChange} required>
                <option value="">Select relationship</option>
                {relationships.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="form-label">Email Address *</label>
            <div className="input-icon-wrapper">
              <RiMailLine className="input-icon" />
              <input type="email" name="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label className="form-label">Phone</label>
              <div className="input-icon-wrapper">
                <RiPhoneLine className="input-icon" />
                <input type="tel" name="phone" className="form-input" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label className="form-label">Date of Birth</label>
              <div className="input-icon-wrapper">
                <RiCalendarLine className="input-icon" />
                <input type="date" name="dateOfBirth" className="form-input" value={form.dateOfBirth} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="form-label">Address</label>
            <div className="input-icon-wrapper">
              <RiMapPinLine className="input-icon" />
              <input type="text" name="address" className="form-input" placeholder="123 Main St, City" value={form.address} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label className="form-label">Allocation Percentage (%)</label>
            <input type="number" name="allocationPercentage" className="form-input" placeholder="e.g. 50" min="0" max="100" value={form.allocationPercentage} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="form-label">Notes</label>
            <textarea name="notes" className="form-textarea" placeholder="Any special instructions..." value={form.notes} onChange={handleChange} style={{ minHeight: '80px' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/beneficiaries')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><RiSaveLine /> {editId ? 'Update' : 'Add Beneficiary'}</>}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default AddBeneficiary;
