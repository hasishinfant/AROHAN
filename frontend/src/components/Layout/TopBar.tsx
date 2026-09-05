import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../../stores/arohanStore';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Compass,
  Menu,
  ShieldAlert,
  Boxes
} from 'lucide-react';

export function TopBar() {
  const navigate = useNavigate();
  const {
    user,
    logout,
    isConnected,
    toggleSidebar,
    operationalAlerts
  } = useArohanStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeAlertsCount = operationalAlerts?.filter(a => a.status === 'ACTIVE').length || 2;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (q.includes('risk') || q.includes('landslide') || q.includes('flood') || q.includes('nh-') || q.includes('corridor')) {
        navigate('/map');
      } else if (q.includes('resource') || q.includes('food') || q.includes('oxygen') || q.includes('shortage')) {
        navigate('/resources');
      } else if (q.includes('action') || q.includes('alert') || q.includes('recommend') || q.includes('route') || q.includes('replan')) {
        navigate('/action');
      } else if (q.includes('whatsapp') || q.includes('driver') || q.includes('coordination')) {
        navigate('/communications');
      } else {
        navigate('/command');
      }
    }
  };

  return (
    <header
      className="topbar"
      style={{
        height: 60,
        padding: '0 20px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        zIndex: 20
      }}
    >
      {/* 1. LEFT: MOBILE TOGGLE & SYSTEM TITLE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile Sidebar Hamburger Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="topbar-mobile-menu-btn"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: '#F1F5F9',
            border: '1px solid #CBD5E1',
            cursor: 'pointer',
            color: '#334155',
            flexShrink: 0
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10B981' : '#10B981',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)'
            }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>
            NER DISASTER RELIEF DECISION SYSTEM
          </span>
        </div>
      </div>

      {/* 2. CENTER: GLOBAL DISASTER LOGISTICS SEARCH BAR */}
      <div style={{ flex: 1, maxWidth: 540 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: '6px 12px'
          }}
        >
          <Search size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search District (Aizawl), Corridor (NH-6), Resource (Oxygen/Food), Hazard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.82rem',
              color: '#0F172A',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* 3. RIGHT: NOTIFICATION & USER PROFILE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Notification Bell with indicator */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => navigate('/action')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Active Operational Advisories"
          >
            <Bell size={16} />
          </button>
          {activeAlertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 9999,
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                fontSize: '0.62rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #FFFFFF'
              }}
            >
              {activeAlertsCount}
            </span>
          )}
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
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.1 }}>
                {user?.name || 'Officer'}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                Relief Command
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
                borderRadius: 8,
                padding: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                minWidth: 180,
                zIndex: 50
              }}
            >
              <div style={{ padding: '6px 10px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>{user?.name || 'Relief Officer'}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{user?.email || 'admin@arohan.gov.in'}</div>
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
                  borderRadius: 6,
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
