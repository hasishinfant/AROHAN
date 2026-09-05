import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../../stores/arohanStore';
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  Volume2,
  VolumeX,
  Compass,
  Radio
} from 'lucide-react';

export function TopBar() {
  const navigate = useNavigate();
  const {
    shipmentsList,
    selectedShipmentId,
    selectShipment,
    scenario_step,
    user,
    logout,
    isConnected
  } = useArohanStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const systemStatus = () => {
    const step = scenario_step ?? -1;
    if (step >= 7) return { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3', label: 'SLA Breached', dot: '#DC2626' };
    if (step >= 4) return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Reroute Active', dot: '#F59E0B' };
    if (step >= 2) return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'At Risk (Elevated)', dot: '#F59E0B' };
    if (step >= 0) return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Mission Active', dot: '#3B82F6' };
    return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'Normal SLA', dot: '#10B981' };
  };

  const sys = systemStatus();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="topbar"
      style={{
        height: 64,
        padding: '0 24px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        zIndex: 20
      }}
    >
      {/* 1. LEFT: ACTIVE MISSION DROPDOWN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '5px 12px'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10B981' : '#3B82F6'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Shipment
            </span>
            <select
              value={selectedShipmentId || 1}
              onChange={(e) => selectShipment(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#0F172A',
                outline: 'none',
                cursor: 'pointer',
                paddingRight: 6
              }}
            >
              {shipmentsList?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shipment_code} — {s.origin.split(' ')[0]} → {s.destination.split(' ')[0]} ({s.cargo_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. CENTER: SANCHAR AI SEARCH BAR */}
      <div style={{ flex: 1, maxWidth: 500 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '7px 14px'
          }}
        >
          <Search size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search corridors, lanes, carriers, SLA status..."
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem',
              color: '#0F172A',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* 3. RIGHT: STATUS PILL, ICONS & USER AVATAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Operational Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 9999,
            backgroundColor: sys.bg,
            color: sys.text,
            border: `1px solid ${sys.border}`
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: sys.dot
            }}
          />
          <span>{sys.label}</span>
        </div>

        {/* Audio Alert Toggle */}
        <button
          type="button"
          onClick={() => setAudioEnabled(!audioEnabled)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: audioEnabled ? '#059669' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={audioEnabled ? 'Mute Alerts' : 'Enable Audio Alerts'}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Team Communication */}
        <button
          type="button"
          onClick={() => navigate('/action')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Team Communication"
        >
          <MessageSquare size={16} />
        </button>

        {/* Notification Bell with indicator */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => navigate('/risk')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Corridor Alerts"
          >
            <Bell size={16} />
          </button>
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#DC2626',
              border: '1.5px solid #FFFFFF'
            }}
          />
        </div>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px 4px 6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 20,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                position: 'relative'
              }}
            >
              {user?.avatarText || 'AS'}
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '1.5px solid #FFFFFF'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.1 }}>
                {user?.name || 'Arjun Sharma'}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                Director
              </span>
            </div>
            <ChevronDown size={14} style={{ color: '#94A3B8' }} />
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 42,
                right: 0,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                minWidth: 180,
                zIndex: 50
              }}
            >
              <div style={{ padding: '6px 10px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>{user?.name || 'Arjun Sharma'}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{user?.email || 'arjun@arohan.gov.in'}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  marginTop: 4,
                  backgroundColor: '#FFE4E6',
                  border: 'none',
                  borderRadius: 8,
                  color: '#BE123C',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
