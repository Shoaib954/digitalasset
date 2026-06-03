/* ============================================
   DigiAsset — Landing Page
   Stunning hero + features + stats + steps
   ============================================ */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiShieldStarFill,
  RiSafeLine,
  RiUserHeartLine,
  RiFileList3Line,
  RiRobot2Line,
  RiTimeLine,
  RiLockLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';

const Landing = () => {
  const features = [
    {
      icon: <RiSafeLine />,
      title: 'Asset Protection',
      desc: 'Securely catalog and encrypt all your digital assets — from crypto wallets to social accounts.',
      color: 'var(--accent-gold)',
      bg: 'var(--accent-gold-dim)',
    },
    {
      icon: <RiUserHeartLine />,
      title: 'Smart Beneficiaries',
      desc: 'Assign beneficiaries with custom allocation percentages and conditional transfers.',
      color: 'var(--accent-teal)',
      bg: 'var(--accent-teal-dim)',
    },
    {
      icon: <RiFileList3Line />,
      title: 'Digital Will',
      desc: 'Create legally-structured digital wills with automated PDF generation and versioning.',
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-dim)',
    },
    {
      icon: <RiRobot2Line />,
      title: 'AI Advisor',
      desc: 'Get intelligent recommendations to optimize your estate planning and close coverage gaps.',
      color: 'var(--accent-purple)',
      bg: 'var(--accent-purple-dim)',
    },
    {
      icon: <RiTimeLine />,
      title: "Dead Man's Switch",
      desc: 'Automated check-in system that triggers inheritance plans if you become unreachable.',
      color: 'var(--accent-red)',
      bg: 'var(--accent-red-dim)',
    },
    {
      icon: <RiLockLine />,
      title: 'Secret Sharing',
      desc: "Split sensitive data using Shamir's Secret Sharing — no single point of failure.",
      color: 'var(--accent-gold)',
      bg: 'var(--accent-gold-dim)',
    },
  ];

  const steps = [
    { title: 'Register & Secure', desc: 'Create your account with military-grade encryption protecting every piece of data.' },
    { title: 'Add Your Assets', desc: 'Catalog all digital assets — bank accounts, crypto, social media, intellectual property, and more.' },
    { title: 'Assign Beneficiaries', desc: 'Designate who inherits what, with percentage allocations and conditional triggers.' },
    { title: 'Activate Your Plan', desc: 'Set up inheritance triggers, create your digital will, and let AI optimize your estate plan.' },
  ];

  const stats = [
    { value: '10,000+', label: 'Assets Protected' },
    { value: '5,000+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '256-bit', label: 'Encryption' },
  ];

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="flex items-center gap-sm">
          <div className="sidebar-brand-icon"><RiShieldStarFill /></div>
          <span className="sidebar-brand-text">DigiAsset</span>
        </div>
        <div className="flex items-center gap-md">
          <Link to="/login" className="btn btn-ghost" style={{ color: 'var(--text-secondary)' }}>Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* Floating shield icon */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 80,
              height: 80,
              margin: '0 auto 28px',
              background: 'linear-gradient(135deg, var(--accent-gold), hsl(30, 90%, 48%))',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              color: 'hsl(225, 25%, 7%)',
              boxShadow: '0 0 40px hsla(38, 95%, 55%, 0.4)',
            }}
          >
            <RiShieldStarFill />
          </motion.div>

          <h1>
            Secure Your <span>Digital Legacy</span>
          </h1>
          <p>
            Protect your digital assets and ensure they reach your loved ones. 
            AI-powered estate planning with military-grade encryption.
          </p>
          <div className="landing-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <RiArrowRightLine />
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="landing-section-title">Everything You Need</h2>
          <p className="landing-section-subtitle">
            A complete platform for managing your digital estate with intelligence and security.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="feature-card-icon" style={{ background: f.bg, color: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-steps">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="landing-section-title">How It Works</h2>
          <p className="landing-section-subtitle">Four simple steps to protect everything that matters.</p>
        </motion.div>

        <div className="steps-list">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="step-item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="step-number">{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="stats-row">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="stat-item"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2024 DigiAsset. Securing digital legacies for the future.</p>
      </footer>
    </div>
  );
};

export default Landing;
