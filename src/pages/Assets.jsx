/* ============================================
   DigiAsset — Assets Page
   Asset management with cards grid and filters
   ============================================ */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiAddLine, RiSafeLine, RiSearchLine, RiBitCoinLine, RiGlobalLine,
  RiBankLine, RiBriefcaseLine, RiFileTextLine, RiDeleteBinLine,
  RiEyeLine, RiEditLine, RiCoinsLine,
} from 'react-icons/ri';
import { getAssets, deleteAsset } from '../services/api';

// Category icon/color map
const categoryConfig = {
  Financial: { icon: <RiBankLine />, color: 'var(--accent-gold)', bg: 'var(--accent-gold-dim)' },
  Crypto: { icon: <RiBitCoinLine />, color: 'var(--accent-teal)', bg: 'var(--accent-teal-dim)' },
  Digital: { icon: <RiGlobalLine />, color: 'var(--accent-blue)', bg: 'var(--accent-blue-dim)' },
  IP: { icon: <RiCoinsLine />, color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)' },
  Business: { icon: <RiBriefcaseLine />, color: 'var(--accent-gold)', bg: 'var(--accent-gold-dim)' },
  Documents: { icon: <RiFileTextLine />, color: 'var(--accent-teal)', bg: 'var(--accent-teal-dim)' },
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const Assets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Financial', 'Crypto', 'Digital', 'IP', 'Business', 'Documents'];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await getAssets();
      setAssets(res.data.assets || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      setAssets(assets.filter((a) => a._id !== id));
      toast.success('Asset deleted');
    } catch (err) {
      console.error(err);
    }
  };

  // Filter assets
  const filtered = assets.filter((a) => {
    const matchTab = activeTab === 'All' || a.category === activeTab;
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.institution?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton skeleton-title" />
        <div className="cards-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Assets</h1>
          <p className="page-subtitle">Manage and protect all your digital assets</p>
        </div>
        <Link to="/assets/new" className="btn btn-primary">
          <RiAddLine /> Add Asset
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div className="search-input">
          <RiSearchLine className="search-icon" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
          {tabs.map((tab) => (
            <button key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {filtered.length > 0 ? (
        <div className="cards-grid">
          {filtered.map((asset, i) => {
            const config = categoryConfig[asset.category] || { icon: <RiSafeLine />, color: 'var(--accent-gold)', bg: 'var(--accent-gold-dim)' };
            return (
              <motion.div
                key={asset._id || i}
                className="glass-card"
                style={{ padding: '24px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    {config.icon}
                  </div>
                  <span className="badge badge-success">{asset.status || 'Active'}</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{asset.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {asset.institution || asset.platform || asset.category || 'Digital Asset'}
                </p>

                {asset.value > 0 && (
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '12px' }}>
                    {formatCurrency(asset.value)}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span className="tag">{asset.category || 'General'}</span>
                  {asset.beneficiaries?.length > 0 && (
                    <span className="tag" style={{ color: 'var(--accent-teal)' }}>
                      {asset.beneficiaries.length} beneficiar{asset.beneficiaries.length > 1 ? 'ies' : 'y'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/assets/${asset._id}`)}>
                    <RiEyeLine /> View
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/assets/${asset._id}`)}>
                    <RiEditLine /> Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(asset._id)}>
                    <RiDeleteBinLine />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon"><RiSafeLine /></div>
          <h3 className="empty-state-title">No Assets Found</h3>
          <p className="empty-state-text">
            {search || activeTab !== 'All'
              ? 'No assets match your filters. Try adjusting your search.'
              : 'Start by adding your first digital asset to protect it for the future.'}
          </p>
          <Link to="/assets/new" className="btn btn-primary">
            <RiAddLine /> Add Your First Asset
          </Link>
        </div>
      )}
    </div>
  );
};

export default Assets;
