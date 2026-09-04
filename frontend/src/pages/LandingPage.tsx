import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Smartphone,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  Activity,
  Layers,
  Radio,
  Sliders,
  Compass,
  Monitor,
  Navigation,
  RefreshCw,
  Users,
  Truck,
  Mountain,
  Globe,
  Award,
  Lock,
  ChevronRight,
  TrendingUp,
  CloudRain,
  ExternalLink,
  LogIn
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');

  const nerStates = [
    { name: 'Assam', challenge: 'Brahmaputra Floodplains & Freight Hubs', color: '#047857' },
    { name: 'Meghalaya', challenge: 'High Rainfall, Umiam Gap & NH-6 Landslides', color: '#0284c7' },
    { name: 'Arunachal Pradesh', challenge: 'Steep Hill Slope & Remote Valley Corridors', color: '#b91c1c' },
    { name: 'Nagaland', challenge: 'Monsoon Erosion & Mountainous Connectivity', color: '#d97706' },
    { name: 'Manipur', challenge: 'Single-Highway Arterial Vulnerability', color: '#7c3aed' },
    { name: 'Mizoram', challenge: 'Ridge Pass Road Reliance & Slope Slumping', color: '#0d9488' },
    { name: 'Tripura', challenge: 'Long-Distance Transport Transit Corridors', color: '#c05621' },
    { name: 'Sikkim', challenge: 'Teesta Valley & High-Altitude Passes', color: '#4338ca' },
  ];

  const loopSteps = [
    { title: 'SENSE', desc: 'Real IMD rainfall & weather telemetry', tag: 'INPUT', icon: CloudRain },
    { title: 'PREDICT', desc: '78% disruption risk forecast (18h horizon)', tag: 'ML RISK', icon: Activity },
    { title: 'ASSESS', desc: 'Loss score evaluation (Route A vs Route B)', tag: 'DECISION', icon: GitCompare },
    { title: 'APPROVE', desc: 'Dispatcher Action Card pre-disruption reroute', tag: 'HUMAN', icon: Shield },
    { title: 'EXECUTE', desc: 'Driver mobile route update (Route B)', tag: 'MOBILE PWA', icon: Smartphone },
    { title: 'VERIFY', desc: 'Driver field report (Route A BLOCKED)', tag: 'FIELD DATA', icon: CheckCircle2 },
    { title: 'REPLAN', desc: 'Network state update & automatic lock-in', tag: 'DYNAMIC', icon: RefreshCw },
  ];

  const scrollToSection = (sectionId: string, tabName: string) => {
    setActiveTab(tabName);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0f172a' }}>
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          padding: '12px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
            }}
          >
            <Mountain size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b2545', letterSpacing: '-0.02em', lineHeight: 1 }}>
              AROHAN
            </div>
            <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, marginTop: 3 }}>
              Connected Paths. Safer Futures.
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { name: 'Home', target: 'hero' },
            { name: 'About', target: 'about' },
            { name: 'How It Works', target: 'how-it-works' },
            { name: 'Impact', target: 'impact' },
            { name: 'NER Focus', target: 'ner-focus' },
            { name: 'Partners', target: 'partners' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.target, item.name)}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '0.9rem',
                fontWeight: activeTab === item.name ? 800 : 600,
                color: activeTab === item.name ? '#047857' : '#475569',
                cursor: 'pointer',
                padding: '6px 0',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {item.name}
              {activeTab === item.name && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: '#047857',
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right: MDoNER Government Label & Login Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid #e2e8f0', paddingRight: 20 }}>
            {/* Government Seal Emblem Graphic */}
            <div style={{ width: 28, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 28, border: '2px solid #0f172a', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 900 }}>
                🇮🇳
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.25 }}>
              <div>Ministry of Development of North Eastern Region</div>
              <div style={{ color: '#64748b', fontWeight: 500 }}>Government of India</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            style={{
              border: '1.5px solid #0f2942',
              backgroundColor: '#ffffff',
              color: '#0f2942',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '8px 20px',
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <LogIn size={16} />
            <span>Login</span>
          </button>
        </div>
      </header>


      {/* 2. HERO SECTION WITH NORTH EAST LANDSCAPE BACKGROUND */}
      <section
        id="hero"
        style={{
          position: 'relative',
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.88) 42%, rgba(255, 255, 255, 0.3) 100%), url('/ner_hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          padding: '48px 48px 36px 48px',
          minHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center' }}>
          
          {/* Left Column: Heading & Value Proposition */}
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              PROACTIVE LOGISTICS & CONNECTIVITY INTELLIGENCE
            </div>

            <h1
              style={{
                fontSize: '3.4rem',
                fontWeight: 800,
                color: '#0b2545',
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                marginBottom: 16,
              }}
            >
              Resilient Routes <br />
              for a Stronger <span style={{ color: '#047857' }}>North East</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.6, marginBottom: 24, fontWeight: 500 }}>
              AROHAN helps keep people, supplies and opportunities moving across the North Eastern Region by turning real-time and future insights into smarter, safer logistics decisions.
            </p>

            {/* 4 Feature Badges */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
              {[
                { label: 'Safer Roads', icon: Shield },
                { label: 'Reliable Supplies', icon: Truck },
                { label: 'Stronger Connectivity', icon: Globe },
                { label: 'Resilient Communities', icon: Users },
              ].map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <div
                    key={badge.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #cbd5e1',
                      borderRadius: 20,
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <IconComponent size={16} style={{ color: '#047857' }} />
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Translucent Quote Card */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                borderLeft: '4px solid #047857',
                borderRadius: '0 16px 16px 0',
                padding: '16px 20px',
                maxWidth: 540,
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', fontStyle: 'italic' }}>
                "Because every delivery in the North East carries a bigger purpose."
              </div>
            </div>
          </div>

          {/* Right Column: Overlay Script & Quick Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', paddingRight: 20 }}>
            <div
              style={{
                textAlign: 'right',
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '18px 24px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.45rem', fontWeight: 600, color: '#064e3b', lineHeight: 1.3 }}>
                "Mountains do not stop us.<br />They make us innovate."
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <span className="badge" style={{ backgroundColor: '#047857', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800 }}>Safer</span>
                <span className="badge" style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800 }}>More Connected</span>
                <span className="badge" style={{ backgroundColor: '#d97706', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800 }}>More Prosperous</span>
                <span className="badge" style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800 }}>North East</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TWO PRIMARY PORTAL CARDS (AROHAN COMMAND & AROHAN FIELD) */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            
            {/* CARD 1: AROHAN COMMAND */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                border: '1px solid #cbd5e1',
                padding: 28,
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Monitor size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0b2545', letterSpacing: '-0.01em' }}>
                        AROHAN COMMAND
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7' }}>
                        Plan | Decide | Coordinate
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  For Administrators & Operations Teams
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>
                  Get real-time and future insights, evaluate mission risks, approve decisions and monitor logistics across the region.
                </p>

                {/* Primary CTA Button */}
                <button
                  onClick={() => navigate('/command')}
                  style={{
                    width: '100%',
                    backgroundColor: '#0b3c5d',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    padding: '12px 24px',
                    borderRadius: 24,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(11, 60, 93, 0.3)',
                    marginBottom: 20,
                    transition: 'backgroundColor 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#072438')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0b3c5d')}
                >
                  <span>Access Command Portal</span>
                  <ArrowRight size={18} />
                </button>

                {/* Miniature Mockup Preview of Command Portal */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={12} />
                      <span>AROHAN COMMAND PREVIEW</span>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>12 Vehicles</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, alignItems: 'center' }}>
                    {/* Simulated Map View Box */}
                    <div style={{ backgroundColor: '#e2e8f0', borderRadius: 8, height: 110, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a' }}>Guwahati → Shillong Corridor</div>
                        <div style={{ fontSize: '0.65rem', color: '#b91c1c', fontWeight: 700, marginTop: 2 }}>⚠️ Risk Zone Active (78%)</div>
                      </div>
                    </div>

                    {/* Action Card Preview */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 8 }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Recommended Action</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>Reroute via Jowai Bypass</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        <button className="btn btn-primary btn-sm" style={{ fontSize: '0.65rem', padding: '2px 8px', width: '100%' }} onClick={() => navigate('/command')}>View</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* CARD 2: AROHAN FIELD */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                border: '1px solid #cbd5e1',
                padding: 28,
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#047857', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0b2545', letterSpacing: '-0.01em' }}>
                        AROHAN FIELD
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857' }}>
                        Navigate | Report | Stay Safe
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  For Drivers & Field Users
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>
                  See your route, get real-time updates, receive approved instructions and report road conditions easily, even in low connectivity areas.
                </p>

                {/* Primary CTA Button */}
                <button
                  onClick={() => navigate('/driver')}
                  style={{
                    width: '100%',
                    backgroundColor: '#047857',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    padding: '12px 24px',
                    borderRadius: 24,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)',
                    marginBottom: 20,
                    transition: 'backgroundColor 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#065f46')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
                >
                  <span>Access Driver Portal</span>
                  <ArrowRight size={18} />
                </button>

                {/* Miniature Mobile UI & Features List */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, alignItems: 'center' }}>
                    {/* Simulated Mobile Device Preview */}
                    <div style={{ backgroundColor: '#ffffff', border: '2px solid #0f172a', borderRadius: 16, padding: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#047857', textAlign: 'center', marginBottom: 4 }}>AROHAN FIELD</div>
                      <div style={{ backgroundColor: '#ecfdf5', borderRadius: 8, padding: 6, marginBottom: 6 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#065f46' }}>Mission M1042</div>
                        <div style={{ fontSize: '0.6rem', color: '#047857' }}>Guwahati → Aizawl</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#047857', marginTop: 2 }}>On Route · ETA 16:10</div>
                      </div>
                      <button className="btn btn-success btn-sm" style={{ width: '100%', fontSize: '0.6rem', padding: '3px' }} onClick={() => navigate('/driver')}>Report Condition</button>
                    </div>

                    {/* Right Features Bullet List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RefreshCw size={14} style={{ color: '#0284c7' }} />
                        <span>Simple</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Globe size={14} style={{ color: '#047857' }} />
                        <span>Multi-Language</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lock size={14} style={{ color: '#d97706' }} />
                        <span>Works Offline</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} style={{ color: '#7c3aed' }} />
                        <span>Built for You</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>


      {/* 4. BOTTOM METRICS BAR SECTION */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          padding: '24px 48px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mountain size={28} style={{ color: '#047857' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b2545', lineHeight: 1 }}>8</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>States Covered</div>
            </div>
          </div>

          <div style={{ width: 1, height: 36, backgroundColor: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users size={28} style={{ color: '#0284c7' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b2545', lineHeight: 1 }}>45+ Lakh</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>People Connected</div>
            </div>
          </div>

          <div style={{ width: 1, height: 36, backgroundColor: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Navigation size={28} style={{ color: '#d97706' }} />
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b2545', lineHeight: 1 }}>Thousands of km</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>of Strategic Roads</div>
            </div>
          </div>

          <div style={{ width: 1, height: 36, backgroundColor: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Truck size={28} style={{ color: '#7c3aed' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b2545', lineHeight: 1 }}>Stronger</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Supply Chains</div>
            </div>
          </div>

          <div style={{ width: 1, height: 36, backgroundColor: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={28} style={{ color: '#059669' }} />
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b2545', lineHeight: 1 }}>A More Resilient</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Tomorrow</div>
            </div>
          </div>

        </div>
      </section>


      {/* 5. ABOUT SECTION */}
      <section id="about" style={{ padding: '60px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            ABOUT AROHAN
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0b2545', letterSpacing: '-0.02em' }}>
            Proactive Decision Intelligence for Vulnerable Corridors
          </h2>
          <p style={{ fontSize: '1rem', color: '#475569', maxWidth: 780, margin: '12px auto 0 auto', lineHeight: 1.6 }}>
            Logistics in the North Eastern Region faces unique challenges—heavy monsoons, steep mountain slopes, single-highway vulnerabilities, and unpredictable landslides. AROHAN transforms reactive disaster recovery into proactive mission rerouting.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CloudRain size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Weather & Terrain Sensing</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              Integrates real IMD precipitation telemetry, soil saturation metrics, and historical landslide hazard indices across critical corridors like NH-6.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <GitCompare size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Tradeoff Loss Optimization</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              Calculates multi-route loss scores balancing delay time, disruption risk, cargo urgency, and fuel cost before rerouting vehicles.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Field Verification & Loop</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              Empowers drivers on the ground to confirm road blockage via offline-capable mobile reports, locking in decision integrity across the network.
            </p>
          </div>
        </div>
      </section>


      {/* 6. HOW IT WORKS: THE 7-STEP CORE LOOP */}
      <section id="how-it-works" style={{ backgroundColor: '#ffffff', padding: '60px 48px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              THE CORE DECISION LOOP
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0b2545', letterSpacing: '-0.02em' }}>
              How AROHAN Anticipates & Replans
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 700, margin: '10px auto 0 auto' }}>
              From environmental sensing to field report verification, experience the end-to-end 7-step decision lifecycle.
            </p>
          </div>

          {/* 7 Step Horizontally Scrollable / Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {loopSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.title}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#047857' }}>STEP 0{idx + 1}</span>
                      <StepIcon size={16} style={{ color: '#0284c7' }} />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                      {step.desc}
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <span className="data-tag data-tag-real" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{step.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 7. NER FOCUS SECTION */}
      <section id="ner-focus" style={{ padding: '60px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            NORTH EASTERN REGION COVERAGE
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0b2545', letterSpacing: '-0.02em' }}>
            8 States · Tailored Corridor Resilience
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {nerStates.map((st) => (
            <div
              key={st.name}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 18,
                borderTop: `4px solid ${st.color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                {st.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                {st.challenge}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 8. ALIGNMENT & PARTNERS FOOTER */}
      <footer id="partners" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '40px 48px 24px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                AROHAN
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                An innovation for a safer, more connected North East. · SIH 2026 Problem Statement SIH26002
              </div>
            </div>

            {/* National Strategic Alignment Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>
              <span>In Alignment With:</span>
              <span className="badge" style={{ backgroundColor: '#047857', color: '#ffffff' }}>Viksit Bharat @2047</span>
              <span className="badge" style={{ backgroundColor: '#0284c7', color: '#ffffff' }}>PM GatiShakti</span>
              <span className="badge" style={{ backgroundColor: '#d97706', color: '#ffffff' }}>ULIP</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <div>© 2026 AROHAN (Adaptive Logistics Orchestration Network). All rights reserved.</div>
            <div>Together for a Stronger North East 🇮🇳</div>
          </div>

        </div>
      </footer>

    </div>
  );
}
