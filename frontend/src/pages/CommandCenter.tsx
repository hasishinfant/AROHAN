import React, { useState, useEffect } from 'react';
import { MapView } from '../components/Map/MapView';
import { RiskGauge } from '../components/RiskGauge';
import { StatusBadge } from '../components/StatusBadge';
import { useArohanStore } from '../stores/arohanStore';
import { useNavigate } from 'react-router-dom';
import { gpsSimulationService } from '../services/gpsSimulationService';
import {
  Clock,
  Radio,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Sliders,
  Truck,
  Zap,
  CloudRain,
  Shield,
  ShieldAlert,
  Search,
  RotateCcw,
  X,
  Calendar,
  Layers,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Ship,
  Train,
  Plane
} from 'lucide-react';

export function CommandCenter() {
  const {
    shipment,
    shipmentsList,
    selectedShipmentId,
    selectShipment,
    risk_results,
    current_decision,
    scenario_step,
    kpis,
    isConnected,
    gpsUpdate,
    approveDecision,
    scenarioNext,
    scenarioReset
  } = useArohanStore();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  const [showDemoControls, setShowDemoControls] = useState<boolean>(false);
  const [reportRange, setReportRange] = useState<'Real-time' | 'Daily'>('Real-time');

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const step = scenario_step ?? -1;
  const riskA = risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'A') : null;

  // Filtered shipments
  const filteredShipments = (shipmentsList || []).filter((s) => {
    const matchesSearch =
      s.shipment_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cargo_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSimulateDisruption = async () => {
    if (scenarioNext) {
      await scenarioNext();
    }
  };

  const handleTriggerReroute = () => {
    gpsSimulationService.acceptReroute();
  };

  const handleResetSimulation = () => {
    gpsSimulationService.reset(selectedShipmentId || 1);
    if (scenarioReset) {
      scenarioReset();
    }
  };

  const currentShipment = shipment || (shipmentsList && shipmentsList[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', paddingBottom: 32 }}>
      
      {/* 1. TOP HEADER: TITLE & CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#181a18', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Overview
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#717671', fontWeight: 500 }}>
            Unified national multimodal resilience intelligence & real-time corridor monitoring
          </p>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Date Picker Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e5e2',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#181a18',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <Calendar size={14} style={{ color: '#717671' }} />
            <span>24.04.2026</span>
          </div>

          {/* Demo Controls Pill Button */}
          <button
            type="button"
            onClick={() => setShowDemoControls(!showDemoControls)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: showDemoControls ? '#181a18' : '#ffffff',
              color: showDemoControls ? '#ffffff' : '#181a18',
              border: '1px solid #e2e5e2',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            <Sliders size={14} />
            <span>Simulation Controls</span>
            {showDemoControls ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* DEMO CONTROLS BANNER (COLLAPSIBLE) */}
      {showDemoControls && (
        <div
          style={{
            backgroundColor: '#181a18',
            color: '#ffffff',
            borderRadius: 20,
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={18} style={{ color: '#d4f934' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em', color: '#ffffff' }}>
                DEMO SCENARIO SIMULATION ENGINE
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                Simulate mountain corridor disruptions, test autonomous reroute logic, and verify live telemetry.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSimulateDisruption}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '7px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 10,
                cursor: 'pointer'
              }}
            >
              <CloudRain size={14} />
              <span>Trigger Disruption (Step {step < 0 ? 1 : step + 1})</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerReroute}
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '7px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 10,
                cursor: 'pointer'
              }}
            >
              <Zap size={14} />
              <span>Execute Route B Bypass</span>
            </button>

            <button
              type="button"
              onClick={() => gpsSimulationService.setSpeedMultiplier(50)}
              style={{
                backgroundColor: '#374151',
                color: '#ffffff',
                border: 'none',
                padding: '7px 12px',
                fontSize: '0.74rem',
                fontWeight: 800,
                borderRadius: 10,
                cursor: 'pointer'
              }}
            >
              Speed 50×
            </button>

            <button
              type="button"
              onClick={handleResetSimulation}
              style={{
                backgroundColor: '#4b5563',
                color: '#ffffff',
                border: 'none',
                padding: '7px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 10,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ROW 1: (A) HERO OVERVIEW CARD + (B) UPCOMING EVENTS + (C) POPULAR CATEGORIES DONUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr', gap: 18, alignItems: 'stretch' }}>
        
        {/* CARD A: HERO SAGE-GREEN CARD WITH 3D TERRAIN CONTOUR & 4 FLOATING METRIC PILLS */}
        <div
          style={{
            backgroundColor: '#dcfce7',
            backgroundImage: 'radial-gradient(ellipse at 80% 20%, #bbf7d0 0%, #dcfce7 60%)',
            borderRadius: 22,
            padding: '24px 24px 20px 24px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 280,
            border: '1px solid #bbf7d0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          {/* Background 3D Topographical Contour Graphics */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              opacity: 0.35,
              pointerEvents: 'none'
            }}
            viewBox="0 0 700 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M400,60 Q480,20 560,70 T720,50" stroke="#15803d" strokeWidth="1.5" fill="none" />
            <path d="M360,90 Q450,40 550,100 T730,90" stroke="#15803d" strokeWidth="1.5" fill="none" />
            <path d="M330,120 Q430,70 540,130 T740,120" stroke="#15803d" strokeWidth="1.5" fill="none" />
            <path d="M300,150 Q410,100 520,160 T750,150" stroke="#15803d" strokeWidth="1.5" fill="none" />
            <path d="M280,180 Q390,130 500,190 T760,180" stroke="#15803d" strokeWidth="1.5" fill="none" />
            <path d="M260,210 Q370,160 480,220 T770,210" stroke="#15803d" strokeWidth="1.5" fill="none" />
            <ellipse cx="530" cy="110" rx="90" ry="30" stroke="#16a34a" strokeWidth="1" strokeDasharray="3 3" />
            <ellipse cx="530" cy="110" rx="140" ry="48" stroke="#16a34a" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Hero Top Title & Status */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800, color: '#15803d', marginBottom: 8 }}>
                <Activity size={13} />
                <span>INTELLIGENT CORRIDOR OPERATIONS</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14532d', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Active Freight Manifest & Dispatch Stream
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#166534', fontWeight: 500, maxWidth: 380 }}>
                Continuous multimodal GPS tracking with IMD weather radar correlation and autonomous bypass triggers.
              </p>
            </div>

            <button
              onClick={() => navigate('/multimodal')}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.85)',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
              title="Open Multimodal View"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>

          {/* 4 Floating Overlapping Metric Pills matching Reference Mockup */}
          <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 24 }}>
            {/* Pill 1: Lime Yellow Highlight Pill */}
            <div
              style={{
                backgroundColor: '#d4f934',
                borderRadius: 16,
                padding: '12px 14px',
                boxShadow: '0 4px 12px rgba(212, 249, 52, 0.4)',
                border: '1px solid #c2eb23'
              }}
            >
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2a3b00', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ton-Km Dispatched
              </div>
              <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#172200', marginTop: 2, letterSpacing: '-0.02em' }}>
                13,984
              </div>
              <div style={{ fontSize: '0.64rem', color: '#445b05', fontWeight: 700, marginTop: 2 }}>
                +18.4% today
              </div>
            </div>

            {/* Pill 2: Frosted White */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(10px)',
                borderRadius: 16,
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                On-Time Rate
              </div>
              <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                98.4%
              </div>
              <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 700, marginTop: 2 }}>
                Reliable Corridor
              </div>
            </div>

            {/* Pill 3: Frosted White */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(10px)',
                borderRadius: 16,
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delay Mitigated
              </div>
              <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                {kpis?.delay_avoided_h != null ? `${kpis.delay_avoided_h} hrs` : '5.9 hrs'}
              </div>
              <div style={{ fontSize: '0.64rem', color: '#2563eb', fontWeight: 700, marginTop: 2 }}>
                Sonapur Bypass
              </div>
            </div>

            {/* Pill 4: Frosted White */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(10px)',
                borderRadius: 16,
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cost Saved
              </div>
              <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                ₹48.2 L
              </div>
              <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 700, marginTop: 2 }}>
                Fleet Fuel & Idle
              </div>
            </div>
          </div>
        </div>

        {/* CARD B: UPCOMING EVENTS / CORRIDOR ALERTS */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 22,
            padding: '20px',
            border: '1px solid #e2e5e2',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#181a18', margin: 0 }}>
                Upcoming Events
              </h3>
              <button
                type="button"
                onClick={() => navigate('/risk')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#717671',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* List of Events with Date Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Event 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    backgroundColor: '#181a18',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    borderRadius: 10,
                    padding: '3px 7px',
                    lineHeight: 1.2,
                    flexShrink: 0
                  }}
                >
                  02/08
                </span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#181a18', lineHeight: 1.2 }}>
                    Sonapur Hill Landslide Alert
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#717671', marginTop: 2 }}>
                    NH-06 corridor slope saturation 94%
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    backgroundColor: '#f1f3f1',
                    color: '#181a18',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    borderRadius: 10,
                    padding: '3px 7px',
                    lineHeight: 1.2,
                    flexShrink: 0
                  }}
                >
                  04/08
                </span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#181a18', lineHeight: 1.2 }}>
                    Guwahati Multimodal Hub
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#717671', marginTop: 2 }}>
                    Rail-to-road transshipment surge (+35%)
                  </div>
                </div>
              </div>

              {/* Event 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    backgroundColor: '#f1f3f1',
                    color: '#181a18',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    borderRadius: 10,
                    padding: '3px 7px',
                    lineHeight: 1.2,
                    flexShrink: 0
                  }}
                >
                  07/08
                </span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#181a18', lineHeight: 1.2 }}>
                    Pandu Port Barge Scheduling
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#717671', marginTop: 2 }}>
                    NW-2 Brahmaputra draft level normal
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/risk')}
            style={{
              width: '100%',
              marginTop: 14,
              padding: '8px 12px',
              borderRadius: 12,
              backgroundColor: '#f8faf9',
              border: '1px solid #e2e5e2',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#181a18',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            View All Alerts (14)
          </button>
        </div>

        {/* CARD C: MULTIMODAL MODE SPLIT (DONUT RING CHART) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 22,
            padding: '20px',
            border: '1px solid #e2e5e2',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#181a18', margin: 0 }}>
                Popular Categories
              </h3>
              <button
                type="button"
                onClick={() => navigate('/multimodal')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#717671',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* SVG Donut Chart with Pastel Segments */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 130 }}>
              <svg width="130" height="130" viewBox="0 0 42 42">
                {/* Background Ring */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                {/* Segment 1: Coral / Land Freight (64%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#f87171"
                  strokeWidth="4.5"
                  strokeDasharray="64 36"
                  strokeDashoffset="25"
                  strokeLinecap="round"
                />
                {/* Segment 2: Sky Blue / Rail (22%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="4.5"
                  strokeDasharray="22 78"
                  strokeDashoffset="61"
                  strokeLinecap="round"
                />
                {/* Segment 3: Mint Green / Water (10%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#4ade80"
                  strokeWidth="4.5"
                  strokeDasharray="10 90"
                  strokeDashoffset="39"
                  strokeLinecap="round"
                />
                {/* Segment 4: Lavender / Air (4%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#a78bfa"
                  strokeWidth="4.5"
                  strokeDasharray="4 96"
                  strokeDashoffset="29"
                  strokeLinecap="round"
                />
              </svg>
              {/* Donut Center Label */}
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#717671', textTransform: 'uppercase' }}>
                  Total
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#181a18', lineHeight: 1 }}>
                  150
                </span>
                <span style={{ fontSize: '0.58rem', color: '#9ca3af', fontWeight: 600 }}>
                  Missions
                </span>
              </div>
            </div>

            {/* Pastel Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px', marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f87171' }} />
                <span style={{ fontSize: '0.68rem', color: '#4b5563', fontWeight: 600 }}>Highway (64%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                <span style={{ fontSize: '0.68rem', color: '#4b5563', fontWeight: 600 }}>Rail (22%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4ade80' }} />
                <span style={{ fontSize: '0.68rem', color: '#4b5563', fontWeight: 600 }}>Water (10%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a78bfa' }} />
                <span style={{ fontSize: '0.68rem', color: '#4b5563', fontWeight: 600 }}>Air (4%)</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.68rem', color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
            Auto-balanced across 4 modes
          </div>
        </div>
      </div>

      {/* 3. ROW 2: (D) TOP CORRIDORS + (E) TELEMETRY & RISK REPORT + (F) ACTIVE FLEET BAR CHART */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: 18, alignItems: 'stretch' }}>
        
        {/* CARD D: TOP CORRIDORS / PRIORITY SHIPMENTS */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 22,
            padding: '20px',
            border: '1px solid #e2e5e2',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#181a18', margin: 0 }}>
                Priority Shipments
              </h3>
              <button
                type="button"
                onClick={() => navigate('/command')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#717671',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(shipmentsList || []).slice(0, 3).map((s) => {
                const isCurrent = (selectedShipmentId || 1) === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectShipment(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 14,
                      backgroundColor: isCurrent ? '#f4f7f4' : '#ffffff',
                      border: `1px solid ${isCurrent ? '#c2e0c0' : '#f1f3f1'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          backgroundColor: isCurrent ? '#181a18' : '#f1f3f1',
                          color: isCurrent ? '#ffffff' : '#4b5563',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Truck size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#181a18' }}>
                          {s.shipment_code}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#717671' }}>
                          {s.origin.split(' ')[0]} → {s.destination.split(' ')[0]}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#181a18', fontFamily: 'monospace' }}>
                        {s.updated_eta || s.planned_eta}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 700 }}>
                        {s.weight_kg} kg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setShowRiskModal(true)}
            style={{
              width: '100%',
              marginTop: 14,
              padding: '8px 12px',
              borderRadius: 12,
              backgroundColor: '#f8faf9',
              border: '1px solid #e2e5e2',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#181a18',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Inspect Risk Breakdown →
          </button>
        </div>

        {/* CARD E: TELEMETRY & RISK REPORT (SMOOTH CURVED SVG AREA CHART) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 22,
            padding: '20px 24px',
            border: '1px solid #e2e5e2',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Header with Title & Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#181a18', margin: 0 }}>
                  Telemetry & Risk Report
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#717671', marginTop: 2 }}>
                  Dynamic corridor vulnerability curve & IMD sensor streams
                </div>
              </div>

              {/* Range Filters */}
              <div style={{ display: 'flex', gap: 6 }}>
                {(['Real-time', 'Daily'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReportRange(r)}
                    style={{
                      border: 'none',
                      backgroundColor: reportRange === r ? '#181a18' : '#f1f3f1',
                      color: reportRange === r ? '#ffffff' : '#4b5563',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 14,
                      cursor: 'pointer'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Smooth Spline SVG Area Chart with Tooltip Pill */}
            <div style={{ position: 'relative', width: '100%', height: 140 }}>
              <svg width="100%" height="100%" viewBox="0 0 500 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#86efac" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#86efac" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f3f1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f3f1" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f3f1" strokeDasharray="3 3" />

                {/* Smooth Gradient Fill Path */}
                <path
                  d="M0,110 C80,105 120,40 180,35 C240,30 280,85 340,70 C400,55 440,25 500,20 L500,140 L0,140 Z"
                  fill="url(#areaGradient)"
                />

                {/* Smooth Curve Line */}
                <path
                  d="M0,110 C80,105 120,40 180,35 C240,30 280,85 340,70 C400,55 440,25 500,20"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Peak Indicator Dot */}
                <circle cx="180" cy="35" r="4.5" fill="#15803d" stroke="#ffffff" strokeWidth="2" />
                <circle cx="500" cy="20" r="4.5" fill="#15803d" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Floating Highlight Tooltip Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 130,
                  backgroundColor: '#181a18',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 10,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#d4f934' }} />
                <span>Peak Risk 82% @ 12:40</span>
              </div>
            </div>

            {/* X-Axis Timestamps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, marginTop: 6 }}>
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f1f3f1', marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#4b5563' }}>
              <Shield size={14} style={{ color: '#16a34a' }} />
              <span>Bypass recommendation: <strong>Route B (+5.9h saved)</strong></span>
            </div>
            <button
              onClick={handleTriggerReroute}
              style={{
                backgroundColor: '#181a18',
                color: '#ffffff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: 10,
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Trigger Reroute
            </button>
          </div>
        </div>

        {/* CARD F: ACTIVE FLEET DRIVERS / VEHICLES (BAR CHART) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 22,
            padding: '20px',
            border: '1px solid #e2e5e2',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Header with Title & 94% Active Pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#181a18', margin: 0 }}>
                Active Fleet
              </h3>
              <span
                style={{
                  backgroundColor: '#d4f934',
                  color: '#172200',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: 12
                }}
              >
                94% Active
              </span>
            </div>

            {/* Bar Chart with Rounded Pills */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, padding: '0 8px' }}>
              {[
                { day: 'Mon', active: 85, standby: 15 },
                { day: 'Tue', active: 92, standby: 8 },
                { day: 'Wed', active: 78, standby: 22 },
                { day: 'Thu', active: 95, standby: 5 },
                { day: 'Fri', active: 88, standby: 12 },
                { day: 'Sat', active: 94, standby: 6 },
                { day: 'Sun', active: 70, standby: 30 }
              ].map((b) => (
                <div key={b.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 14,
                      height: 100,
                      backgroundColor: '#f1f3f1',
                      borderRadius: 10,
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${b.active}%`,
                        backgroundColor: b.active >= 90 ? '#181a18' : '#64748b',
                        borderRadius: 10,
                        transition: 'height 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#9ca3af', fontWeight: 700 }}>
                    {b.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f3f1' }}>
            <span style={{ fontSize: '0.68rem', color: '#717671', fontWeight: 600 }}>Total Fleet: 148 units</span>
            <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 800 }}>8 in reserve</span>
          </div>
        </div>
      </div>

      {/* 4. ROW 3: PRIMARY GIS LIVE CORRIDOR MAP DISPLAY */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 22,
          padding: '20px',
          border: '1px solid #e2e5e2',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f1f3f1', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#f1f3f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181a18' }}>
              <Radio size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#181a18' }}>
                Primary GIS Corridor Monitoring Display — {currentShipment?.shipment_code || 'SHP-001'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#717671' }}>
                Live GPS telemetry, terrain slope contours, and alternative route calculations
              </div>
            </div>
          </div>

          {/* Quick Route Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.76rem', color: '#4b5563' }}>
            <span>Origin: <strong style={{ color: '#181a18' }}>{currentShipment?.origin.split(' ')[0]}</strong></span>
            <ArrowRight size={14} style={{ color: '#9ca3af' }} />
            <span>Destination: <strong style={{ color: '#181a18' }}>{currentShipment?.destination.split(' ')[0]}</strong></span>
            <span style={{ color: '#e5e7eb' }}>|</span>
            <span>Speed: <strong style={{ color: '#181a18' }}>{gpsUpdate?.speed_kmh || 60} km/h</strong></span>
          </div>
        </div>

        {/* Main Map Container */}
        <div style={{ height: 480, width: '100%', borderRadius: 16, overflow: 'hidden' }}>
          <MapView />
        </div>
      </div>

      {/* 5. ROW 4: FLEET OPERATIONS MANIFEST TABLE */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 22,
          padding: '24px',
          border: '1px solid #e2e5e2',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f1f3f1', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#181a18', margin: 0 }}>
              Fleet Operations Manifest
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#717671', marginTop: 2 }}>
              Active shipments, designated transit corridors, and real-time status
            </div>
          </div>

          {/* Search & Status Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search shipment, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 34px',
                  fontSize: '0.78rem',
                  border: '1px solid #e2e5e2',
                  borderRadius: 20,
                  outline: 'none',
                  backgroundColor: '#f8faf9'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['ALL', 'IN_TRANSIT', 'DISPATCHED', 'DISRUPTED', 'PLANNED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    border: 'none',
                    backgroundColor: statusFilter === st ? '#181a18' : '#f1f3f1',
                    color: statusFilter === st ? '#ffffff' : '#4b5563',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 16,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Structured Manifest Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', width: 36 }}>
                  <input type="checkbox" style={{ accentColor: '#181a18', cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Shipment</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Corridor Route</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Cargo Manifest</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Vehicle ID</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Risk Level</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>ETA</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((s) => {
                const isSelected = (selectedShipmentId || 1) === s.id;
                const activeGps = (gpsUpdate && gpsUpdate.shipmentId === s.id) ? gpsUpdate : null;
                return (
                  <tr
                    key={s.id}
                    onClick={() => selectShipment(s.id)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: isSelected ? '#f8faf9' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => selectShipment(s.id)}
                        style={{ accentColor: '#181a18', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: '#181a18' }}>{s.shipment_code}</strong>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                        <span>{s.origin.split(' ')[0]}</span>
                        <ArrowRight size={12} style={{ color: '#9ca3af' }} />
                        <span>{s.destination.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#4b5563' }}>
                      {s.cargo_type}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          backgroundColor: '#f1f3f1',
                          color: '#181a18',
                          padding: '3px 8px',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          fontWeight: 700
                        }}
                      >
                        TRK-00{s.id}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatusBadge status={activeGps?.simulated_status || s.status} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 10,
                          color: s.urgency >= 5 || s.status === 'DISRUPTED' ? '#dc2626' : s.urgency === 4 ? '#b45309' : '#15803d',
                          backgroundColor: s.urgency >= 5 || s.status === 'DISRUPTED' ? '#fef2f2' : s.urgency === 4 ? '#fffbeb' : '#f0fdf4'
                        }}
                      >
                        {s.urgency >= 5 || s.status === 'DISRUPTED' ? 'High Risk' : s.urgency === 4 ? 'Moderate' : 'Low Risk'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 800, color: '#181a18' }}>
                      {activeGps?.eta_formatted || (s.updated_eta || s.planned_eta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. RISK BREAKDOWN MODAL */}
      {showRiskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 26, 24, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 22,
              width: '100%',
              maxWidth: 580,
              padding: 24,
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #e2e5e2'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f1', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={22} style={{ color: '#dc2626' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#181a18', margin: 0 }}>
                    AI Risk & Vulnerability Analysis
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#717671' }}>
                    Corridor {currentShipment?.shipment_code} ({currentShipment?.origin.split(' ')[0]} → {currentShipment?.destination.split(' ')[0]})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#717671' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, border: '1px solid #bbf7d0', fontSize: '0.75rem', color: '#15803d' }}>
                <strong>ML Confidence Index: 92%</strong> — Ingesting IMD rainfall radar grids, slope gradient maps, and soil saturation sensors in real time.
              </div>

              {/* Factors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>Precipitation Rate (IMD Radar)</span>
                    <span style={{ color: '#dc2626' }}>82 mm/hr (Heavy Rainfall)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#f1f3f1', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '82%', height: '100%', backgroundColor: '#dc2626' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>Slope Incline Vulnerability</span>
                    <span style={{ color: '#ea580c' }}>42° Mountain Sector</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#f1f3f1', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '74%', height: '100%', backgroundColor: '#ea580c' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>Soil Saturation Index</span>
                    <span style={{ color: '#dc2626' }}>94% (Landslide Hazard)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#f1f3f1', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', backgroundColor: '#dc2626' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  handleTriggerReroute();
                  setShowRiskModal(false);
                }}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Zap size={14} />
                <span>Execute Route B Bypass</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                style={{
                  backgroundColor: '#f1f3f1',
                  color: '#181a18',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
