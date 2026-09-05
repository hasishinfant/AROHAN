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
    <header className="topbar" style={{
      height: 64,
      padding: '0 20px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }}>
      {/* 1. LEFT BRANDING & ACTIVE MISSION SELECTOR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Navigation Icon Button */}
        <button
          onClick={() => navigate('/command')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#04221e',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(4, 34, 30, 0.25)'
          }}
        >
          <Truck size={18} />
        </button>

        {/* 2. UNIFIED ACTIVE MISSION SELECTOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>
            Active Mission
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 18,
            padding: '3px 12px',
            minWidth: 280,
            maxWidth: 320
          }}>
            <select
              value={selectedShipmentId || 1}
              onChange={(e) => selectShipment(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                fontSize: '0.78rem',
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

      {/* 3. RIGHT META ACTIONS & OPERATIONAL STATUS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 18,
          padding: '5px 14px',
          width: 260
        }}>
          <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search corridor, vehicle, location, risk..."
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
          padding: '5px 12px',
          borderRadius: 18,
          backgroundColor: sys.badgeClass.includes('critical') ? '#fef2f2' : sys.badgeClass.includes('warning') ? '#fff7ed' : '#dcfce7',
          color: sys.badgeClass.includes('critical') ? '#dc2626' : sys.badgeClass.includes('warning') ? '#ea580c' : '#15803d',
          border: `1px solid ${sys.badgeClass.includes('critical') ? '#fecaca' : sys.badgeClass.includes('warning') ? '#ffedd5' : '#86efac'}`,
          letterSpacing: '0.02em'
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: sys.badgeClass.includes('critical') ? '#dc2626' : sys.badgeClass.includes('warning') ? '#ea580c' : '#16a34a'
          }} />
          <span>{sys.label}</span>
        </div>

        {/* Journey Step Indicator */}
        {scenario_status && scenario_status !== 'IDLE' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 10px', backgroundColor: '#f1f5f9', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Journey</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
              {(scenario_step ?? -1) + 1} / 9
            </span>
          </div>
        )}

        {/* Dynamic ETA */}
        {shipment && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '3px 10px', backgroundColor: '#fff5f5', borderRadius: 6, border: '1px solid #fecaca' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>ETA</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace' }}>
              {shipment.updated_eta ?? shipment.planned_eta}
            </span>
          </div>
        )}

        {/* User Block matching screenshot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#04221e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
            {user?.avatarText || 'AS'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{user?.name || 'Arjun Sharma'}</span>
            <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>Mission Operator</span>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#94a3b8', marginLeft: 4 }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
