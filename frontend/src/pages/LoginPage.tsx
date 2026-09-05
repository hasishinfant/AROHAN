import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import { Logo } from '../components/Logo';
import { Shield, Smartphone, Lock, Mail, Eye, EyeOff, LogIn, CheckCircle2, Radio, ArrowRight, Zap, Key } from 'lucide-react';

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
        background: 'linear-gradient(135deg, #021210 0%, #052622 35%, #083832 70%, #031614 100%)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient Glowing Background Orbs for Glassmorphism Effect */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '18%',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Glassmorphic Split Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 1040,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
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
            background: 'rgba(2, 20, 18, 0.45)',
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
                  backgroundColor: 'rgba(20, 184, 166, 0.15)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#2dd4bf',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                <span>AUTHENTICATION SECURE</span>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
                LOGISTICS CONTROL PORTAL
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#99f6e4', opacity: 0.8, marginTop: 4 }}>
                Select your operational role to access real-time dispatch telemetry and risk engines.
              </p>
            </div>

            {/* Glassmorphic Role Switcher Tabs */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                padding: 4,
                border: '1px solid rgba(45, 212, 191, 0.25)',
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
                  border: activeRole === 'ADMIN' ? '1px solid rgba(45, 212, 191, 0.5)' : '1px solid transparent',
                  padding: '10px 14px',
                  borderRadius: 10,
                  backgroundColor: activeRole === 'ADMIN' ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(13, 148, 136, 0.2) 100%)' : 'transparent',
                  background: activeRole === 'ADMIN' ? 'rgba(20, 184, 166, 0.3)' : 'transparent',
                  color: activeRole === 'ADMIN' ? '#ffffff' : '#99f6e4',
                  fontWeight: activeRole === 'ADMIN' ? 900 : 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: activeRole === 'ADMIN' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
                }}
              >
                <Shield size={16} style={{ color: activeRole === 'ADMIN' ? '#2dd4bf' : '#99f6e4' }} />
                <span>COMMANDER / ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DRIVER')}
                style={{
                  border: activeRole === 'DRIVER' ? '1px solid rgba(45, 212, 191, 0.5)' : '1px solid transparent',
                  padding: '10px 14px',
                  borderRadius: 10,
                  backgroundColor: activeRole === 'DRIVER' ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(13, 148, 136, 0.2) 100%)' : 'transparent',
                  background: activeRole === 'DRIVER' ? 'rgba(20, 184, 166, 0.3)' : 'transparent',
                  color: activeRole === 'DRIVER' ? '#ffffff' : '#99f6e4',
                  fontWeight: activeRole === 'DRIVER' ? 900 : 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: activeRole === 'DRIVER' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
                }}
              >
                <Smartphone size={16} style={{ color: activeRole === 'DRIVER' ? '#2dd4bf' : '#99f6e4' }} />
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
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#2dd4bf', marginBottom: 5, letterSpacing: '0.04em' }}>
                  OPERATIONAL EMAIL ADDRESS
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Mail size={16} style={{ color: '#5eead4', flexShrink: 0 }} />
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
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#2dd4bf', marginBottom: 5, letterSpacing: '0.04em' }}>
                  SYSTEM ACCESS PASSWORD
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: 12,
                    padding: '10px 14px',
                  }}
                >
                  <Lock size={16} style={{ color: '#5eead4', flexShrink: 0 }} />
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
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#5eead4', display: 'flex' }}
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
                  background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(13, 148, 136, 0.35)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <LogIn size={18} />
                <span>{isSubmitting ? 'AUTHENTICATING...' : `LOG IN AS ${activeRole === 'ADMIN' ? 'DISPATCH COMMANDER' : 'FIELD DRIVER'}`}</span>
              </button>
            </form>
          </div>

          {/* Quick Demo One-Click Login Cards */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(45, 212, 191, 0.15)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              ONE-CLICK DEMO AUTHENTICATION CARDS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Demo Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN', 'admin@arohan.gov.in')}
                style={{
                  backgroundColor: 'rgba(20, 184, 166, 0.12)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
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
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399' }}>DISPATCH COMMANDER</span>
                  <Zap size={13} style={{ color: '#34d399' }} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Arjun Sharma</div>
                <div style={{ fontSize: '0.65rem', color: '#99f6e4', opacity: 0.7 }}>admin@arohan.gov.in</div>
              </button>

              {/* Demo Driver */}
              <button
                type="button"
                onClick={() => handleQuickLogin('DRIVER', 'driver.rahul@arohan.gov.in')}
                style={{
                  backgroundColor: 'rgba(20, 184, 166, 0.12)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
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
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>HEAVY TRUCK DRIVER</span>
                  <Smartphone size={13} style={{ color: '#38bdf8' }} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Rahul Verma (TRK-001)</div>
                <div style={{ fontSize: '0.65rem', color: '#99f6e4', opacity: 0.7 }}>driver.rahul@arohan.gov.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSTITUTIONAL SYSTEM CAROUSEL & GRAPHICS */}
        <div
          style={{
            padding: '36px 36px',
            background: 'linear-gradient(180deg, rgba(4, 34, 30, 0.8) 0%, rgba(2, 20, 18, 0.9) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '1px solid rgba(45, 212, 191, 0.2)',
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
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                border: '1px solid rgba(45, 212, 191, 0.4)',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#2dd4bf',
                marginBottom: 20,
              }}
            >
              <Radio size={13} />
              <span>NORTH EAST REGIONAL LOGISTICS GIS</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.3, marginBottom: 12 }}>
              INTELLIGENT HAZARD PREDICTION & MULTIMODAL FREIGHT REROUTING
            </h2>

            <p style={{ fontSize: '0.8rem', color: '#99f6e4', opacity: 0.85, lineHeight: 1.6, marginBottom: 24 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Proactive Landslide Avoidance</strong>
                  <span style={{ fontSize: '0.72rem', color: '#99f6e4', opacity: 0.75 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Multimodal IWAI NW-2 Transfer</strong>
                  <span style={{ fontSize: '0.72rem', color: '#99f6e4', opacity: 0.75 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Human-in-the-Loop Approval</strong>
                  <span style={{ fontSize: '0.72rem', color: '#99f6e4', opacity: 0.75 }}>
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
              borderTop: '1px solid rgba(45, 212, 191, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#5eead4',
              opacity: 0.7,
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
