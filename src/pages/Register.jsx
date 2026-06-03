/* ============================================
   DigiAsset — Register Page
   Multi-step registration with progress
   ============================================ */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiShieldStarFill,
  RiUserLine,
  RiMailLine,
  RiLockLine,
  RiPhoneLine,
  RiCalendarLine,
  RiMapPinLine,
  RiLoader4Line,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiEyeLine,
  RiEyeOffLine,
} from 'react-icons/ri';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', dateOfBirth: '', address: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) return;
      if (form.password !== form.confirmPassword) {
        return; // toast handled inline
      }
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
      });
      navigate('/dashboard');
    } catch (err) {
      // Error handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <motion.div
        className="auth-card auth-card-wide"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><RiShieldStarFill /></div>
          <span className="auth-logo-text">DigiAsset</span>
        </div>

        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Step {step} of 3 — {step === 1 ? 'Account Details' : step === 2 ? 'Personal Info' : 'Confirmation'}</p>

        {/* Steps indicator */}
        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} />
          <div className={`step-connector ${step >= 2 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} />
          <div className={`step-connector ${step >= 3 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`} />
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Account Details */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="input-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrapper">
                    <RiUserLine className="input-icon" />
                    <input type="text" name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <RiMailLine className="input-icon" />
                    <input type="email" name="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrapper">
                    <RiLockLine className="input-icon" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      style={{ paddingRight: '44px' }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                      {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-icon-wrapper">
                    <RiLockLine className="input-icon" />
                    <input type="password" name="confirmPassword" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <span className="form-error">Passwords do not match</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="input-group">
                  <label className="form-label">Phone Number</label>
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
                <div className="input-group">
                  <label className="form-label">Address</label>
                  <div className="input-icon-wrapper">
                    <RiMapPinLine className="input-icon" />
                    <input type="text" name="address" className="form-input" placeholder="123 Main St, City, Country" value={form.address} onChange={handleChange} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="glass-card-static" style={{ padding: '24px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-gold)' }}>Review Your Information</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      { label: 'Name', value: form.name },
                      { label: 'Email', value: form.email },
                      { label: 'Phone', value: form.phone || 'Not provided' },
                      { label: 'Date of Birth', value: form.dateOfBirth || 'Not provided' },
                      { label: 'Address', value: form.address || 'Not provided' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {step > 1 && (
              <button type="button" className="btn btn-ghost" onClick={prevStep} style={{ flex: 1 }}>
                <RiArrowLeftLine /> Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep} style={{ flex: 1 }}>
                Continue <RiArrowRightLine />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: '14px' }}>
                {loading ? (
                  <><RiLoader4Line style={{ animation: 'spin 1s linear infinite' }} /> Creating Account...</>
                ) : (
                  'Create Account'
                )}
              </button>
            )}
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
