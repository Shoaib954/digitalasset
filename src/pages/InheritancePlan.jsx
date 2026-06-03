import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiAddLine, RiFlowChart, RiEditLine, RiDeleteBinLine,
  RiUserHeartLine, RiCalendarLine, RiPlayLine,
} from 'react-icons/ri';
import { getPlans, createPlan, updatePlan, triggerPlan, getBeneficiaries } from '../services/api';

const triggerLabels = {
  death: 'Upon Death',
  incapacity: 'Incapacity',
  date: 'Specific Date',
  deadmans_switch: "Dead Man's Switch",
};

const statusBadge = {
  draft: 'badge-warning',
  active: 'badge-success',
  triggered: 'badge-danger',
  completed: 'badge-info',
};

const InheritancePlan = () => {
  const [plans, setPlans] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', triggerType: 'death', triggerDate: '', status: 'draft' });

  useEffect(() => {
    Promise.allSettled([getPlans(), getBeneficiaries()]).then(([plansRes, benefRes]) => {
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data || []);
      if (benefRes.status === 'fulfilled') setBeneficiaries(benefRes.value.data.beneficiaries || benefRes.value.data || []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createPlan(form);
      setPlans([res.data, ...plans]);
      setShowModal(false);
      setForm({ name: '', description: '', triggerType: 'death', triggerDate: '', status: 'draft' });
      toast.success('Plan created');
    } catch (err) { console.error(err); }
  };

  const handleActivate = async (plan) => {
    try {
      const res = await updatePlan(plan._id, { status: 'active' });
      setPlans(plans.map(p => p._id === plan._id ? res.data : p));
      toast.success('Plan activated');
    } catch (err) { console.error(err); }
  };

  const handleTrigger = async (plan) => {
    if (!window.confirm(`Trigger plan "${plan.name}"? This will initiate the inheritance process.`)) return;
    try {
      await triggerPlan(plan._id);
      setPlans(plans.map(p => p._id === plan._id ? { ...p, status: 'triggered' } : p));
      toast.success('Plan triggered');
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton skeleton-title" />
      <div className="cards-grid">{[1,2].map(i => <div key={i} className="skeleton skeleton-card" />)}</div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inheritance Plans</h1>
          <p className="page-subtitle">Define how and when your assets transfer</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><RiAddLine /> New Plan</button>
      </div>

      {plans.length > 0 ? (
        <div className="cards-grid">
          {plans.map((plan, i) => (
            <motion.div
              key={plan._id}
              className="glass-card"
              style={{ padding: '24px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  <RiFlowChart />
                </div>
                <span className={`badge ${statusBadge[plan.status] || 'badge-neutral'}`}>{plan.status}</span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{plan.name}</h3>
              {plan.description && <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{plan.description}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <RiPlayLine /> Trigger: {triggerLabels[plan.triggerType] || plan.triggerType}
                </div>
                {plan.beneficiaries?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <RiUserHeartLine /> {plan.beneficiaries.length} beneficiar{plan.beneficiaries.length > 1 ? 'ies' : 'y'}
                  </div>
                )}
                {plan.triggerDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <RiCalendarLine /> {new Date(plan.triggerDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px', flexWrap: 'wrap' }}>
                {plan.status === 'draft' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleActivate(plan)}>Activate</button>
                )}
                {plan.status === 'active' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleTrigger(plan)}>Trigger</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon"><RiFlowChart /></div>
          <h3 className="empty-state-title">No Plans Yet</h3>
          <p className="empty-state-text">Create an inheritance plan to define how your assets are transferred.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><RiAddLine /> Create Plan</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div className="modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="modal-header">
              <h3>Create Inheritance Plan</h3>
              <button className="btn-icon" style={{ border: 'none' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="form-label">Plan Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Primary Estate Plan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: '70px' }} />
                </div>
                <div className="input-group">
                  <label className="form-label">Trigger Type</label>
                  <select className="form-select" value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })}>
                    <option value="death">Upon Death</option>
                    <option value="incapacity">Incapacity</option>
                    <option value="date">Specific Date</option>
                    <option value="deadmans_switch">Dead Man's Switch</option>
                  </select>
                </div>
                {form.triggerType === 'date' && (
                  <div className="input-group">
                    <label className="form-label">Trigger Date</label>
                    <input type="date" className="form-input" value={form.triggerDate} onChange={(e) => setForm({ ...form, triggerDate: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Plan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InheritancePlan;
