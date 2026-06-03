/* ============================================
   DigiAsset — Header Component
   Top bar with search, notifications, user menu
   ============================================ */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RiSearchLine,
  RiNotification3Line,
  RiUser3Line,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiArrowDownSLine,
} from 'react-icons/ri';

// Map routes to page titles
const routeTitles = {
  '/dashboard': 'Dashboard',
  '/assets': 'Digital Assets',
  '/assets/new': 'Add New Asset',
  '/beneficiaries': 'Beneficiaries',
  '/beneficiaries/new': 'Add Beneficiary',
  '/documents': 'Document Vault',
  '/will': 'Digital Will',
  '/inheritance': 'Inheritance Plans',
  '/ai/advisor': 'AI Estate Advisor',
  '/ai/chat': 'AI Chat Assistant',
  '/vault': 'Secret Vault',
  '/timeline': 'Legacy Timeline',
  '/settings': 'Settings',
  '/admin': 'Admin Panel',
};

const Header = ({ sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Get page title from current route
  const pageTitle = routeTitles[location.pathname] || 'DigiAsset';

  // Get initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="header-left">
        <h1 className="header-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="search-input">
          <RiSearchLine className="search-icon" />
          <input type="text" placeholder="Search anything..." />
        </div>

        {/* Notifications */}
        <button
          className="btn-icon notification-badge"
          onClick={() => navigate('/settings')}
          title="Notifications"
        >
          <RiNotification3Line />
          <span className="badge-count">3</span>
        </button>

        {/* User dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="flex items-center gap-sm"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.2s',
            }}
          >
            <div className="avatar avatar-sm">{initials}</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <RiArrowDownSLine style={{ color: 'var(--text-muted)' }} />
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => { setShowDropdown(false); navigate('/settings'); }}
              >
                <RiUser3Line /> Profile
              </div>
              <div
                className="dropdown-item"
                onClick={() => { setShowDropdown(false); navigate('/settings'); }}
              >
                <RiSettings4Line /> Settings
              </div>
              <div className="dropdown-divider" />
              <div
                className="dropdown-item"
                onClick={() => { setShowDropdown(false); logout(); navigate('/login'); }}
                style={{ color: 'var(--accent-red)' }}
              >
                <RiLogoutBoxRLine /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
