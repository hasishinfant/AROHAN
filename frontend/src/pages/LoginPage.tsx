import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import { Logo } from '../components/Logo';
import { Shield, Smartphone, Lock, Mail, Eye, EyeOff, LogIn, CheckCircle2, Radio, ArrowRight, Zap } from 'lucide-react';

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
        background: 'linear-gradient(135deg, #091e3a 0%, #1e3a8a 40%, #2563eb 75%, #0f172a 100%)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient Glowing Royal Blue Background Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '18%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Glassmorphic Split Container — White & Blue Theme */}
      <div
        style={{
          width: '100%',
          maxWidth: 1040,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
          border: '1px solid rgba(147, 197, 253, 0.35)',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
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
        {/* LEFT COLUMN: AUTH FORM & ONE-CLICK DEMO CARDS */}
        <div
          style={{
            padding: '36px 42px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.55)',
          }}
        >
          <div>
            {/* Logo & System Title Header */}
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
                <Logo size={36} variant="light" />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#60a5fa',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />
                <span>AUTHENTICATION SECURE</span>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
                LOGISTICS CONTROL PORTAL
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#bfdbfe', opacity: 0.85, marginTop: 4 }}>
                Select your operational role to access real-time dispatch telemetry and risk engines.
              </p>
            </div>

            {/* Glassmorphic Blue Role Switcher Tabs */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                padding: 4,
                border: '1px solid rgba(96, 165, 250, 0.3)',
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
                  border: activeRole === 'ADMIN' ? '1px solid rgba(96, 165, 250, 0.6)' : '1px solid transparent',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: activeRole === 'ADMIN' ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(29, 78, 216, 0.25) 100%)' : 'transparent',
                  color: activeRole === 'ADMIN' ? '#ffffff' : '#bfdbfe',
                  fontWeight: activeRole === 'ADMIN' ? 900 : 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: activeRole === 'ADMIN' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                <Shield size={16} style={{ color: activeRole === 'ADMIN' ? '#60a5fa' : '#bfdbfe' }} />
                <span>COMMANDER / ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DRIVER')}
                style={{
                  border: activeRole === 'DRIVER' ? '1px solid rgba(96, 165, 250, 0.6)' : '1px solid transparent',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: activeRole === 'DRIVER' ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(29, 78, 216, 0.25) 100%)' : 'transparent',
                  color: activeRole === 'DRIVER' ? '#ffffff' : '#bfdbfe',
                  fontWeight: activeRole === 'DRIVER' ? 900 : 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: activeRole === 'DRIVER' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                <Smartphone size={16} style={{ color: activeRole === 'DRIVER' ? '#60a5fa' : '#bfdbfe' }} />
                <span>FIELD DRIVER</span>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
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

            {/* Login Form Inputs */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#60a5fa', marginBottom: 5, letterSpacing: '0.04em' }}>
                  OPERATIONAL EMAIL ADDRESS
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(96, 165, 250, 0.35)',
                    borderRadius: 12,
                    padding: '10px 14px',
                  }}
                >
                  <Mail size={16} style={{ color: '#93c5fd', flexShrink: 0 }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@arohan.gov.in"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      width: '100%',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#60a5fa', marginBottom: 5, letterSpacing: '0.04em' }}>
                  SYSTEM ACCESS PASSWORD
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(96, 165, 250, 0.35)',
                    borderRadius: 12,
                    padding: '10px 14px',
                  }}
                >
                  <Lock size={16} style={{ color: '#93c5fd', flexShrink: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter access password"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      width: '100%',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#93c5fd', display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Royal Blue Primary Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: 6,
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <LogIn size={18} />
                <span>{isSubmitting ? 'AUTHENTICATING...' : `LOG IN AS ${activeRole === 'ADMIN' ? 'DISPATCH COMMANDER' : 'FIELD DRIVER'}`}</span>
              </button>
            </form>
          </div>

          {/* Quick Demo One-Click Login Cards — Blue Glass */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(96, 165, 250, 0.2)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              ONE-CLICK DEMO AUTHENTICATION CARDS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Demo Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN', 'admin@arohan.gov.in')}
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.18)',
                  border: '1px solid rgba(96, 165, 250, 0.35)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#60a5fa' }}>DISPATCH COMMANDER</span>
                  <Zap size={13} style={{ color: '#60a5fa' }} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Arjun Sharma</div>
                <div style={{ fontSize: '0.65rem', color: '#bfdbfe', opacity: 0.8 }}>admin@arohan.gov.in</div>
              </button>

              {/* Demo Driver */}
              <button
                type="button"
                onClick={() => handleQuickLogin('DRIVER', 'driver.rahul@arohan.gov.in')}
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.18)',
                  border: '1px solid rgba(96, 165, 250, 0.35)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#93c5fd' }}>HEAVY TRUCK DRIVER</span>
                  <Smartphone size={13} style={{ color: '#93c5fd' }} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Rahul Verma (TRK-001)</div>
                <div style={{ fontSize: '0.65rem', color: '#bfdbfe', opacity: 0.8 }}>driver.rahul@arohan.gov.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSTITUTIONAL SYSTEM CAROUSEL & GRAPHICS */}
        <div
          style={{
            padding: '36px 36px',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 58, 138, 0.9) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '1px solid rgba(96, 165, 250, 0.25)',
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
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(96, 165, 250, 0.4)',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#60a5fa',
                marginBottom: 20,
              }}
            >
              <Radio size={13} />
              <span>NORTH EAST REGIONAL LOGISTICS GIS</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.3, marginBottom: 12 }}>
              INTELLIGENT HAZARD PREDICTION & MULTIMODAL FREIGHT REROUTING
            </h2>

            <p style={{ fontSize: '0.8rem', color: '#bfdbfe', opacity: 0.85, lineHeight: 1.6, marginBottom: 24 }}>
              AROHAN connects IMD weather radar feeds, SRTM topography, and live truck GPS telemetry to detect highway landslides before failure occurs.
            </p>

            {/* Feature Highlights Grid — Blue Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(96, 165, 250, 0.25)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Proactive Landslide Avoidance</strong>
                  <span style={{ fontSize: '0.72rem', color: '#bfdbfe', opacity: 0.8 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(96, 165, 250, 0.25)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Multimodal IWAI NW-2 Transfer</strong>
                  <span style={{ fontSize: '0.72rem', color: '#bfdbfe', opacity: 0.8 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(96, 165, 250, 0.25)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Human-in-the-Loop Approval</strong>
                  <span style={{ fontSize: '0.72rem', color: '#bfdbfe', opacity: 0.8 }}>
                    Dispatchers review ML recommendations with complete audit trail and decision logs.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid rgba(96, 165, 250, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#93c5fd',
              opacity: 0.8,
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
