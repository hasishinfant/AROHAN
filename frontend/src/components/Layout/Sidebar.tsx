import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useArohanStore } from '../../stores/arohanStore';
import {
  LayoutDashboard,
  Boxes,
  ShieldAlert,
  Package,
  Zap,
  FileText,
  History,
  BarChart3,
  Smartphone,
  LogOut,
  Sliders,
  Compass,
  MessageSquare,
  Layers
} from 'lucide-react';
import { Logo } from '../Logo';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { current_decision, logout } = useArohanStore();

  const hasPending = current_decision?.status === 'PENDING';

  const navItems = [
    { path: '/command', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/multimodal', label: 'Multimodal Operations', icon: Boxes },
    { path: '/risk', label: 'Risk Dashboard', icon: ShieldAlert },
    { path: '/mission', label: 'Mission Detail', icon: Package },
    { path: '/action', label: 'Action Center', icon: Zap, alert: hasPending },
    { path: '/reports', label: 'Risk Intelligence Reports', icon: FileText },
    { path: '/history', label: 'Decision History', icon: History },
    { path: '/baseline', label: 'Baseline Comparison', icon: BarChart3 },
    { path: '/demo', label: 'Demo Controller', icon: Sliders },
  ];

  return (
    <aside className="sidebar">
      {/* 1. TOP LOGO & DEVICE SWITCHER */}
      <div className="sidebar-header">
        {/* Main Logo Button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          title="AROHAN Public Portal"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <Logo size={28} showText={false} variant="dark" />
        </button>

        {/* Sub-Button: Public Portal / Device Toggle */}
        <button
          type="button"
          onClick={() => navigate('/')}
          title="Return to Public Portal"
          style={{
            width: 38,
            height: 28,
            borderRadius: 8,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          <Compass size={14} />
        </button>
      </div>

      {/* 2. CENTER NAVIGATION ICON DOCK */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              type="button"
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
              style={{
                width: 42,
                height: 42,
                borderRadius: isActive ? '50%' : 14,
                backgroundColor: isActive ? '#181a18' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                boxShadow: isActive ? '0 4px 14px rgba(24, 26, 24, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
            >
              <Icon size={18} />
              {item.alert && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                    boxShadow: '0 0 6px #dc2626'
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. BOTTOM UTILITIES: DRIVER INTERFACE & LOGOUT */}
      <div className="sidebar-footer">
        {/* Driver Interface / Messaging */}
        <button
          type="button"
          onClick={() => navigate('/driver')}
          title="Driver Console & Messaging"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.15s ease'
          }}
        >
          <Smartphone size={17} />
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Sign Out"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.15s ease'
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
