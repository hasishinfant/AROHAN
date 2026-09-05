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
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { Logo } from '../Logo';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { current_decision, logout, isConnected } = useArohanStore();

  const hasPending = current_decision?.status === 'PENDING';

  const navItems = [
    { path: '/command', label: 'Command Center', icon: LayoutDashboard },
    { path: '/multimodal', label: 'Multimodal Hub', icon: Boxes },
    { path: '/risk', label: 'Risk Intelligence', icon: ShieldAlert },
    { path: '/mission', label: 'Mission Operations', icon: Package },
    { path: '/action', label: 'AI Action Center', icon: Zap, alert: hasPending },
    { path: '/reports', label: 'Corridor Analytics', icon: FileText },
    { path: '/history', label: 'Decision Audit', icon: History },
    { path: '/baseline', label: 'SLA Baseline', icon: BarChart3 },
    { path: '/demo', label: 'Scenario Simulator', icon: Sliders },
  ];

  return (
    <aside className="sidebar">
      {/* 1. TOP BRAND HEADER */}
      <div>
        <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            flexShrink: 0
          }}>
            <Sparkles size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                SANCHAR AI
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                borderRadius: 9999,
                padding: '1px 6px'
              }}>
                PRO
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
              National Logistics Copilot
            </span>
          </div>
        </div>

        {/* 2. NAVIGATION LINKS */}
        <nav className="sidebar-nav" style={{ marginTop: 14 }}>
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
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive ? '#059669' : '#64748B',
                    flexShrink: 0,
                    transition: 'color 0.15s ease'
                  }}
                />
                <span style={{
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.85rem'
                }}>
                  {item.label}
                </span>
                {item.alert && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#DC2626',
                      boxShadow: '0 0 8px #DC2626'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. BOTTOM UTILITIES & TELEMETRY STATUS */}
      <div className="sidebar-footer">
        {/* Connection status card */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10B981' : '#3B82F6'
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155' }}>
              {isConnected ? 'Telemetry Live' : 'Simulation Mode'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/driver')}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#64748B',
              padding: 2
            }}
            title="Open Driver Interface"
          >
            <Smartphone size={15} />
          </button>
        </div>

        {/* Sign out button */}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn btn-outline"
          style={{
            width: '100%',
            padding: '7px 12px',
            fontSize: '0.78rem',
            color: '#64748B',
            borderColor: '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
