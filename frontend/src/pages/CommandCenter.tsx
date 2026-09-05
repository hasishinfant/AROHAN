import React, { useState, useEffect } from 'react';
import { MapView } from '../components/Map/MapView';
import { StatusBadge } from '../components/StatusBadge';
import { useArohanStore } from '../stores/arohanStore';
import { useNavigate } from 'react-router-dom';
import { gpsSimulationService } from '../services/gpsSimulationService';
import { DecisionFlowStepper } from '../components/DecisionFlowStepper';
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
  Sparkles,
  DollarSign,
  Compass,
  Boxes
} from 'lucide-react';

export function CommandCenter() {
  const {
    shipment,
    shipmentsList,
    selectedShipmentId,
    selectShipment,
    scenario_step,
    kpis,
    isConnected,
    gpsUpdate,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', paddingBottom: 40 }}>
      
      {/* End-to-End Decision Flow Stepper */}
      <DecisionFlowStepper />

      {/* 1. TOP HEADER: TITLE & CONTROLS (Sanchar AI Style) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
              Command Center
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 9999,
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0'
            }}>
              Active Monitoring
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B', fontWeight: 400 }}>
            Real-time corridor telemetry, predictive risk indices, and autonomous multimodal dispatch orchestration.
          </p>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live IST Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <Clock size={14} style={{ color: '#059669' }} />
            <span>{currentTime} IST</span>
          </div>

          {/* Date Picker Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <Calendar size={14} style={{ color: '#64748B' }} />
            <span>24.04.2026</span>
          </div>

          {/* Simulation Controls Button */}
          <button
            type="button"
            onClick={() => setShowDemoControls(!showDemoControls)}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 8
            }}
          >
            <Sliders size={14} />
            <span>Demo Controls</span>
            {showDemoControls ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* DEMO SIMULATION CONTROLS (COLLAPSIBLE) */}
      {showDemoControls && (
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={18} style={{ color: '#34D399' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                DEMO SCENARIO SIMULATION ENGINE
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Trigger hazards, test AI reroute recommendations, and adjust telemetry playback speeds.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSimulateDisruption}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              <CloudRain size={14} />
              <span>Simulate Disruption (Step {step < 0 ? 1 : step + 1})</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerReroute}
              style={{
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              <Zap size={14} />
              <span>Apply AI Bypass (Route B)</span>
            </button>

            <button
              type="button"
              onClick={() => gpsSimulationService.setSpeedMultiplier(50)}
              style={{
                backgroundColor: '#334155',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Speed 50×
            </button>

            <button
              type="button"
              onClick={handleResetSimulation}
              style={{
                backgroundColor: '#475569',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. SANCHAR AI COPILOT INSIGHT CARD (Section 6.B Blueprint) */}
      <div
        className="card-ai-insight"
        style={{
          border: '1px solid #BFDBFE',
          background: 'linear-gradient(90deg, rgba(239, 246, 255, 0.6) 0%, rgba(238, 242, 255, 0.25) 100%)',
          borderRadius: 16,
          padding: '18px 22px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: '6px 8px', borderRadius: 8, backgroundColor: '#EFF6FF', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E3A8A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              AROHAN LOGISTICS COPILOT — PROACTIVE ROUTE RECOMMENDATION
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 9999,
              fontSize: '0.68rem',
              fontWeight: 700,
              backgroundColor: '#DBEAFE',
              color: '#1E40AF'
            }}>
              CONFIDENCE 96%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleTriggerReroute}
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: '#059669',
                color: '#FFFFFF',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              Apply Recommendation
            </button>
            <button
              type="button"
              onClick={() => setShowRiskModal(true)}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              Inspect Risk ML
            </button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
          Rerouting <strong>{currentShipment?.shipment_code || 'SHP-001'}</strong> via Western Sonapur Ridge Corridor bypasses landslide-prone NH-06 kilometer 42, reducing SLA breach exposure by <strong>21%</strong> and cutting transit delay by <strong>5.9 hours</strong>.
        </p>
      </div>

      {/* 3. CORE METRIC PANELS (Section 6.A Blueprint - 4 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        
        {/* Metric 1: On-Time SLA */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ON-TIME DELIVERY SLA
            </span>
            <div style={{ padding: 8, borderRadius: 10, backgroundColor: '#F8FAFC', color: '#059669', border: '1px solid #E2E8F0' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0F172A' }}>98.4%</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#047857' }}>
              +2.4%
            </span>
          </div>
          <p style={{ marginTop: 4, margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
            Compared to last week average
          </p>
        </div>

        {/* Metric 2: Freight Volume Dispatched */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL TON-KM DISPATCHED
            </span>
            <div style={{ padding: 8, borderRadius: 10, backgroundColor: '#F8FAFC', color: '#3B82F6', border: '1px solid #E2E8F0' }}>
              <Truck size={16} />
            </div>
          </div>
          
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0F172A' }}>13,984</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#047857' }}>
              +18.4%
            </span>
          </div>
          <p style={{ marginTop: 4, margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
            Active multimodal movement
          </p>
        </div>

        {/* Metric 3: Delay Mitigated */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EXPECTED DELAY AVOIDED
            </span>
            <div style={{ padding: 8, borderRadius: 10, backgroundColor: '#F8FAFC', color: '#F59E0B', border: '1px solid #E2E8F0' }}>
              <Clock size={16} />
            </div>
          </div>
          
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0F172A' }}>
              {kpis?.delay_avoided_h != null ? `${kpis.delay_avoided_h} hrs` : '5.9 hrs'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
              Route B
            </span>
          </div>
          <p style={{ marginTop: 4, margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
            Landslide bypass mitigation
          </p>
        </div>

        {/* Metric 4: Direct Savings */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LOGISTICS COST SAVED
            </span>
            <div style={{ padding: 8, borderRadius: 10, backgroundColor: '#F8FAFC', color: '#059669', border: '1px solid #E2E8F0' }}>
              <DollarSign size={16} />
            </div>
          </div>
          
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#059669' }}>₹48.2 L</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#047857' }}>
              Optimal
            </span>
          </div>
          <p style={{ marginTop: 4, margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
            Idle fuel & disruption penalty reduction
          </p>
        </div>
      </div>

      {/* 4. VISUALIZATION & ANALYTICS ROW (Section 7 Blueprint - Emerald & Multi-Series) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr', gap: 18, alignItems: 'stretch' }}>
        
        {/* CHART 1: TELEMETRY & RISK REPORT (Area Chart with #059669 Emerald Gradient) */}
        <div className="card" style={{ padding: 22, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Telemetry & Risk Exposure Curve
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                  Dynamic corridor vulnerability index & sensor stream
                </div>
              </div>

              {/* Range Filters */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['Real-time', 'Daily'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReportRange(r)}
                    style={{
                      border: '1px solid',
                      borderColor: reportRange === r ? '#059669' : '#E2E8F0',
                      backgroundColor: reportRange === r ? '#ECFDF5' : '#FFFFFF',
                      color: reportRange === r ? '#047857' : '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Spline Area Chart with Sanchar AI Emerald Gradient (Section 7 Spec) */}
            <div style={{ position: 'relative', width: '100%', height: 140 }}>
              <svg width="100%" height="100%" viewBox="0 0 500 140" preserveAspectRatio="none">
                <defs>
                  {/* Sanchar AI Emerald Gradient Pattern */}
                  <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                {/* Dashed Background Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#E2E8F0" strokeDasharray="3 3" />

                {/* Gradient Fill Path */}
                <path
                  d="M0,110 C80,105 120,40 180,35 C240,30 280,85 340,70 C400,55 440,25 500,20 L500,140 L0,140 Z"
                  fill="url(#colorEmerald)"
                />

                {/* Primary Emerald Line (#059669) */}
                <path
                  d="M0,110 C80,105 120,40 180,35 C240,30 280,85 340,70 C400,55 440,25 500,20"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Secondary Blue Line (#3B82F6) */}
                <path
                  d="M0,120 C80,115 140,85 200,80 C260,75 320,95 380,85 C440,75 480,50 500,45"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />

                {/* Key Risk Peak Marker */}
                <circle cx="180" cy="35" r="4" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="500" cy="20" r="4" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* Tooltip Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 140,
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34D399' }} />
                <span>Peak Risk 82% @ 12:40</span>
              </div>
            </div>

            {/* Timestamps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500, marginTop: 8 }}>
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F1F5F9', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#334155' }}>
              <Shield size={14} style={{ color: '#059669' }} />
              <span>Recommended bypass: <strong>Route B (+5.9h saved)</strong></span>
            </div>
            <button
              onClick={handleTriggerReroute}
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
            >
              Trigger Reroute
            </button>
          </div>
        </div>

        {/* CHART 2: MULTIMODAL MODE SPLIT (Donut Ring Chart) */}
        <div className="card" style={{ padding: 22, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Multimodal Mode Split
              </h3>
              <button
                type="button"
                onClick={() => navigate('/multimodal')}
                style={{ border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', padding: 2 }}
              >
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Donut Chart */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 130 }}>
              <svg width="130" height="130" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="4.5" />
                {/* Emerald 600 - Highway Freight (64%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#059669"
                  strokeWidth="4.5"
                  strokeDasharray="64 36"
                  strokeDashoffset="25"
                  strokeLinecap="round"
                />
                {/* Blue 500 - Rail Express (22%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="4.5"
                  strokeDasharray="22 78"
                  strokeDashoffset="61"
                  strokeLinecap="round"
                />
                {/* Amber 500 - Inland Waterways (10%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="4.5"
                  strokeDasharray="10 90"
                  strokeDashoffset="39"
                  strokeLinecap="round"
                />
                {/* Purple - Air Cargo (4%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="4.5"
                  strokeDasharray="4 96"
                  strokeDashoffset="29"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>TOTAL</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>150</span>
                <span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Missions</span>
              </div>
            </div>

            {/* Sanchar AI Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669' }} />
                <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Highway (64%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Rail (22%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Water (10%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Air (4%)</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
            Auto-balanced multimodal matrix
          </div>
        </div>

        {/* CHART 3: ACTIVE FLEET DRIVERS & VEHICLES (Emerald Bar Chart) */}
        <div className="card" style={{ padding: 22, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Active Fleet Status
              </h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0'
              }}>
                94% Active
              </span>
            </div>

            {/* Bar Chart with Emerald Fill */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, padding: '0 6px' }}>
              {[
                { day: 'Mon', active: 85 },
                { day: 'Tue', active: 92 },
                { day: 'Wed', active: 78 },
                { day: 'Thu', active: 95 },
                { day: 'Fri', active: 88 },
                { day: 'Sat', active: 94 },
                { day: 'Sun', active: 70 }
              ].map((b) => (
                <div key={b.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 14,
                      height: 100,
                      backgroundColor: '#F1F5F9',
                      borderRadius: 6,
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
                        backgroundColor: b.active >= 90 ? '#059669' : '#10B981',
                        borderRadius: 6,
                        transition: 'height 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
                    {b.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Total Fleet: 148 units</span>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>8 in standby</span>
          </div>
        </div>
      </div>

      {/* 5. PRIMARY GIS CORRIDOR MONITORING DISPLAY */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Radio size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>
                Primary GIS Corridor Monitoring Display — {currentShipment?.shipment_code || 'SHP-001'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Geospatial vehicle tracking with animated route vectors & terrain elevation mapping
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: '#475569' }}>
            <span>Origin: <strong style={{ color: '#0F172A' }}>{currentShipment?.origin.split(' ')[0]}</strong></span>
            <ArrowRight size={14} style={{ color: '#94A3B8' }} />
            <span>Destination: <strong style={{ color: '#0F172A' }}>{currentShipment?.destination.split(' ')[0]}</strong></span>
            <span style={{ color: '#E2E8F0' }}>|</span>
            <span>Speed: <strong style={{ color: '#059669' }}>{gpsUpdate?.speed_kmh || 60} km/h</strong></span>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ height: 480, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <MapView />
        </div>
      </div>

      {/* 6. FLEET OPERATIONS MANIFEST TABLE (Section 6.E Blueprint) */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Fleet Operations Manifest
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
              Active shipments, designated transit corridors, and real-time SLA metrics
            </div>
          </div>

          {/* Search Box & Status Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search shipment, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  fontSize: '0.78rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: '#F8FAFC'
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
                    border: '1px solid',
                    borderColor: statusFilter === st ? '#059669' : '#E2E8F0',
                    backgroundColor: statusFilter === st ? '#ECFDF5' : '#FFFFFF',
                    color: statusFilter === st ? '#047857' : '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
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

        {/* Structured Data Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '4%' }}>
                  <input type="checkbox" style={{ accentColor: '#059669', cursor: 'pointer' }} />
                </th>
                <th style={{ width: '13%' }}>Shipment</th>
                <th style={{ width: '25%' }}>Corridor / Lane</th>
                <th style={{ width: '22%' }}>Cargo Manifest</th>
                <th style={{ width: '11%' }}>Vehicle ID</th>
                <th style={{ width: '13%' }}>SLA Status</th>
                <th style={{ width: '12%' }}>ETA</th>
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
                      backgroundColor: isSelected ? '#F8FAFC' : 'transparent',
                      borderLeft: isSelected ? '4px solid #059669' : '4px solid transparent'
                    }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => selectShipment(s.id)}
                        style={{ accentColor: '#059669', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: isSelected ? '#059669' : '#0F172A' }}>{s.shipment_code}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
                        <span>{s.origin.split(' ')[0]}</span>
                        <ArrowRight size={12} style={{ color: '#94A3B8' }} />
                        <span>{s.destination.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>
                      {s.cargo_type}
                    </td>
                    <td>
                      <span
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#0F172A',
                          padding: '2px 6px',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          fontWeight: 600
                        }}
                      >
                        TRK-00{s.id}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={activeGps?.simulated_status || s.status} />
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}>
                      {activeGps?.eta_formatted || (s.updated_eta || s.planned_eta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. RISK BREAKDOWN MODAL */}
      {showRiskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              width: '100%',
              maxWidth: 580,
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={22} style={{ color: '#DC2626' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    AI Risk & Disruption Factor Analysis
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Corridor {currentShipment?.shipment_code} ({currentShipment?.origin.split(' ')[0]} → {currentShipment?.destination.split(' ')[0]})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8, border: '1px solid #A7F3D0', fontSize: '0.8rem', color: '#047857' }}>
                <strong>ML Confidence Score: 92%</strong> — Ingesting IMD rainfall radar grids, slope incline contours, and ground soil saturation telemetry.
              </div>

              {/* Factors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>
                    <span>Precipitation Rate (IMD Radar)</span>
                    <span style={{ color: '#DC2626' }}>82 mm/hr (Heavy Storm)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '82%', height: '100%', backgroundColor: '#DC2626' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>
                    <span>Mountain Slope Incline</span>
                    <span style={{ color: '#F59E0B' }}>42° Steep Gradient</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '74%', height: '100%', backgroundColor: '#F59E0B' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>
                    <span>Soil Saturation Index</span>
                    <span style={{ color: '#DC2626' }}>94% (Landslide Alert)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', backgroundColor: '#DC2626' }} />
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
                className="btn btn-primary"
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
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
                className="btn btn-secondary"
                style={{
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600
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
