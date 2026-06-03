import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiRobot2Line, RiShieldCheckLine, RiAlertLine, RiInformationLine,
  RiArrowRightLine, RiLoader4Line, RiRefreshLine,
} from 'react-icons/ri';
import { getAdvisorAnalysis } from '../services/api';

const priorityConfig = {
  high: { badge: 'badge-danger', icon: <RiAlertLine />, color: 'var(--accent-red)' },
  medium: { badge: 'badge-warning', icon: <RiInformationLine />, color: 'var(--accent-gold)' },
  low: { badge: 'badge-info', icon: <RiShieldCheckLine />, color: 'var(--accent-blue)' },
};

const categoryLinks = {
  assets: '/assets/new',
  beneficiaries: '/beneficiaries/new',
  documents: '/documents',
  will: '/will',
  inheritance: '/inheritance',
  security: '/settings',
  general: '/dashboard',
};

const AIAdvisor = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalysis(); }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      // advisor is POST /api/ai/advisor
      const res = await getAdvisorAnalysis();
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="animate-fade-in loading-container" style={{ flexDirection: 'column', gap: '16px' }}>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzing your estate...</p>
    </div>
  );

  const summary = analysis?.summary || {};
  const recommendations = analysis?.recommendations || [];

  const scoreColor = summary.totalAssets === 0 ? 'var(--accent-red)' :
    recommendations.filter(r => r.priority === 'high').length > 2 ? 'var(--accent-gold)' : 'var(--accent-teal)';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Estate Advisor</h1>
          <p className="page-subtitle">Personalized recommendations for your digital estate</p>
        </div>
        <button className="btn btn-outline" onClick={fetchAnalysis}>
          <RiRefreshLine /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Assets', value: summary.totalAssets || 0, color: 'gold' },
          { label: 'Beneficiaries', value: summary.totalBeneficiaries || 0, color: 'teal' },
          { label: 'Documents', value: summary.totalDocuments || 0, color: 'blue' },
          { label: 'High Priority Items', value: recommendations.filter(r => r.priority === 'high').length, color: 'purple' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`stat-card-icon ${s.color}`}><RiShieldCheckLine /></div>
            <div className="stat-card-content">
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <span className={`badge ${summary.hasWill ? 'badge-success' : 'badge-danger'}`}>
          {summary.hasWill ? '✓ Will Created' : '✗ No Will'}
        </span>
        <span className={`badge ${summary.hasActivePlan ? 'badge-success' : 'badge-danger'}`}>
          {summary.hasActivePlan ? '✓ Active Plan' : '✗ No Active Plan'}
        </span>
        {summary.categories?.map(c => (
          <span key={c} className="badge badge-info">{c}</span>
        ))}
      </div>

      {/* Recommendations */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
        Recommendations ({recommendations.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {recommendations.map((rec, i) => {
          const config = priorityConfig[rec.priority] || priorityConfig.low;
          return (
            <motion.div
              key={i}
              className="glass-card"
              style={{ padding: '20px 24px' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
                  background: `${config.color}15`, color: config.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                }}>
                  {config.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rec.title}</span>
                    <span className={`badge ${config.badge}`}>{rec.priority}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.description}</p>
                </div>
                <Link to={categoryLinks[rec.category] || '/dashboard'} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                  Fix <RiArrowRightLine />
                </Link>
              </div>
            </motion.div>
          );
        })}
        {recommendations.length === 0 && (
          <div className="empty-state glass-card-static">
            <div className="empty-state-icon"><RiRobot2Line /></div>
            <h3 className="empty-state-title">All Good!</h3>
            <p className="empty-state-text">Your estate plan looks comprehensive. Keep it updated!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
