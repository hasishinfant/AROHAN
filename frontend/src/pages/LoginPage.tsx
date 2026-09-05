import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import { Logo } from '../components/Logo';
import { Shield, Smartphone, Lock, Mail, Eye, EyeOff, LogIn, CheckCircle2, Radio, Zap } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useArohanStore();
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'DRIVER'>('ADMIN');
  const [email, setEmail] = useState('admin@arohan.gov.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: 'ADMIN' | 'DRIVER') => {
    setActiveRole(role);
    setError('');
    if (role === 'ADMIN') {
      setEmail('admin@arohan.gov.in');
    } else {
      setEmail('driver.rahul@arohan.gov.in');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      login(activeRole, email);
      if (activeRole === 'ADMIN') {
        navigate('/command');
      } else {
        navigate('/driver');
      }
    }, 400);
  };

  const handleQuickLogin = (role: 'ADMIN' | 'DRIVER', demoEmail: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      login(role, demoEmail);
      if (role === 'ADMIN') {
        navigate('/command');
      } else {
        navigate('/driver');
      }
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #dbeafe 70%, #eff6ff 100%)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient Glowing Royal Blue Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '12%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29, 78, 216, 0.18) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Split Glassmorphic Card — Pure White & Royal Blue Theme */}
      <div
        style={{
          width: '100%',
          maxWidth: 1040,
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid #bfdbfe',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(30, 58, 138, 0.14), 0 4px 16px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          minHeight: 580,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* LEFT COLUMN: AUTH FORM & DEMO CARDS */}
        <div
          style={{
            padding: '36px 42px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div>
            {/* Logo & Header Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 28,
              }}
            >
              <div
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => navigate('/')}
              >
                <Logo size={36} variant="dark" />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#1d4ed8',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb', boxShadow: '0 0 6px #2563eb' }} />
                <span>AUTHENTICATION SECURE</span>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', margin: 0 }}>
                LOGISTICS CONTROL PORTAL
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
                Select your operational role to access real-time dispatch telemetry and risk engines.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: 4,
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
                marginBottom: 22,
              }}
            >
              <button
                type="button"
                onClick={() => handleRoleChange('ADMIN')}
                style={{
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: activeRole === 'ADMIN' ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' : 'transparent',
                  color: activeRole === 'ADMIN' ? '#ffffff' : '#64748b',
                  fontWeight: activeRole === 'ADMIN' ? 900 : 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: activeRole === 'ADMIN' ? '0 4px 14px rgba(29, 78, 216, 0.3)' : 'none',
                }}
              >
                <Shield size={16} style={{ color: activeRole === 'ADMIN' ? '#ffffff' : '#64748b' }} />
                <span>COMMANDER / ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DRIVER')}
                style={{
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: activeRole === 'DRIVER' ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' : 'transparent',
                  color: activeRole === 'DRIVER' ? '#ffffff' : '#64748b',
                  fontWeight: activeRole === 'DRIVER' ? 900 : 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: activeRole === 'DRIVER' ? '0 4px 14px rgba(29, 78, 216, 0.3)' : 'none',
                }}
              >
                <Smartphone size={16} style={{ color: activeRole === 'DRIVER' ? '#ffffff' : '#64748b' }} />
                <span>FIELD DRIVER</span>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Lock size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', marginBottom: 5, letterSpacing: '0.04em' }}>
                  OPERATIONAL EMAIL ADDRESS
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Mail size={16} style={{ color: '#1d4ed8', flexShrink: 0 }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@arohan.gov.in"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      width: '100%',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', marginBottom: 5, letterSpacing: '0.04em' }}>
                  SYSTEM ACCESS PASSWORD
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Lock size={16} style={{ color: '#1d4ed8', flexShrink: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter access password"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      width: '100%',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: 6,
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(29, 78, 216, 0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                <LogIn size={18} />
                <span>{isSubmitting ? 'AUTHENTICATING...' : `LOG IN AS ${activeRole === 'ADMIN' ? 'DISPATCH COMMANDER' : 'FIELD DRIVER'}`}</span>
              </button>
            </form>
          </div>

          {/* Quick Demo Login Cards */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              ONE-CLICK DEMO AUTHENTICATION CARDS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Demo Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN', 'admin@arohan.gov.in')}
                style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 12,
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#0f172a',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>DISPATCH COMMANDER</span>
                  <Zap size={13} style={{ color: '#0284c7' }} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Arjun Sharma</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>admin@arohan.gov.in</div>
              </button>

              {/* Demo Driver */}
              <button
                type="button"
                onClick={() => handleQuickLogin('DRIVER', 'driver.rahul@arohan.gov.in')}
                style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 12,
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#0f172a',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>HEAVY TRUCK DRIVER</span>
                  <Smartphone size={13} style={{ color: '#0284c7' }} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Rahul Verma (TRK-001)</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>driver.rahul@arohan.gov.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSTITUTIONAL INFO */}
        <div
          style={{
            padding: '36px 36px',
            background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '1px solid #bfdbfe',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                backgroundColor: '#ffffff',
                border: '1px solid #93c5fd',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#1d4ed8',
                marginBottom: 20,
                boxShadow: '0 2px 6px rgba(29, 78, 216, 0.08)',
              }}
            >
              <Radio size={13} />
              <span>NORTH EAST REGIONAL LOGISTICS GIS</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: 12 }}>
              INTELLIGENT HAZARD PREDICTION & MULTIMODAL FREIGHT REROUTING
            </h2>

            <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6, marginBottom: 24 }}>
              AROHAN connects IMD weather radar feeds, SRTM topography, and live truck GPS telemetry to detect highway landslides before failure occurs.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid #bfdbfe',
                  boxShadow: '0 2px 8px rgba(30, 58, 138, 0.04)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>Proactive Landslide Avoidance</strong>
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                    Evaluates rainfall intensity and slope factors to trigger alternate corridor rerouting.
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid #bfdbfe',
                  boxShadow: '0 2px 8px rgba(30, 58, 138, 0.04)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>Multimodal IWAI NW-2 Transfer</strong>
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                    Integrates Brahmaputra riverine barges and Jogighopa MMLP for landslide-immune passage.
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid #bfdbfe',
                  boxShadow: '0 2px 8px rgba(30, 58, 138, 0.04)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>Human-in-the-Loop Approval</strong>
                  <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                    Dispatchers review ML recommendations with complete audit trail and decision logs.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#1e40af',
              fontWeight: 700,
            }}
          >
            <span>PM GATISHAKTI ALIGNED</span>
            <span>NER LOGISTICS COMMAND</span>
          </div>
        </div>
      </div>
    </div>
  );
}
