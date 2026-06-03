import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  RiAdminLine, RiUserLine, RiSafeLine, RiFileTextLine, RiFlowChart,
  RiSearchLine,
} from 'react-icons/ri';
import { getAdminStats, getUsers, getAuditLog } from '../services/api';

const COLORS = ['#E8A838', '#2BB5A0', '#4D8AF0', '#9B6FE0', '#E85D5D'];

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.allSettled([getAdminStats(), getUsers(), getAuditLog()]).then(([statsRes, usersRes, auditRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.users || []);
      if (auditRes.status === 'fulfilled') setAuditLog(auditRes.value.data || []);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="animate-fade-in loading-container">
      <div className="spinner spinner-lg" />
    </div>
  );

  const overview = stats?.overview || {};

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">System overview and user management</p>
        </div>
        <span className="badge badge-danger"><RiAdminLine /> Admin</span>
      </div>

      <div className="tabs">
        {['overview', 'users', 'audit'].map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="animate-fade-in">
          <div className="stats-grid" style={{ marginBottom: '28px' }}>
            {[
              { label: 'Total Users', value: overview.totalUsers || 0, icon: <RiUserLine />, color: 'gold' },
              { label: 'Total Assets', value: overview.totalAssets || 0, icon: <RiSafeLine />, color: 'teal' },
              { label: 'Documents', value: overview.totalDocuments || 0, icon: <RiFileTextLine />, color: 'blue' },
              { label: 'Active Plans', value: overview.activePlans || 0, icon: <RiFlowChart />, color: 'purple' },
            ].map((s, i) => (
              <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-card-content">
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid-2">
            {stats?.usersByRole?.length > 0 && (
              <div className="chart-container">
                <div className="chart-title">Users by Role</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stats.usersByRole.map(r => ({ name: r._id, value: r.count }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {stats.usersByRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {stats?.assetsByCategory?.length > 0 && (
              <div className="chart-container">
                <div className="chart-title">Assets by Category</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.assetsByCategory.map(c => ({ name: c._id, count: c.count }))}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <Bar dataKey="count" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="animate-fade-in">
          <div className="search-input" style={{ marginBottom: '20px' }}>
            <RiSearchLine className="search-icon" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="glass-card-static" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>KYC</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-sm">{u.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</span>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-neutral'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.kycVerified ? 'badge-success' : 'badge-warning'}`}>{u.kycVerified ? 'Verified' : 'Pending'}</span></td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLog.slice(0, 30).map((entry, i) => (
              <motion.div
                key={i}
                className="glass-card"
                style={{ padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gold)', marginTop: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '2px' }}>{entry.action}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{entry.details}</div>
                  {entry.user && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{entry.user.name} · {entry.user.email}</div>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </motion.div>
            ))}
            {auditLog.length === 0 && (
              <div className="empty-state glass-card-static">
                <div className="empty-state-icon"><RiAdminLine /></div>
                <p className="empty-state-text">No audit log entries yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
