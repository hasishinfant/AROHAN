import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import { Shield, Smartphone, Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

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
        backgroundColor: 'var(--bg-canvas)',
        padding: 16,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Main Split Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          minHeight: 540,
        }}
      >
        {/* LEFT COLUMN: FORM & DEMO ACCOUNTS */}
        <div
          style={{
            padding: '32px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Brand Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                marginBottom: 24,
              }}
              onClick={() => navigate('/')}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-navy)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  border: '1px solid #1d4ed8',
                }}
              >
                A
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '0.04em' }}>
                  AROHAN
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  GOVERNMENT LOGISTICS SYSTEM
                </div>
              </div>
            </div>

            {/* Header Text */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', textTransform: 'uppercase' }}>
                SYSTEM LOGIN PORTAL
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Select operational role and authenticate to access system tools.
              </p>
            </div>

            {/* Rectangular Role Switcher Tabs */}
            <div
              style={{
                backgroundColor: 'var(--bg-panel)',
                padding: 3,
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 4,
                marginBottom: 20,
              }}
            >
              <button
                type="button"
                onClick={() => handleRoleChange('ADMIN')}
                style={{
                  border: 'none',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeRole === 'ADMIN' ? 'var(--primary-navy)' : 'transparent',
                  color: activeRole === 'ADMIN' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  textTransform: 'uppercase',
                }}
              >
                <Shield size={14} />
                <span>COMMAND PORTAL</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DRIVER')}
                style={{
                  border: 'none',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeRole === 'DRIVER' ? 'var(--primary-navy)' : 'transparent',
                  color: activeRole === 'DRIVER' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  textTransform: 'uppercase',
                }}
              >
                <Smartphone size={14} />
                <span>FIELD DRIVER</span>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', color: '#991b1b', padding: '8px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {error}
                </div>
              )}

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address / Official ID</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={15}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter official email address"
                    required
                    style={{ paddingLeft: 34 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={15}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    style={{ paddingLeft: 34, paddingRight: 34 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-blue btn-lg" style={{ marginTop: 4 }}>
                <LogIn size={15} />
                <span>SIGN IN TO SYSTEM</span>
              </button>
            </form>

            {/* Quick Demo Access Table */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 4 }}>
                QUICK DEMO ACCOUNTS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ADMIN', 'admin@arohan.gov.in')}
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-medium)',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>Arjun Sharma (Dispatcher)</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>admin@arohan.gov.in</div>
                  </div>
                  <span className="badge badge-info">[PORTAL 1: COMMAND]</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('DRIVER', 'driver.rahul@arohan.gov.in')}
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-medium)',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>Rahul Kumar (Driver)</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>driver.rahul@arohan.gov.in</div>
                  </div>
                  <span className="badge badge-success">[PORTAL 2: FIELD]</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 16 }}>
            © 2026 AROHAN Logistics Risk Intelligence System · NIC & MDoNER Aligned
          </div>
        </div>

        {/* RIGHT COLUMN: INSTITUTIONAL SPECIFICATION CARD */}
        <div
          style={{
            backgroundColor: 'var(--primary-navy)',
            color: '#ffffff',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '2px solid #1d4ed8',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              GOVERNMENT LOGISTICS SYSTEM SPECIFICATION
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.25, marginBottom: 14 }}>
              Proactive Decision Intelligence for Vulnerable Corridors
            </h2>

            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              AROHAN combines real-time weather telemetry, terrain exposure models, and loss objective optimization to protect freight supply chains in the North Eastern Region.
            </div>

            {/* Feature Table */}
            <div className="table-container" style={{ marginTop: 20, borderColor: '#334155' }}>
              <table className="table" style={{ backgroundColor: '#1e293b' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a' }}>
                    <th style={{ color: '#ffffff', borderColor: '#334155' }}>MODULE</th>
                    <th style={{ color: '#ffffff', borderColor: '#334155' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: '#cbd5e1', borderColor: '#334155' }}>IMD Rainfall Pipeline</td>
                    <td style={{ borderColor: '#334155' }}><span className="badge badge-success">[ACTIVE]</span></td>
                  </tr>
                  <tr>
                    <td style={{ color: '#cbd5e1', borderColor: '#334155' }}>OSM Route Network GIS</td>
                    <td style={{ borderColor: '#334155' }}><span className="badge badge-success">[ACTIVE]</span></td>
                  </tr>
                  <tr>
                    <td style={{ color: '#cbd5e1', borderColor: '#334155' }}>Loss Objective Engine</td>
                    <td style={{ borderColor: '#334155' }}><span className="badge badge-success">[ACTIVE]</span></td>
                  </tr>
                  <tr>
                    <td style={{ color: '#cbd5e1', borderColor: '#334155' }}>PWA Driver Mobile Push</td>
                    <td style={{ borderColor: '#334155' }}><span className="badge badge-success">[ACTIVE]</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            SIH26002 Problem Statement Solution · National Logistics Policy Aligned
          </div>
        </div>

      </div>
    </div>
  );
}
