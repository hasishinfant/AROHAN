import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useArohanStore } from '../../stores/arohanStore';
import {
  LayoutDashboard,
  Package,
  Zap,
  GitCompare,
  History,
  Sliders,
  Smartphone,
  BarChart3,
  Activity,
  Compass,
  FileText,
  Boxes,
  ShieldAlert
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Public Portal', icon: Compass, section: 'OVERVIEW' },
  { path: '/command', label: 'Command Center', icon: LayoutDashboard, section: 'OPERATIONS' },
  { path: '/multimodal', label: 'Multimodal Operations', icon: Boxes, section: 'OPERATIONS' },
  { path: '/risk', label: 'Risk Dashboard', icon: ShieldAlert, section: 'OPERATIONS' },
  { path: '/mission', label: 'Mission Detail', icon: Package, section: 'OPERATIONS' },
  { path: '/action', label: 'Action Center', icon: Zap, section: 'OPERATIONS', alertKey: 'pending' },
  { path: '/replan', label: 'Replanning View', icon: GitCompare, section: 'OPERATIONS' },
  { path: '/reports', label: 'Risk Intelligence', icon: FileText, section: 'ANALYTICS' },
  { path: '/history', label: 'Decision History', icon: History, section: 'ANALYTICS' },
  { path: '/baseline', label: 'Baseline Comparison', icon: BarChart3, section: 'ANALYTICS' },
  { path: '/demo', label: 'Demo Controller', icon: Sliders, section: 'SYSTEM' },
  { path: '/health', label: 'System Health', icon: Activity, section: 'SYSTEM' },
  { path: '/driver', label: 'Driver Interface', icon: Smartphone, section: 'SYSTEM' },
];

import { Logo } from '../Logo';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { current_decision, isConnected } = useArohanStore();

  const hasPending = current_decision?.status === 'PENDING';
  const sections = ['OVERVIEW', 'OPERATIONS', 'ANALYTICS', 'SYSTEM'];

  return (
    <aside className="sidebar">
      {/* Sidebar Header with Official Logo Emblem */}
      <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '16px 14px' }}>
        <Logo size={34} variant="light" />
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section} style={{ marginBottom: 8 }}>
            <div className="sidebar-section-title">
              {section}
            </div>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                const showBadge = item.alertKey === 'pending' && hasPending;
                return (
                  <button
                    key={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="sidebar-link-icon" />
                    <span>{item.label}</span>
                    {showBadge && (
                      <span className="badge badge-warning" style={{ marginLeft: 'auto', padding: '1px 4px', fontSize: '0.6rem' }}>
                        ACTION
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer — Translucent Blue Glass Card */}
      <div style={{
        margin: '12px 10px',
        padding: '10px 12px',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(96, 165, 250, 0.25)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
          <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.72rem', letterSpacing: '0.02em' }}>
            System Online
          </span>
        </div>
        <div style={{ fontSize: '0.65rem', color: '#bfdbfe', opacity: 0.85, fontWeight: 600 }}>v1.0.0</div>
        <div style={{ fontSize: '0.62rem', color: '#93c5fd', opacity: 0.7, fontWeight: 500 }}>Arohan NER Logistics Control</div>
      </div>
    </aside>
  );
}
