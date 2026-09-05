import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../../stores/arohanStore';
import { Shield, AlertTriangle, CheckCircle2, Clock, Radio, Search, LogOut, Truck } from 'lucide-react';

import { Logo } from '../Logo';

export function TopBar() {
  const navigate = useNavigate();
  const { shipment, shipmentsList, selectedShipmentId, selectShipment, scenario_status, scenario_step, user, logout } = useArohanStore();

  const systemStatus = () => {
    const step = scenario_step ?? -1;
    if (step >= 7) return { badgeClass: 'badge-critical', label: 'OBSTRUCTION REPORTED', Icon: AlertTriangle };
    if (step >= 4) return { badgeClass: 'badge-warning', label: 'PROACTIVE REROUTE ACTIVE', Icon: Shield };
    if (step >= 2) return { badgeClass: 'badge-warning', label: 'RISK THRESHOLD EXCEEDED', Icon: AlertTriangle };
    if (step >= 0) return { badgeClass: 'badge-info', label: 'MISSION ACTIVE', Icon: Radio };
    return { badgeClass: 'badge-neutral', label: 'MONITORING IDLE', Icon: CheckCircle2 };
  };

  const sys = systemStatus();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar" style={{ height: 64, padding: '0 20px', borderBottom: '1px solid #cbd5e1', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      {/* 1. LEFT BRANDING WITH LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div onClick={() => navigate('/')}>
          <Logo size={32} variant="dark" />
        </div>

        <div style={{ width: 1, height: 28, backgroundColor: '#e2e8f0' }} />

        {/* 2. CENTER: UNIFIED ACTIVE MISSION SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ACTIVE MISSION
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '4px 10px',
              minWidth: 280,
              maxWidth: 320
            }}>
              <Truck size={14} style={{ color: '#1d4ed8', flexShrink: 0 }} />
              <select
                value={selectedShipmentId || 1}
                onChange={(e) => selectShipment(Number(e.target.value))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
              >
                {shipmentsList?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shipment_code} · {s.origin.split(' ')[0]} → {s.destination.split(' ')[0]} ({s.cargo_type.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT META ACTIONS & OPERATIONAL STATUS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '4px 10px',
          width: 220
        }}>
          <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search corridor telemetry..."
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.75rem',
              color: '#0f172a',
              background: 'transparent'
            }}
          />
        </div>

        {/* Operational Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: 4,
          backgroundColor: sys.badgeClass.includes('critical') ? '#fef2f2' : sys.badgeClass.includes('warning') ? '#fff7ed' : '#eff6ff',
          color: sys.badgeClass.includes('critical') ? '#dc2626' : sys.badgeClass.includes('warning') ? '#ea580c' : '#1d4ed8',
          border: `1px solid ${sys.badgeClass.includes('critical') ? '#fecaca' : sys.badgeClass.includes('warning') ? '#ffedd5' : '#bfdbfe'}`,
          letterSpacing: '0.02em'
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: sys.badgeClass.includes('critical') ? '#dc2626' : sys.badgeClass.includes('warning') ? '#ea580c' : '#1d4ed8'
          }} />
          <span>{sys.label}</span>
        </div>

        {/* Journey Step Indicator */}
        {scenario_status && scenario_status !== 'IDLE' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: 4, border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>JOURNEY</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
              {(scenario_step ?? -1) + 1} / 9
            </span>
          </div>
        )}

        {/* Dynamic ETA */}
        {shipment && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '2px 8px', backgroundColor: '#f8fafc', borderRadius: 4, border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ETA</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: shipment.updated_eta ? '#dc2626' : '#0f172a', fontFamily: 'monospace' }}>
              {shipment.updated_eta ?? shipment.planned_eta}
            </span>
          </div>
        )}

        {/* Compact User Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6 }}>
          <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '2px 6px', fontSize: '0.68rem', fontWeight: 800, borderRadius: 4 }}>
            {user?.avatarText || 'AS'}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{user?.name || 'Arjun Sharma'}</span>
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', marginLeft: 2 }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
