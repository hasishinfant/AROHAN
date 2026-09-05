import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import { DecisionFlowStepper } from '../components/DecisionFlowStepper';
import { gpsSimulationService, GPSUpdate } from '../services/gpsSimulationService';
import { MULTIMODAL_NETWORKS, JOGIGHOPA_MULTIMODAL_DEMO } from '../config/multimodalRoutes';
import { TransportMode } from '../types/multimodalTypes';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Truck,
  Train,
  Ship,
  Plane,
  Clock,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Zap,
  BarChart3,
  Layers,
  MapPin,
  FileText,
  Compass
} from 'lucide-react';

interface ShipmentRiskRow {
  id: number;
  shipment_code: string;
  cargo_type: string;
  weight_kg: number;
  urgency: number;
  origin: string;
  destination: string;
  mode: TransportMode;
  assigned_route_label: string;
  corridor_name: string;
  vehicle_name: string;
  status: string;
  // Risk Engine Output Fields
  rainfall_intensity_mmh: number;
  cumulative_24h_mm: number;
  slope_factor: number;
  historical_index: number;
  vulnerability_score: number;
  disruption_prob: number; // 0 - 1
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  expected_delay_h: number;
  mission_score: number;
  recommendation_action: 'CONTINUE' | 'REROUTE' | 'REVIEW' | 'ESCALATE';
}

export function RiskDashboard() {
  const navigate = useNavigate();
  const {
    shipmentsList,
    selectedShipmentId,
    selectShipment,
    scenario_step,
    isConnected,
    terrainRisks,
    fetchTerrainRisks
  } = useArohanStore();

  const [riskWindowTab, setRiskWindowTab] = useState<'CURRENT' | 'FORECAST'>('CURRENT');

  const [gpsUpdate, setGpsUpdate] = useState<GPSUpdate | null>(
    gpsSimulationService.getLastUpdate()
  );

  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedShipmentId, setExpandedShipmentId] = useState<number | null>(null);

  useEffect(() => {
    fetchTerrainRisks();
  }, []);

  // Subscribe to live GPS updates
  useEffect(() => {
    const unsubscribe = gpsSimulationService.subscribe((update) => {
      setGpsUpdate(update);
    });
    return () => unsubscribe();
  }, []);

  const step = scenario_step ?? -1;

  // Real-time Risk Engine Calculation Logic mirroring backend/app/engines/risk_engine.py
  const computeRiskRow = (
    s: any,
    modeOverride: TransportMode = 'LAND',
    baseRouteLabel: string = 'Route A'
  ): ShipmentRiskRow => {
    // Environmental factors shift dynamically with scenario_step
    let rainIntensity = 12.0;
    let rainCumulative = 35.0;
    let slope = 0.65;
    let historical = 0.50;
    let vulnerability = 0.60;

    if (step >= 7) {
      // Disrupted step
      rainIntensity = 48.5;
      rainCumulative = 142.0;
      slope = 0.88;
      historical = 0.85;
      vulnerability = 0.80;
    } else if (step >= 4) {
      // Elevated risk step
      rainIntensity = 32.0;
      rainCumulative = 95.0;
      slope = 0.75;
      historical = 0.65;
      vulnerability = 0.70;
    } else if (step >= 2) {
      rainIntensity = 22.0;
      rainCumulative = 60.0;
    }

    // Specific mode adjustments
    let mode: TransportMode = modeOverride;
    let corridor = 'NH-6 Guwahati → Shillong Highway';
    let vehicle = 'Tata Prima 3530.K Heavy Freight';

    if (s.id === 2 || s.assigned_route_id === 2) {
      baseRouteLabel = 'Route B (NH-27)';
      corridor = 'NH-27 Guwahati → Nagaon → Haflong Bypass';
      slope = 0.35;
      historical = 0.25;
      vulnerability = 0.30;
    }

    if (s.id === 3) {
      mode = 'RAIL';
      corridor = 'NFR Lumding → Haflong → Badarpur Line';
      vehicle = 'WAG-9 Twin-Loco Container Rake';
      slope = 0.50;
      vulnerability = 0.45;
    } else if (s.id === 4) {
      mode = 'WATER';
      corridor = 'IWAI NW-2 Brahmaputra Riverine Passage';
      vehicle = 'IWAI 1,000 DWT Cargo Vessel';
      slope = 0.05; // Landslide immune
      historical = 0.10;
      vulnerability = 0.15;
    } else if (s.id === 5) {
      mode = 'AIR';
      corridor = 'AAI Guwahati (GAU) ↔ Shillong (SHL) Air Express';
      vehicle = 'Airbus C295 Tactical Freight';
      slope = 0.10;
      historical = 0.30;
      vulnerability = 0.20;
    }

    // Risk Engine Formula Weights (matching risk_engine.py):
    // W_RAINFALL = 0.35, W_CUMULATIVE = 0.25, W_SLOPE = 0.15, W_HISTORICAL = 0.15, W_VULNERABILITY = 0.10
    const normIntensity = Math.min(rainIntensity / 50.0, 1.0);
    const normCumulative = Math.min(rainCumulative / 150.0, 1.0);

    const scoreRain = 0.35 * normIntensity;
    const scoreCumul = 0.25 * normCumulative;
    const scoreSlope = 0.15 * slope;
    const scoreHist = 0.15 * historical;
    const scoreVuln = 0.10 * vulnerability;

    let disruptionProb = Number((scoreRain + scoreCumul + scoreSlope + scoreHist + scoreVuln).toFixed(3));
    disruptionProb = Math.min(Math.max(disruptionProb, 0.05), 0.98);

    // Override if active vehicle is on Route B
    if (baseRouteLabel.includes('Route B') || mode === 'WATER') {
      disruptionProb = Number(Math.max(0.12, disruptionProb * 0.35).toFixed(3));
    }

    // Confidence
    const confidence: 'HIGH' | 'MEDIUM' | 'LOW' =
      disruptionProb >= 0.60 ? 'HIGH' : disruptionProb >= 0.30 ? 'MEDIUM' : 'LOW';

    // Expected Delay & Mission Score (matching impact_engine.py)
    const expectedDelayH = Number((disruptionProb * 12.0).toFixed(2));
    const travelTimeH = mode === 'AIR' ? 0.8 : mode === 'WATER' ? 7.5 : mode === 'RAIL' ? 9.5 : 6.5;
    const urgencyFactor = (s.urgency || 4) / 5.0;

    const baseTimePenalty = travelTimeH * 10;
    const delayPenalty = disruptionProb * expectedDelayH * 8.0;
    const urgencyPenalty = urgencyFactor * disruptionProb * 15.0;
    const missionScore = Number((baseTimePenalty + delayPenalty + urgencyPenalty).toFixed(1));

    // Decision Action
    let recAction: 'CONTINUE' | 'REROUTE' | 'REVIEW' | 'ESCALATE' = 'CONTINUE';
    if (disruptionProb >= 0.65) {
      recAction = 'REROUTE';
    } else if (disruptionProb >= 0.40) {
      recAction = 'REVIEW';
    }

    return {
      id: s.id,
      shipment_code: s.shipment_code,
      cargo_type: s.cargo_type,
      weight_kg: s.weight_kg,
      urgency: s.urgency,
      origin: s.origin,
      destination: s.destination,
      mode,
      assigned_route_label: baseRouteLabel,
      corridor_name: corridor,
      vehicle_name: vehicle,
      status: s.status,
      rainfall_intensity_mmh: rainIntensity,
      cumulative_24h_mm: rainCumulative,
      slope_factor: slope,
      historical_index: historical,
      vulnerability_score: vulnerability,
      disruption_prob: disruptionProb,
      confidence,
      expected_delay_h: expectedDelayH,
      mission_score: missionScore,
      recommendation_action: recAction
    };
  };

  // Generate rows for all shipments
  const allRows: ShipmentRiskRow[] = (shipmentsList || []).map((s) => computeRiskRow(s));

  // Filtered rows
  const filteredRows = allRows.filter((r) => {
    const matchesMode = selectedModeFilter === 'ALL' || r.mode === selectedModeFilter;

    let matchesRisk = true;
    if (selectedRiskFilter === 'HIGH') matchesRisk = r.disruption_prob >= 0.60;
    else if (selectedRiskFilter === 'MEDIUM') matchesRisk = r.disruption_prob >= 0.35 && r.disruption_prob < 0.60;
    else if (selectedRiskFilter === 'LOW') matchesRisk = r.disruption_prob < 0.35;

    const matchesSearch =
      r.shipment_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cargo_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.corridor_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMode && matchesRisk && matchesSearch;
  });

  // Global KPIs
  const totalShipments = allRows.length;
  const highRiskCount = allRows.filter((r) => r.disruption_prob >= 0.60).length;
  const mediumRiskCount = allRows.filter((r) => r.disruption_prob >= 0.35 && r.disruption_prob < 0.60).length;
  const lowRiskCount = allRows.filter((r) => r.disruption_prob < 0.35).length;
  const avgRiskPct = (
    (allRows.reduce((sum, r) => sum + r.disruption_prob, 0) / (totalShipments || 1)) *
    100
  ).toFixed(1);
  const totalDelayH = allRows.reduce((sum, r) => sum + r.expected_delay_h, 0).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      
      {/* End-to-End Decision Flow Stepper */}
      <DecisionFlowStepper />

      {/* 1. Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={24} style={{ color: '#dc2626' }} />
            <span>TODAY'S SHIPMENT RISK INTELLIGENCE DASHBOARD</span>
          </h1>
          <div className="page-description">
            Live Risk Engine Telemetry Tracking Across All Active Freight Corridors (LAND, RAIL, WATER & AIR)
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 6,
            padding: '6px 12px',
            color: '#15803d',
            fontSize: '0.75rem',
            fontWeight: 800
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <span>RISK ENGINE: CONNECTED & LIVE</span>
          </div>
          <button
            onClick={() => navigate('/command')}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 800, gap: 6 }}
          >
            <Activity size={14} />
            <span>GO TO COMMAND CENTER</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Bar */}
      <div className="grid-4" style={{ gap: 12 }}>
        
        {/* KPI 1 */}
        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 10, color: '#1d4ed8' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              MONITORED SHIPMENTS
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
              {totalShipments} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Today</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, borderColor: highRiskCount > 0 ? '#fecaca' : undefined, backgroundColor: highRiskCount > 0 ? '#fef2f2' : undefined }}>
          <div style={{ backgroundColor: highRiskCount > 0 ? '#fee2e2' : '#f0fdf4', border: '1px solid', borderColor: highRiskCount > 0 ? '#fca5a5' : '#bbf7d0', borderRadius: 8, padding: 10, color: highRiskCount > 0 ? '#dc2626' : '#16a34a' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: highRiskCount > 0 ? '#991b1b' : 'var(--text-muted)', textTransform: 'uppercase' }}>
              HIGH RISK (P ≥ 60%)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: highRiskCount > 0 ? '#dc2626' : '#16a34a' }}>
              {highRiskCount} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Shipments</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: 10, color: '#ea580c' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              AVERAGE CORRIDOR RISK
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: Number(avgRiskPct) >= 50 ? '#dc2626' : '#0f172a' }}>
              {avgRiskPct}% <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>P_disrupt</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: 10, color: '#475569' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              PREDICTED DELAY EXPOSURE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1d4ed8' }}>
              +{totalDelayH} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hours</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2B. FEATURE 1: PREDICTIVE TERRAIN RISK (CURRENT VS FORECAST) */}
      <div className="card" style={{ padding: 18, border: '1px solid #059669', backgroundColor: '#FAFAF9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                PREDICTIVE TERRAIN RISK & ACCESSIBILITY FORECAST (NER CORRIDORS)
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FCD34D',
                  padding: '2px 8px',
                  borderRadius: 9999,
                }}
              >
                PROTOTYPE DATA (IMD AWS & SRTM DEM)
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
              Combines forecast precipitation intensity, slope gradients (42°), and NRSC landslide zonation
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => setRiskWindowTab('CURRENT')}
              style={{
                backgroundColor: riskWindowTab === 'CURRENT' ? '#064E3B' : '#FFFFFF',
                color: riskWindowTab === 'CURRENT' ? '#FFFFFF' : '#475569',
                border: '1px solid #CBD5E1',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              CURRENT ACTIVE HAZARDS ({terrainRisks?.current_risks.length ?? 2})
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setRiskWindowTab('FORECAST')}
              style={{
                backgroundColor: riskWindowTab === 'FORECAST' ? '#064E3B' : '#FFFFFF',
                color: riskWindowTab === 'FORECAST' ? '#FFFFFF' : '#475569',
                border: '1px solid #CBD5E1',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              UPCOMING FORECAST WINDOWS 6h–24h ({terrainRisks?.forecast_risks.length ?? 3})
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12 }}>
          {((riskWindowTab === 'CURRENT' ? terrainRisks?.current_risks : terrainRisks?.forecast_risks) || []).map((risk) => {
            const isCritical = risk.severity === 'CRITICAL';
            const isHigh = risk.severity === 'HIGH';
            const sevColor = isCritical ? '#DC2626' : isHigh ? '#EA580C' : '#2563EB';
            const sevBg = isCritical ? '#FEE2E2' : isHigh ? '#FFEDD5' : '#EFF6FF';

            return (
              <div
                key={risk.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${isCritical ? '#FCA5A5' : '#E2E8F0'}`,
                  borderLeft: `4px solid ${sevColor}`,
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: sevBg,
                        color: sevColor,
                        padding: '2px 6px',
                        borderRadius: 9999,
                      }}
                    >
                      {risk.severity} {risk.risk_type}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                      Window: {risk.time_window.replace('_', ' ')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sevColor }}>
                    Disruption P: {(risk.disruption_probability * 100).toFixed(0)}%
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                  {risk.corridor_name} ({risk.state_name})
                </div>

                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  <strong>Sector:</strong> {risk.affected_segment} · Confidence: <strong>{risk.confidence}</strong>
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    color: '#1E3A8A',
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: 6,
                    padding: '6px 10px',
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Directive:</strong> {risk.recommended_action}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/command')}
                    style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                  >
                    <Compass size={12} />
                    <span>VIEW ON MAP</span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/replan')}
                    style={{ backgroundColor: '#059669', borderColor: '#047857', fontSize: '0.7rem', padding: '3px 8px' }}
                  >
                    <ArrowRight size={12} />
                    <span>EVALUATE REROUTE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Proactive Re-plan Alert Banner (If High Risk Exists) */}
      {highRiskCount > 0 && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: 8, borderRadius: '50%' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#991b1b' }}>
                PROACTIVE REROUTING TRIGGERED FOR {highRiskCount} SHIPMENT(S)
              </strong>
              <div style={{ fontSize: '0.78rem', color: '#7f1d1d', marginTop: 2 }}>
                Risk Engine detected highway landslip probability exceeding 60% threshold. Immediate reroute to Route B or Multimodal IWAI NW-2 recommended.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/action')}
            className="btn btn-danger btn-sm"
            style={{ fontWeight: 800, gap: 6 }}
          >
            <Zap size={14} />
            <span>OPEN ACTION CENTER & APPROVE REROUTE</span>
          </button>
        </div>
      )}

      {/* 4. Controls & Filters Bar */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          
          {/* Mode Selector Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              MODAL FILTER:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['ALL', 'LAND', 'RAIL', 'WATER', 'AIR'].map((m) => {
                const isActive = selectedModeFilter === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedModeFilter(m)}
                    className={`btn ${isActive ? 'btn-blue' : 'btn-secondary'} btn-xs`}
                    style={{ fontWeight: isActive ? 900 : 700, gap: 4 }}
                  >
                    {m === 'LAND' && <Truck size={13} />}
                    {m === 'RAIL' && <Train size={13} />}
                    {m === 'WATER' && <Ship size={13} />}
                    {m === 'AIR' && <Plane size={13} />}
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              RISK SEVERITY:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'ALL', label: 'ALL' },
                { id: 'HIGH', label: 'HIGH RISK (≥60%)' },
                { id: 'MEDIUM', label: 'MEDIUM (35-59%)' },
                { id: 'LOW', label: 'LOW (<35%)' },
              ].map((r) => {
                const isActive = selectedRiskFilter === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRiskFilter(r.id)}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-outline'} btn-xs`}
                    style={{ fontSize: '0.7rem', fontWeight: isActive ? 900 : 700 }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-medium)',
            borderRadius: 6,
            padding: '4px 10px',
            width: 220
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search shipment code / corridor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.75rem',
                color: 'var(--text-main)',
                background: 'transparent'
              }}
            />
          </div>

        </div>
      </div>

      {/* 5. Main Shipment Risk Intelligence Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="card-title">
            <Layers size={16} />
            <span>LIVE SHIPMENT RISK MATRIX & ENGINE BREAKDOWN</span>
          </div>
          <span className="badge badge-info">[{filteredRows.length} OF {allRows.length} DISPLAYED]</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>
                <th style={{ padding: '10px 14px' }}>Shipment</th>
                <th style={{ padding: '10px 14px' }}>Mode & Corridor</th>
                <th style={{ padding: '10px 14px' }}>Cargo & Urgency</th>
                <th style={{ padding: '10px 14px' }}>Disruption Risk (P_disrupt)</th>
                <th style={{ padding: '10px 14px' }}>Engine Breakdown</th>
                <th style={{ padding: '10px 14px' }}>Impact (L_mission / Delay)</th>
                <th style={{ padding: '10px 14px' }}>Recommendation</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => {
                const isHigh = r.disruption_prob >= 0.60;
                const isMedium = r.disruption_prob >= 0.35 && r.disruption_prob < 0.60;
                const isExpanded = expandedShipmentId === r.id;

                return (
                  <React.Fragment key={r.id}>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: isHigh ? '#fff5f5' : isMedium ? '#fffbeb' : '#ffffff',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Shipment Code */}
                      <td style={{ padding: '12px 14px', fontWeight: 900 }}>
                        <div style={{ color: '#1d4ed8', fontSize: '0.85rem' }}>{r.shipment_code}</div>
                        <span className={`badge ${r.status === 'IN_TRANSIT' ? 'badge-info' : r.status === 'DISRUPTED' ? 'badge-critical' : 'badge-neutral'}`} style={{ marginTop: 3 }}>
                          {r.status}
                        </span>
                      </td>

                      {/* Mode & Corridor */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#0f172a' }}>
                          {r.mode === 'LAND' && <Truck size={14} style={{ color: '#1d4ed8' }} />}
                          {r.mode === 'RAIL' && <Train size={14} style={{ color: '#9333ea' }} />}
                          {r.mode === 'WATER' && <Ship size={14} style={{ color: '#0284c7' }} />}
                          {r.mode === 'AIR' && <Plane size={14} style={{ color: '#059669' }} />}
                          <span>[{r.mode}] {r.assigned_route_label}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {r.corridor_name}
                        </div>
                      </td>

                      {/* Cargo & Urgency */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.cargo_type}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Urgency: <strong style={{ color: r.urgency >= 4 ? '#dc2626' : '#0f172a' }}>Level {r.urgency}/5</strong> · {(r.weight_kg / 1000).toFixed(1)} tons
                        </div>
                      </td>

                      {/* Disruption Risk Gauge */}
                      <td style={{ padding: '12px 14px', minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <strong style={{ color: isHigh ? '#dc2626' : isMedium ? '#d97706' : '#16a34a', fontSize: '0.9rem' }}>
                            {(r.disruption_prob * 100).toFixed(1)}%
                          </strong>
                          <span className={`badge ${isHigh ? 'badge-critical' : isMedium ? 'badge-warning' : 'badge-success'}`}>
                            {isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW'}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${r.disruption_prob * 100}%`,
                              height: '100%',
                              backgroundColor: isHigh ? '#dc2626' : isMedium ? '#f59e0b' : '#16a34a',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </td>

                      {/* Engine Breakdown Metrics */}
                      <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <div>Rain: <strong>{r.rainfall_intensity_mmh} mm/h</strong> (24h: {r.cumulative_24h_mm}mm)</div>
                        <div>Slope: <strong>{(r.slope_factor * 100).toFixed(0)}%</strong> · Vuln: <strong>{(r.vulnerability_score * 100).toFixed(0)}%</strong></div>
                      </td>

                      {/* Impact Score & Delay */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>
                          Score: <span style={{ color: isHigh ? '#dc2626' : '#1d4ed8' }}>{r.mission_score} pts</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isHigh ? '#dc2626' : 'var(--text-muted)', fontWeight: isHigh ? 700 : 500 }}>
                          Delay: +{r.expected_delay_h} hrs
                        </div>
                      </td>

                      {/* Recommendation */}
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${r.recommendation_action === 'REROUTE' ? 'badge-critical' : r.recommendation_action === 'REVIEW' ? 'badge-warning' : 'badge-success'}`}>
                          {r.recommendation_action}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setExpandedShipmentId(isExpanded ? null : r.id)}
                            className="btn btn-outline btn-xs"
                            style={{ fontSize: '0.68rem' }}
                          >
                            {isExpanded ? 'Hide Math' : 'Inspect Math'}
                          </button>
                          <button
                            onClick={() => {
                              selectShipment(r.id);
                              navigate('/command');
                            }}
                            className="btn btn-blue btn-xs"
                            style={{ fontSize: '0.68rem', gap: 4 }}
                          >
                            <span>Monitor</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Mathematical Formula Inspect Row */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-medium)' }}>
                        <td colSpan={8} style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1d4ed8', fontWeight: 800 }}>
                              <Zap size={14} />
                              <span>RISK ENGINE MATHEMATICAL EVALUATION FOR {r.shipment_code}</span>
                            </div>

                            {/* Mathematical Breakdown Box */}
                            <div className="grid-3" style={{ gap: 10 }}>
                              <div className="card" style={{ padding: 10, backgroundColor: '#ffffff' }}>
                                <strong style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DERIVED DISRUPTION PROBABILITY:</strong>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                                  P_disrupt = 0.35(I_norm) + 0.25(C_norm) + 0.15(Slope) + 0.15(Hist) + 0.10(Vuln)
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: 4 }}>
                                  Calculated Value: {r.disruption_prob} ({(r.disruption_prob * 100).toFixed(1)}%)
                                </div>
                              </div>

                              <div className="card" style={{ padding: 10, backgroundColor: '#ffffff' }}>
                                <strong style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LOGISTICS IMPACT SCORE:</strong>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                                  L_mission = T_base × 10 + P × D_expected × 8 + (Urgency / 5) × P × 15
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 700, marginTop: 4 }}>
                                  Calculated Loss: {r.mission_score} Mission Score Points
                                </div>
                              </div>

                              <div className="card" style={{ padding: 10, backgroundColor: '#ffffff' }}>
                                <strong style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DATA SOURCE CLASSIFICATION:</strong>
                                <div style={{ fontSize: '0.72rem', marginTop: 4 }}>
                                  • Slope & History: <span className="data-tag data-tag-real">REAL (SRTM/NRSC)</span><br />
                                  • Rainfall Input: <span className="data-tag data-tag-simulated">IMD AWS TELEMETRY</span><br />
                                  • Score & Action: <span className="data-tag data-tag-derived">DERIVED ENGINE OUTPUT</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Multi-Modal Corridor Trade-off Comparison Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Compass size={16} />
            <span>CORRIDOR-LEVEL RISK COMPARISON MATRIX (TODAY'S AVAILABLE WAYS)</span>
          </div>
          <span className="data-tag data-tag-real">REAL-TIME COMPARATIVE ASSESSMENT</span>
        </div>

        <div className="grid-3" style={{ gap: 12, marginTop: 10 }}>
          
          {/* Corridor 1: Route A */}
          <div className="card" style={{ backgroundColor: 'var(--bg-panel)', padding: 12, borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className="badge badge-critical">[ROAD] ROUTE A (NH-6)</span>
              <strong style={{ color: '#dc2626', fontSize: '0.85rem' }}>78.0% RISK</strong>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', marginBottom: 4 }}>
              Guwahati → Shillong Highway Pass
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Km 51 Umiam slope active landslip risk under intense precipitation.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
              <span>Expected Delay: <strong style={{ color: '#dc2626' }}>+9.36 hrs</strong></span>
              <span>Score: <strong>168.4 pts</strong></span>
            </div>
          </div>

          {/* Corridor 2: Route B */}
          <div className="card" style={{ backgroundColor: 'var(--bg-panel)', padding: 12, borderColor: '#bbf7d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className="badge badge-success">[ROAD] ROUTE B (NH-27)</span>
              <strong style={{ color: '#16a34a', fontSize: '0.85rem' }}>18.0% RISK</strong>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', marginBottom: 4 }}>
              Guwahati → Nagaon → Haflong Bypass
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Gentler terrain, low landslide risk. Primary recommended highway bypass.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
              <span>Expected Delay: <strong style={{ color: '#16a34a' }}>+2.16 hrs</strong></span>
              <span>Score: <strong>94.2 pts</strong></span>
            </div>
          </div>

          {/* Corridor 3: Inland Waterway NW-2 */}
          <div className="card" style={{ backgroundColor: 'var(--bg-panel)', padding: 12, borderColor: '#bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className="badge badge-info">[WATER] IWAI NW-2</span>
              <strong style={{ color: '#1d4ed8', fontSize: '0.85rem' }}>12.0% RISK</strong>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', marginBottom: 4 }}>
              Pandu Port ↔ Jogighopa MMLP Passage
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Brahmaputra river barge passage. Completely immune to highway mountain landslips.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
              <span>Expected Delay: <strong style={{ color: '#1d4ed8' }}>+1.44 hrs</strong></span>
              <span>Score: <strong>81.5 pts</strong></span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
