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
  Activity,
  Globe,
  Compass
} from 'lucide-react';
import { Logo } from '../Logo';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { current_decision, logout, isConnected } = useArohanStore();

  const hasPending = current_decision?.status === 'PENDING';

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { path: '/command', label: 'Command Center', icon: LayoutDashboard },
        { path: '/map', label: 'Map Overview (GIS)', icon: Compass },
        { path: '/risk', label: 'Corridor Risk Intelligence', icon: ShieldAlert },
        { path: '/action', label: 'AI Recommendation Center', icon: Zap, alert: hasPending },
        { path: '/replan', label: 'Disaster Route Discovery', icon: Layers },
        { path: '/multimodal', label: 'Multimodal Hub (Rail/River)', icon: Activity },
        { path: '/mission', label: 'Relief Movement Details', icon: Package },
      ]
    },
    {
      title: 'RESOURCES & REDISTRIBUTION',
      items: [
        { path: '/resources', label: 'Resource Redistribution', icon: Boxes },
      ]
    },
    {
      title: 'SIMULATION & ANALYTICS',
      items: [
        { path: '/demo', label: 'Disaster Scenario Simulator', icon: Sliders },
        { path: '/reports', label: 'Corridor Analytics & Reports', icon: FileText },
        { path: '/history', label: 'Decision Audit Trail', icon: History },
        { path: '/baseline', label: 'Delivery Reliability Baseline', icon: BarChart3 },
        { path: '/health', label: 'System Health & Ingestion', icon: Globe },
      ]
    }
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
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#064E3B', letterSpacing: '-0.02em' }}>
                AROHAN
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
                SIH26002
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
              NER Disaster Logistics Intelligence
            </span>
          </div>
        </div>

        {/* 2. NAVIGATION LINKS */}
        <nav className="sidebar-nav" style={{ marginTop: 10 }}>
          {navSections.map((section) => (
            <div key={section.title} style={{ marginBottom: 10 }}>
              <div style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: '#94A3B8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 12px 2px 12px'
              }}>
                {section.title}
              </div>
              {section.items.map((item) => {
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
                      size={17}
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
                      fontSize: '0.82rem'
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
            </div>
          ))}
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
