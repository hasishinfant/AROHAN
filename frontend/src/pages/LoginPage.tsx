import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import {
  Shield,
  Smartphone,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
  Mountain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Activity
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useArohanStore();
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'DRIVER'>('ADMIN');
  const [email, setEmail] = useState('admin@arohan.gov.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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
    login(activeRole, email);
    if (activeRole === 'ADMIN') {
      navigate('/command');
    } else {
      navigate('/driver');
    }
  };

  const handleQuickLogin = (role: 'ADMIN' | 'DRIVER', demoEmail: string) => {
    login(role, demoEmail);
    if (role === 'ADMIN') {
      navigate('/command');
    } else {
      navigate('/driver');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e2e8f0',
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Main Split-Screen Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          backgroundColor: '#ffffff',
          borderRadius: 28,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          minHeight: 680,
        }}
      >
        {/* LEFT COLUMN: FORM & DEMO MAIL IDS */}
        <div
          style={{
            padding: '44px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Top Brand Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                marginBottom: 32,
              }}
              onClick={() => navigate('/')}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mountain size={22} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2942', letterSpacing: '-0.02em' }}>
                AROHAN
              </span>
            </div>

            {/* Welcome Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f2942', letterSpacing: '-0.02em' }}>
                Welcome to AROHAN
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                Start your experience with AROHAN by selecting your role or signing in.
              </p>
            </div>

            {/* Role Switcher Pill Bar (Sign In / Sign Up Style) */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                padding: 4,
                borderRadius: 30,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 4,
                marginBottom: 24,
              }}
            >
              <button
                type="button"
                onClick={() => handleRoleChange('ADMIN')}
                style={{
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 24,
                  backgroundColor: activeRole === 'ADMIN' ? '#ffffff' : 'transparent',
                  color: activeRole === 'ADMIN' ? '#0f2942' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: activeRole === 'ADMIN' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Shield size={16} style={{ color: activeRole === 'ADMIN' ? '#047857' : '#64748b' }} />
                <span>Command Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DRIVER')}
                style={{
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 24,
                  backgroundColor: activeRole === 'DRIVER' ? '#ffffff' : 'transparent',
                  color: activeRole === 'DRIVER' ? '#0f2942' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: activeRole === 'DRIVER' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Smartphone size={16} style={{ color: activeRole === 'DRIVER' ? '#047857' : '#64748b' }} />
                <span>Field Driver</span>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '10px 14px',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Email Address <span style={{ color: '#047857' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 46px',
                      borderRadius: 24,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Password <span style={{ color: '#047857' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 46px 12px 46px',
                      borderRadius: 24,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Sign In Primary Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '14px',
                  borderRadius: 30,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)',
                  marginTop: 6,
                  transition: 'backgroundColor 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#065f46')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 16px 0', gap: 12 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Or sign in with Demo Email</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            </div>

            {/* Demo Mail IDs Buttons (Replaces Social Login Buttons) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN', 'admin@arohan.gov.in')}
                style={{
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 20,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                    A
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f2942' }}>Arjun Sharma (Dispatcher)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>admin@arohan.gov.in</div>
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Portal 1</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('DRIVER', 'driver.rahul@arohan.gov.in')}
                style={{
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 20,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#047857', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                    R
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f2942' }}>Rahul Kumar (Driver)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>driver.rahul@arohan.gov.in</div>
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Portal 2</span>
              </button>
            </div>
          </div>

          {/* Footer Copyright & Policies */}
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: 24 }}>
            Copyright © AROHAN, All Rights Reserved &nbsp;·&nbsp;
            <span style={{ color: '#047857', fontWeight: 600, cursor: 'pointer' }}> Term & Condition</span> &nbsp;|&nbsp;
            <span style={{ color: '#047857', fontWeight: 600, cursor: 'pointer' }}> Privacy & Policy</span>
          </div>
        </div>

        {/* RIGHT COLUMN: SCENIC NER FEATURE CARD */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(145deg, #064e3b 0%, #047857 50%, #0284c7 100%)',
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            borderRadius: '0 28px 28px 0',
            overflow: 'hidden',
          }}
        >
          {/* Top Layered Mini Previews over Scenic Background */}
          <div style={{ position: 'relative', height: 280 }}>
            {/* Background Image Layer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('/ner_hero.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 20,
                opacity: 0.35,
                filter: 'brightness(0.9)',
              }}
            />

            {/* Layered Glass Dashboard Mock Cards */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
              {/* Card 1: Risk Forecast */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  padding: 14,
                  maxWidth: 320,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  alignSelf: 'flex-start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f2942' }}>NH-6 Umiam Corridor</span>
                  <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>Risk 78%</span>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b91c1c' }}>⚠️ Heavy Rain & Landslide Hazard</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>Proactive Reroute Triggered (Alternate B)</div>
              </div>

              {/* Card 2: Mission Telemetry */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  padding: 14,
                  maxWidth: 340,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  alignSelf: 'flex-end',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f2942' }}>Mission M1042</div>
                    <div style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 700 }}>Guwahati → Shillong → Aizawl</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0284c7' }}>ETA 16:10</div>
                    <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>On Route</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Branding & Mission Text */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: 20 }}>
            {/* White Mountain Icon Badge */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <Mountain size={28} style={{ color: '#ffffff' }} />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 12 }}>
              A Unified Hub for Smarter <br />
              Logistics Decision-Making
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6, maxWidth: 420 }}>
              AROHAN empowers the North Eastern Region with proactive decision intelligence—delivering real-time risk forecasts and 360° visibility for every mission.
            </p>

            {/* Slider Dots Bar */}
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <div style={{ width: 40, height: 4, backgroundColor: '#ffffff', borderRadius: 2 }} />
              <div style={{ width: 12, height: 4, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 2 }} />
              <div style={{ width: 12, height: 4, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 2 }} />
              <div style={{ width: 12, height: 4, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 2 }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
