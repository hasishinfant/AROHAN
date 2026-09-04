import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../../stores/arohanStore';
import { Shield, AlertTriangle, CheckCircle2, Clock, Radio, Search, Bell, LogOut } from 'lucide-react';

export function TopBar() {
  const navigate = useNavigate();
  const { shipment, scenario_status, scenario_step, isConnected, user, logout } = useArohanStore();

  const systemStatus = () => {
    const step = scenario_step ?? -1;
    if (step >= 7) return { badgeClass: 'badge-critical', label: 'FIELD OBSTRUCTION REPORTED', Icon: AlertTriangle };
    if (step >= 4) return { badgeClass: 'badge-warning', label: 'PROACTIVE REROUTE ACTIVE', Icon: Shield };
    if (step >= 2) return { badgeClass: 'badge-warning', label: 'RISK THRESHOLD EXCEEDED', Icon: AlertTriangle };
    if (step >= 0) return { badgeClass: 'badge-info', label: 'MISSION ACTIVE', Icon: Radio };
    return { badgeClass: 'badge-neutral', label: 'MONITORING IDLE', Icon: CheckCircle2 };
  };

  const sys = systemStatus();
  const Icon = sys.Icon;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      {/* Left Branding */}
      <div className="topbar-branding">
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {shipment ? `${shipment.shipment_code} — ${shipment.cargo_type}` : 'Guwahati → Shillong Logistics Corridor'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Proactive Logistics Decision Engine · North Eastern Region
          </div>
        </div>
      </div>

      {/* Center Search Pill Bar */}
      <div className="topbar-search-pill">
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search corridor telemetry, routes, risk predictions..."
        />
      </div>

      {/* Right Meta Pill Actions */}
      <div className="topbar-meta">
        <div className={`badge ${sys.badgeClass}`}>
          <div className="badge-dot" />
          <Icon size={12} />
          <span>{sys.label}</span>
        </div>

        {scenario_status && scenario_status !== 'IDLE' && (
          <div className="pill-button" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            STEP {(scenario_step ?? -1) + 1} / 9
          </div>
        )}

        {shipment && (
          <div className="pill-button" style={{ gap: 6, color: shipment.updated_eta ? 'var(--status-warning-accent)' : 'var(--text-main)' }}>
            <Clock size={14} />
            <span>{shipment.updated_eta ?? shipment.planned_eta}</span>
          </div>
        )}

        {/* User Badge & Logout Pill */}
        <div className="pill-button" style={{ padding: '4px 12px 4px 6px', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--bg-dark-pill)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
            {user?.avatarText || 'AS'}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{user?.name || 'Arjun Sharma'}</span>
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', marginLeft: 4 }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
