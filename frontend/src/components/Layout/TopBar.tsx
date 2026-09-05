import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../../stores/arohanStore';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  Volume2,
  VolumeX
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
    if (step >= 7) return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Obstruction Reported', dot: '#dc2626' };
    if (step >= 4) return { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5', label: 'Reroute Active', dot: '#ea580c' };
    if (step >= 2) return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Risk Elevated', dot: '#d97706' };
    if (step >= 0) return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: 'Mission Active', dot: '#2563eb' };
    return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Corridor Normal', dot: '#16a34a' };
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
        height: 72,
        padding: '0 28px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        zIndex: 20
      }}
    >
      {/* 1. LEFT: HAMBURGER & ACTIVE MISSION DROPDOWN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Rounded Hamburger Button */}
        <button
          type="button"
          onClick={() => navigate('/command')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: '#f4f5f4',
            border: '1px solid #e2e5e2',
            color: '#181a18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Mission Selector Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#f8faf9',
            border: '1px solid #e2e5e2',
            borderRadius: 24,
            padding: '6px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isConnected ? '#16a34a' : '#2563eb'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#717671', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Mission
            </span>
            <select
              value={selectedShipmentId || 1}
              onChange={(e) => selectShipment(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                fontSize: '0.78rem',
                color: '#181a18',
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

      {/* 2. CENTER: PILL SEARCH BAR */}
      <div style={{ flex: 1, maxWidth: 520 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#f8faf9',
            border: '1px solid #e2e5e2',
            borderRadius: 9999,
            padding: '8px 18px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <Search size={16} style={{ color: '#8c928c', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search missions, corridors, vehicles, alerts..."
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.82rem',
              color: '#181a18',
              backgroundColor: 'transparent',
              fontWeight: 500
            }}
          />
        </div>
      </div>

      {/* 3. RIGHT: STATUS PILL, ICONS & USER AVATAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Operational Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: 20,
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
            width: 38,
            height: 38,
            borderRadius: 14,
            backgroundColor: '#f8faf9',
            border: '1px solid #e2e5e2',
            color: audioEnabled ? '#181a18' : '#8c928c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={audioEnabled ? 'Mute Alerts' : 'Enable Audio Alerts'}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Message / Chat Button */}
        <button
          type="button"
          onClick={() => navigate('/action')}
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            backgroundColor: '#f8faf9',
            border: '1px solid #e2e5e2',
            color: '#181a18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Team Communication"
        >
          <MessageSquare size={16} />
        </button>

        {/* Notification Bell with alert dot */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => navigate('/risk')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: '#f8faf9',
              border: '1px solid #e2e5e2',
              color: '#181a18',
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
              top: 7,
              right: 7,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '1.5px solid #ffffff'
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
              gap: 10,
              padding: '4px 12px 4px 6px',
              backgroundColor: '#f8faf9',
              border: '1px solid #e2e5e2',
              borderRadius: 24,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#181a18',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                position: 'relative'
              }}
            >
              {user?.avatarText || 'AS'}
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: '2px solid #ffffff'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#181a18', lineHeight: 1.1 }}>
                {user?.name || 'Arjun Sharma'}
              </span>
              <span style={{ fontSize: '0.64rem', color: '#717671', fontWeight: 600 }}>
                Mission Director
              </span>
            </div>
            <ChevronDown size={14} style={{ color: '#717671', marginLeft: 2 }} />
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 46,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e5e2',
                borderRadius: 16,
                padding: '8px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                minWidth: 180,
                zIndex: 50
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f3f1' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#181a18' }}>{user?.name || 'Arjun Sharma'}</div>
                <div style={{ fontSize: '0.68rem', color: '#717671' }}>{user?.email || 'arjun@arohan.gov.in'}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  marginTop: 4,
                  backgroundColor: '#fef2f2',
                  border: 'none',
                  borderRadius: 10,
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
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
