/* ============================================
   DigiAsset — Dashboard Page
   Main dashboard with stats, charts, actions
   ============================================ */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  RiSafeLine, RiUserHeartLine, RiFileTextLine, RiFlowChart,
  RiAddLine, RiUploadLine, RiFileList3Line, RiRobot2Line,
  RiCheckboxCircleLine, RiArrowUpLine, RiArrowDownLine,
  RiTimeLine, RiShieldCheckLine,
} from 'react-icons/ri';
import { getAssets, getBeneficiaries, getDocuments, getPlans, getNotifications, getReadinessScore } from '../services/api';

// Greet user based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Format number as currency
const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
};

// Chart colors
const CHART_COLORS = ['#E8A838', '#2BB5A0', '#4D8AF0', '#9B6FE0', '#E85D5D', '#5DC9E8'];

const Dashboard = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [readiness, setReadiness] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, benefRes, docsRes, plansRes, notifsRes] = await Promise.allSettled([
          getAssets(),
          getBeneficiaries(),
          getDocuments(),
          getPlans(),
          getNotifications(),
        ]);

        setAssets(assetsRes.status === 'fulfilled' ? (assetsRes.value.data.assets || assetsRes.value.data || []) : []);
        setBeneficiaries(benefRes.status === 'fulfilled' ? (benefRes.value.data.beneficiaries || benefRes.value.data || []) : []);
        setDocuments(docsRes.status === 'fulfilled' ? (docsRes.value.data.documents || docsRes.value.data || []) : []);
        setPlans(plansRes.status === 'fulfilled' ? (plansRes.value.data.plans || plansRes.value.data || []) : []);
        setNotifications(notifsRes.status === 'fulfilled' ? (notifsRes.value.data.notifications || notifsRes.value.data || []) : []);

        // Calculate readiness score from data
        let score = 0;
        const a = assetsRes.status === 'fulfilled' ? (assetsRes.value.data.assets || assetsRes.value.data || []) : [];
        const b = benefRes.status === 'fulfilled' ? (benefRes.value.data.beneficiaries || benefRes.value.data || []) : [];
        const d = docsRes.status === 'fulfilled' ? (docsRes.value.data.documents || docsRes.value.data || []) : [];
        if (a.length > 0) score += 25;
        if (b.length > 0) score += 25;
        if (d.length > 0) score += 20;
        if (a.length >= 3) score += 10;
        if (b.length >= 2) score += 10;
        if (d.length >= 2) score += 10;
        setReadiness(Math.min(score, 100));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare chart data
  const categoryData = assets.reduce((acc, asset) => {
    const cat = asset.category || 'Other';
    const existing = acc.find((d) => d.name === cat);
    if (existing) existing.value += 1;
    else acc.push({ name: cat, value: 1 });
    return acc;
  }, []);

  const topAssets = [...assets]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5)
    .map((a) => ({ name: a.name?.substring(0, 15) || 'Asset', value: a.value || 0 }));

  // Readiness color
  const readinessColor = readiness < 30 ? 'var(--accent-red)' : readiness < 60 ? 'var(--accent-gold)' : 'var(--accent-teal)';
  const circumference = 2 * Math.PI * 75;
  const dashOffset = circumference - (readiness / 100) * circumference;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  // Quick actions
  const quickActions = [
    { label: 'Add Asset', icon: <RiSafeLine />, to: '/assets/new' },
    { label: 'Add Beneficiary', icon: <RiUserHeartLine />, to: '/beneficiaries/new' },
    { label: 'Upload Document', icon: <RiUploadLine />, to: '/documents' },
    { label: 'Create Will', icon: <RiFileList3Line />, to: '/will' },
    { label: 'AI Advisor', icon: <RiRobot2Line />, to: '/ai/advisor' },
    { label: 'Check In', icon: <RiShieldCheckLine />, to: '/settings' },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton skeleton-title" style={{ width: '300px', marginBottom: '24px' }} />
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <motion.div className="welcome-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h2>{getGreeting()}, {user?.name?.split(' ')[0] || 'User'} 👋</h2>
          <p>Here's an overview of your digital estate. Keep everything up to date.</p>
        </div>
        <div className="score-circle" style={{ width: 120, height: 120 }}>
          <svg viewBox="0 0 160 160">
            <circle className="score-circle-bg" cx="80" cy="80" r="75" />
            <circle
              className="score-circle-fill"
              cx="80" cy="80" r="75"
              stroke={readinessColor}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="score-circle-text">
            <div className="score-circle-value" style={{ fontSize: '1.8rem', color: readinessColor }}>{readiness}</div>
            <div className="score-circle-label" style={{ fontSize: '0.65rem' }}>Readiness</div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {[
          { label: 'Total Assets', value: assets.length, icon: <RiSafeLine />, color: 'gold', trend: '+2 this month', up: true },
          { label: 'Beneficiaries', value: beneficiaries.length, icon: <RiUserHeartLine />, color: 'teal', trend: 'All verified', up: true },
          { label: 'Documents', value: documents.length, icon: <RiFileTextLine />, color: 'blue', trend: 'Encrypted', up: true },
          { label: 'Active Plans', value: plans.length, icon: <RiFlowChart />, color: 'purple', trend: 'On track', up: true },
        ].map((stat, i) => (
          <motion.div key={stat.label} className="stat-card" custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <div className={`stat-card-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-card-content">
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
              <div className={`stat-card-trend ${stat.up ? 'up' : 'down'}`}>
                {stat.up ? <RiArrowUpLine /> : <RiArrowDownLine />} {stat.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Quick Actions</h3>
        <div className="quick-actions" style={{ marginBottom: '28px' }}>
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to} className="quick-action-btn">
              <span className="icon">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Asset Distribution Pie */}
        <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="chart-title">Asset Distribution</div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon"><RiSafeLine /></div>
              <p className="empty-state-text">Add assets to see distribution</p>
            </div>
          )}
        </motion.div>

        {/* Top Assets Bar Chart */}
        <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="chart-title">Top Assets by Value</div>
          {topAssets.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topAssets} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="value" fill="var(--accent-gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon"><RiSafeLine /></div>
              <p className="empty-state-text">Add assets with values to see chart</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div className="glass-card-static" style={{ padding: '24px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="chart-title">Recent Activity</div>
        {notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.slice(0, 5).map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontSize: '0.9rem', flexShrink: 0 }}>
                  <RiCheckboxCircleLine />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{n.title || n.message || 'Activity'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No recent activity. Start by adding your first asset!
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
