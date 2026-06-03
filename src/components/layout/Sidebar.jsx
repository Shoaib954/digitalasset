/* ============================================
   DigiAsset — Sidebar Navigation
   Premium sidebar with icons, sections, and user info
   ============================================ */
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  RiDashboardLine,
  RiSafeLine,
  RiUserHeartLine,
  RiFileTextLine,
  RiFileList3Line,
  RiFlowChart,
  RiRobot2Line,
  RiChat3Line,
  RiShieldKeyholeLine,
  RiTimeLine,
  RiSettings4Line,
  RiAdminLine,
  RiShieldStarFill,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiLogoutBoxRLine,
} from 'react-icons/ri';

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();

  // Get user initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Navigation sections and items
  const navSections = [
    {
      label: 'Main',
      items: [
        { to: '/dashboard', icon: <RiDashboardLine />, label: 'Dashboard' },
      ],
    },
    {
      label: 'Management',
      items: [
        { to: '/assets', icon: <RiSafeLine />, label: 'Assets' },
        { to: '/beneficiaries', icon: <RiUserHeartLine />, label: 'Beneficiaries' },
        { to: '/documents', icon: <RiFileTextLine />, label: 'Documents' },
      ],
    },
    {
      label: 'Planning',
      items: [
        { to: '/will', icon: <RiFileList3Line />, label: 'Digital Will' },
        { to: '/inheritance', icon: <RiFlowChart />, label: 'Inheritance Plans' },
        { to: '/timeline', icon: <RiTimeLine />, label: 'Timeline' },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { to: '/ai/advisor', icon: <RiRobot2Line />, label: 'AI Advisor' },
        { to: '/ai/chat', icon: <RiChat3Line />, label: 'AI Chat' },
      ],
    },
    {
      label: 'Security',
      items: [
        { to: '/vault', icon: <RiShieldKeyholeLine />, label: 'Secret Vault' },
        { to: '/settings', icon: <RiSettings4Line />, label: 'Settings' },
      ],
    },
  ];

  // Add admin section if user is admin
  if (user?.role === 'admin') {
    navSections.push({
      label: 'Admin',
      items: [
        { to: '/admin', icon: <RiAdminLine />, label: 'Admin Panel' },
      ],
    });
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand / Logo */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <RiShieldStarFill />
        </div>
        <span className="sidebar-brand-text">DigiAsset</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <span className="sidebar-section-label">{section.label}</span>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer with user info */}
      <div className="sidebar-footer">
        <div className="avatar avatar-sm">{initials}</div>
        <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {user?.email || ''}
          </div>
        </div>
        <button
          className="btn-icon"
          onClick={logout}
          title="Logout"
          style={{ border: 'none', marginLeft: 'auto' }}
        >
          <RiLogoutBoxRLine />
        </button>
      </div>

      {/* Collapse toggle */}
      <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
        {collapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
      </button>
    </aside>
  );
};

export default Sidebar;
