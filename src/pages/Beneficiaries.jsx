import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiAddLine, RiUserHeartLine, RiEditLine, RiDeleteBinLine,
  RiMailLine, RiPhoneLine, RiCheckboxCircleLine, RiTimeLine,
} from 'react-icons/ri';
import { getBeneficiaries, deleteBeneficiary } from '../services/api';

const Beneficiaries = () => {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBeneficiaries(); }, []);

  const fetchBeneficiaries = async () => {
    try {
      const res = await getBeneficiaries();
      setBeneficiaries(res.data.beneficiaries || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this beneficiary?')) return;
    try {
      await deleteBeneficiary(id);
      setBeneficiaries(beneficiaries.filter((b) => b._id !== id));
      toast.success('Beneficiary removed');
    } catch (err) { console.error(err); }
  };

  const totalAllocation = beneficiaries.reduce((sum, b) => sum + (b.allocationPercentage || 0), 0);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton skeleton-title" />
        <div className="cards-grid">{[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" />)}</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Beneficiaries</h1>
          <p className="page-subtitle">People who will inherit your digital assets</p>
        </div>
        <Link to="/beneficiaries/new" className="btn btn-primary"><RiAddLine /> Add Beneficiary</Link>
      </div>

      {beneficiaries.length > 0 && (
        <div className="glass-card-static" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Total allocation: <strong style={{ color: totalAllocation > 100 ? 'var(--accent-red)' : 'var(--accent-teal)' }}>{totalAllocation}%</strong>
          </span>
          <span className={`badge ${totalAllocation === 100 ? 'badge-success' : totalAllocation > 100 ? 'badge-danger' : 'badge-warning'}`}>
            {totalAllocation === 100 ? 'Fully Allocated' : totalAllocation > 100 ? 'Over 100%' : `${100 - totalAllocation}% unallocated`}
          </span>
        </div>
      )}

      {beneficiaries.length > 0 ? (
        <div className="cards-grid">
          {beneficiaries.map((b, i) => (
            <motion.div
              key={b._id}
              className="glass-card"
              style={{ padding: '24px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div className="avatar avatar-lg">{b.name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{b.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b.relationship}</div>
                </div>
                {b.verified && (
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    <RiCheckboxCircleLine /> Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {b.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <RiMailLine /> {b.email}
                  </div>
                )}
                {b.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <RiPhoneLine /> {b.phone}
                  </div>
                )}
              </div>

              {b.allocationPercentage > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Allocation</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{b.allocationPercentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${b.allocationPercentage}%` }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/beneficiaries/new?edit=${b._id}`)}>
                  <RiEditLine /> Edit
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(b._id)}>
                  <RiDeleteBinLine />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon"><RiUserHeartLine /></div>
          <h3 className="empty-state-title">No Beneficiaries Yet</h3>
          <p className="empty-state-text">Add the people who should inherit your digital assets.</p>
          <Link to="/beneficiaries/new" className="btn btn-primary"><RiAddLine /> Add Beneficiary</Link>
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;
