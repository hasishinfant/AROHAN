import React, { useState, useEffect } from 'react';
import { MapView } from '../components/Map/MapView';
import { RiskGauge } from '../components/RiskGauge';
import { EventTimeline } from '../components/EventTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { useArohanStore } from '../stores/arohanStore';
import { useNavigate } from 'react-router-dom';
import { gpsSimulationService } from '../services/gpsSimulationService';
import {
  Clock,
  Radio,
  ArrowRight,
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
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Gauge,
  Compass,
  AlertTriangle
} from 'lucide-react';

export function CommandCenter() {
  const {
    shipment,
    shipmentsList,
    selectedShipmentId,
    selectShipment,
    risk_results,
    current_decision,
    events,
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
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [showDemoControls, setShowDemoControls] = useState<boolean>(false);

  // Live clock tick
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

  // Interactive Quick Action Handlers
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      
      {/* 1. LEVEL 2: SECONDARY MISSION PAGE HEADER (70-80px tall, clean & non-redundant) */}
      <div className="card" style={{ padding: '12px 20px', backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              COMMAND CENTER
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8' }}>
                Current Mission · {currentShipment?.shipment_code || 'SHP-002'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                Monitor active shipment movement, corridor risk and rerouting decisions.
              </span>
            </div>
          </div>

          {/* Right Status Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800, color: isConnected ? '#15803d' : '#dc2626', background: isConnected ? '#f0fdf4' : '#fef2f2', padding: '5px 10px', borderRadius: 6, border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}` }}>
              <span style={{ width: 7, height: 7, backgroundColor: isConnected ? '#16a34a' : '#dc2626', borderRadius: '50%' }} />
              <span>{isConnected ? 'TELEMETRY ACTIVE' : 'OFFLINE SIMULATION'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', padding: '5px 10px', borderRadius: 6, border: '1px solid #bfdbfe', fontFamily: 'monospace' }}>
              <Clock size={13} />
              <span>{currentTime} IST</span>
            </div>

            <button
              type="button"
              onClick={() => setAudioAlerts(!audioAlerts)}
              style={{
                border: '1px solid #cbd5e1',
                backgroundColor: audioAlerts ? '#ffffff' : '#f8fafc',
                color: audioAlerts ? '#1d4ed8' : '#64748b',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '5px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              {audioAlerts ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{audioAlerts ? 'AUDIO ON' : 'MUTED'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDemoControls(!showDemoControls)}
              style={{
                border: '1px solid #1d4ed8',
                backgroundColor: showDemoControls ? '#1d4ed8' : '#eff6ff',
                color: showDemoControls ? '#ffffff' : '#1d4ed8',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '5px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Sliders size={13} />
              <span>DEMO CONTROLS</span>
              {showDemoControls ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Quick Multimodal Transport Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              OPERATIONAL TRANSPORT MODE:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => navigate('/command')} className="btn btn-blue btn-xs" style={{ fontWeight: 900, padding: '3px 8px', fontSize: '0.7rem' }}>
                [ LAND ]
              </button>
              <button onClick={() => navigate('/multimodal')} className="btn btn-secondary btn-xs" style={{ fontWeight: 700, padding: '3px 8px', fontSize: '0.7rem' }}>
                [ RAIL ]
              </button>
              <button onClick={() => navigate('/multimodal')} className="btn btn-secondary btn-xs" style={{ fontWeight: 700, padding: '3px 8px', fontSize: '0.7rem' }}>
                [ WATER ]
              </button>
              <button onClick={() => navigate('/multimodal')} className="btn btn-secondary btn-xs" style={{ fontWeight: 700, padding: '3px 8px', fontSize: '0.7rem' }}>
                [ AIR ]
              </button>
            </div>
          </div>
          <button onClick={() => navigate('/multimodal')} className="btn btn-outline btn-xs" style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', borderColor: '#bfdbfe' }}>
            OPEN MULTIMODAL OPERATIONS CENTER →
          </button>
        </div>
      </div>

      {/* 8 TELEMETRY METRIC STRIP CARDS MATCHING MOCK UI SCREENSHOT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
        {/* Card 1: Active Mission */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#f0fdf4', color: '#16a34a', flexShrink: 0 }}>
            <Truck size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Active Mission</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentShipment?.shipment_code || 'SHP-001'} (Medical)</div>
          </div>
        </div>

        {/* Card 2: Current Status */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#f0fdf4', color: '#16a34a', flexShrink: 0 }}>
            <Activity size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Current Status</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#16a34a' }}>In Transit</div>
          </div>
        </div>

        {/* Card 3: Vehicle */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#f8fafc', color: '#1d4ed8', flexShrink: 0 }}>
            <Truck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Vehicle</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0f172a' }}>TRK-001</div>
          </div>
        </div>

        {/* Card 4: Current Speed */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#f0fdf4', color: '#059669', flexShrink: 0 }}>
            <Gauge size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Current Speed</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0f172a' }}>{gpsUpdate?.speed_kmh || 60} km/h</div>
          </div>
        </div>

        {/* Card 5: Next Checkpoint */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#f0fdf4', color: '#16a34a', flexShrink: 0 }}>
            <MapPin size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Next Checkpoint</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Umiam (30.4 km)</div>
          </div>
        </div>

        {/* Card 6: Risk Level */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#fef3c7', color: '#b45309', flexShrink: 0 }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>Risk Level</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#b45309' }}>{gpsUpdate?.current_risk_level || 'Moderate'}</div>
          </div>
        </div>

        {/* Card 7: ETA */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderColor: '#fecaca', backgroundColor: '#fff5f5' }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#fee2e2', color: '#dc2626', flexShrink: 0 }}>
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>ETA</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#dc2626' }}>{currentShipment?.updated_eta || '13:12'}</div>
          </div>
        </div>

        {/* Card 8: Corridor Clear */}
        <div className="card" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 6, borderRadius: 6, backgroundColor: '#f0fdf4', color: '#16a34a', flexShrink: 0 }}>
            <Shield size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Corridor Clear</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#16a34a' }}>30.4 km</div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE DEMO CONTROLS PANEL */}
      {showDemoControls && (
        <div className="card" style={{ padding: '12px 18px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} style={{ color: '#38bdf8' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DEMO SCENARIO SIMULATION CONTROLS</strong>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Trigger hazards, evaluate ML risk, execute dynamic bypass, or reset simulation.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSimulateDisruption}
                className="btn btn-sm"
                style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6 }}
              >
                <CloudRain size={13} />
                <span>TRIGGER DISRUPTION (STEP {step < 0 ? 1 : step + 1})</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerReroute}
                className="btn btn-sm"
                style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6 }}
              >
                <Zap size={13} />
                <span>EXECUTE INSTANT REROUTE (ROUTE B)</span>
              </button>

              <button
                type="button"
                onClick={() => gpsSimulationService.setSpeedMultiplier(50)}
                className="btn btn-sm"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '0.72rem', fontWeight: 800, borderRadius: 6 }}
              >
                <span>SPEED 50×</span>
              </button>

              <button
                type="button"
                onClick={handleResetSimulation}
                className="btn btn-sm"
                style={{ backgroundColor: '#475569', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6 }}
              >
                <RotateCcw size={13} />
                <span>RESET SIMULATION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRIMARY MAIN GIS MAP (LEVEL 1 VISUAL FOCUS - 55-65% ATTENTION) */}
      <div className="card" style={{ padding: 12, borderRadius: 8, height: 520, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={15} style={{ color: '#1d4ed8' }} />
            <strong style={{ fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              PRIMARY GIS CORRIDOR MONITORING DISPLAY — {currentShipment?.shipment_code}
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#64748b' }}>
            <span>Origin: <strong>{currentShipment?.origin.split(' ')[0]}</strong></span>
            <span>→</span>
            <span>Destination: <strong>{currentShipment?.destination.split(' ')[0]}</strong></span>
          </div>
        </div>
        <div style={{ flex: 1, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
          <MapView />
        </div>
      </div>

      {/* 3. LEVEL 2: JOURNEY STATUS & RISK ASSESSMENT (SIDE-BY-SIDE CARDS BELOW MAP) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        
        {/* LEFT CARD: ACTIVE MISSION TELEMETRY SUMMARY */}
        <div className="card" style={{ borderRadius: 8, padding: 16, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={16} style={{ color: '#1d4ed8' }} />
                <strong style={{ fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase' }}>
                  ACTIVE MISSION TELEMETRY ({currentShipment?.shipment_code})
                </strong>
              </div>
              {currentShipment && <StatusBadge status={gpsUpdate?.simulated_status || currentShipment.status} />}
            </div>

            {currentShipment ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Cargo & Truck ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>CARGO MANIFEST</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{currentShipment.cargo_type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>URGENCY LEVEL</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: currentShipment.urgency >= 4 ? '#dc2626' : '#b45309' }}>
                      Level {currentShipment.urgency}/5
                    </div>
                  </div>
                </div>

                {/* Live Progress Bar */}
                {gpsUpdate && gpsUpdate.shipmentId === currentShipment.id && (
                  <div style={{ backgroundColor: '#f8fafc', padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: 4 }}>
                      <span>JOURNEY PROGRESS ({gpsUpdate.simulated_status})</span>
                      <span style={{ color: '#1d4ed8' }}>{gpsUpdate.progress_pct}% ({gpsUpdate.distance_covered_km} / {gpsUpdate.total_distance_km} km)</span>
                    </div>
                    <div style={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${gpsUpdate.progress_pct}%`, height: '100%', backgroundColor: gpsUpdate.progress_pct >= 100 ? '#16a34a' : '#2563eb', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
                      <span>Speed: <strong>{gpsUpdate.speed_kmh} km/h ({gpsUpdate.heading_cardinal})</strong></span>
                      <span>ETA: <strong>{gpsUpdate.eta_formatted}</strong></span>
                    </div>
                  </div>
                )}

                {/* Corridor Origin -> Destination Box */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 10, border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ORIGIN HUB</div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentShipment.origin}</div>
                  </div>
                  <ArrowRight size={16} style={{ color: '#94a3b8' }} />
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DESTINATION HUB</div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentShipment.destination}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>PAYLOAD WEIGHT</div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentShipment.weight_kg} kg</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Footer Callout */}
          {current_decision && current_decision.status === 'PENDING' && (selectedShipmentId === 1) ? (
            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: 10, marginTop: 10, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7c2d12' }}>
                🚨 Reroute Action Recommended (Route B — Sonapur Bypass)
              </div>
              <button type="button" className="btn btn-success btn-sm" onClick={() => approveDecision(current_decision.id)}>
                APPROVE REROUTE
              </button>
            </div>
          ) : null}
        </div>

        {/* RIGHT CARD: PROACTIVE RISK ASSESSMENT & DECISION ENGINE SUMMARY */}
        <div className="card" style={{ borderRadius: 8, padding: 16, justifyContent: 'space-between', borderLeft: '4px solid #1d4ed8' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} style={{ color: '#1d4ed8' }} />
                <strong style={{ fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase' }}>
                  AROHAN RISK & DECISION ENGINE
                </strong>
              </div>
              <span className="data-tag data-tag-derived">DERIVED ML RISK</span>
            </div>

            {step >= 2 && riskA ? (
              <div style={{ cursor: 'pointer' }} onClick={() => setShowRiskModal(true)}>
                <RiskGauge
                  probability={riskA.disruption_probability}
                  confidence={riskA.confidence}
                  label={`${currentShipment?.shipment_code || 'Corridor'} Risk Assessment`}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>OVERALL RISK ASSESSMENT</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: gpsUpdate?.current_risk_level === 'HIGH' ? '#dc2626' : '#b45309', marginTop: 2 }}>
                      {gpsUpdate?.current_risk_level || 'MEDIUM'} (72% Exposure)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ML CONFIDENCE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16a34a', marginTop: 2 }}>HIGH (92%)</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ backgroundColor: '#ffffff', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>EXPECTED DELAY AVOIDED</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', marginTop: 2 }}>
                      {kpis?.delay_avoided_h != null ? `${kpis.delay_avoided_h} hrs` : '5.9 hrs'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>RISK EXPOSURE REDUCTION</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', marginTop: 2 }}>
                      {kpis?.risk_exposure_reduced_pct != null ? `-${kpis.risk_exposure_reduced_pct}%` : '-21%'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#475569', background: '#eff6ff', padding: 8, borderRadius: 6, border: '1px solid #bfdbfe' }}>
                  <strong>Recommended Active Action:</strong> Route B (Sonapur Ridge Bypass). Bypasses Umiam landslide sector and reduces delay by 5.9 hrs.
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setShowRiskModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.72rem', color: '#1e40af', borderColor: '#bfdbfe', fontWeight: 800 }}
            >
              VIEW DETAILED ML RISK BREAKDOWN
            </button>
          </div>
        </div>
      </div>

      {/* 4. LEVEL 3: TODAY'S OPERATIONS & ACTIVE SHIPMENTS TABLE */}
      <div className="card" style={{ borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} style={{ color: '#0f172a' }} />
            <strong style={{ fontSize: '0.88rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TODAY'S OPERATIONS — ACTIVE FREIGHT CORRIDORS ({filteredShipments.length} OF {shipmentsList?.length || 6})
            </strong>
          </div>

          {/* Search Box & Status Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search shipment, route, cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 10px 5px 30px',
                  fontSize: '0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  outline: 'none'
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
                    borderColor: statusFilter === st ? '#1d4ed8' : '#cbd5e1',
                    backgroundColor: statusFilter === st ? '#1e40af' : '#ffffff',
                    color: statusFilter === st ? '#ffffff' : '#475569',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Structured Professional Operations Table */}
        <div className="table-container">
          <table className="table" style={{ fontSize: '0.78rem' }}>
            <thead>
              <tr>
                <th style={{ width: '12%' }}>SHIPMENT</th>
                <th style={{ width: '28%' }}>ROUTE / CORRIDOR</th>
                <th style={{ width: '22%' }}>CARGO MANIFEST</th>
                <th style={{ width: '10%' }}>TRUCK ID</th>
                <th style={{ width: '12%' }}>STATUS</th>
                <th style={{ width: '8%' }}>RISK</th>
                <th style={{ width: '8%' }}>ETA</th>
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
                      backgroundColor: isSelected ? '#eff6ff' : undefined,
                      borderLeft: isSelected ? '4px solid #1d4ed8' : '4px solid transparent',
                      fontWeight: isSelected ? 700 : 400
                    }}
                  >
                    <td>
                      <strong style={{ color: isSelected ? '#1e40af' : '#0f172a' }}>{s.shipment_code}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
                        <span>{s.origin.split(' ')[0]}</span>
                        <ArrowRight size={12} style={{ color: '#94a3b8' }} />
                        <span>{s.destination.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{s.cargo_type}</td>
                    <td>
                      <code style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 5px', borderRadius: 4, color: '#0f172a' }}>
                        TRK-00{s.id}
                      </code>
                    </td>
                    <td>
                      <StatusBadge status={activeGps?.simulated_status || s.status} />
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4,
                        color: s.urgency >= 5 || s.status === 'DISRUPTED' ? '#dc2626' : s.urgency === 4 ? '#b45309' : '#15803d',
                        backgroundColor: s.urgency >= 5 || s.status === 'DISRUPTED' ? '#fef2f2' : s.urgency === 4 ? '#fffbeb' : '#f0fdf4',
                        border: `1px solid ${s.urgency >= 5 || s.status === 'DISRUPTED' ? '#fecaca' : s.urgency === 4 ? '#fde68a' : '#bbf7d0'}`
                      }}>
                        {s.urgency >= 5 || s.status === 'DISRUPTED' ? 'HIGH' : s.urgency === 4 ? 'MEDIUM' : 'LOW'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      {activeGps?.eta_formatted || (s.updated_eta || s.planned_eta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INTERACTIVE RISK BREAKDOWN MODAL */}
      {showRiskModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            width: '100%',
            maxWidth: 560,
            padding: 20,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-medium)',
            fontFamily: 'Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={20} style={{ color: '#1d4ed8' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    AI RISK & VULNERABILITY BREAKDOWN
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Corridor: {currentShipment?.shipment_code} ({currentShipment?.origin.split(' ')[0]} → {currentShipment?.destination.split(' ')[0]})
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowRiskModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ backgroundColor: '#eff6ff', padding: 10, borderRadius: 6, border: '1px solid #bfdbfe', fontSize: '0.75rem', color: '#1e40af' }}>
                <strong>ML Confidence Index: 92%</strong> — Derived from live IMD rainfall radar grids, slope gradient maps, and soil saturation sensors.
              </div>

              {/* Factors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>
                    <span>Precipitation Rate (IMD Radar)</span>
                    <span style={{ color: '#dc2626' }}>82 mm/hr (Heavy Rainfall)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '82%', height: '100%', backgroundColor: '#dc2626' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>
                    <span>Slope Incline Vulnerability</span>
                    <span style={{ color: '#ea580c' }}>42° Steep Mountain Sector</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '74%', height: '100%', backgroundColor: '#ea580c' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>
                    <span>Soil Saturation Index</span>
                    <span style={{ color: '#dc2626' }}>94% Saturation (Near Mudslide Risk)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', backgroundColor: '#dc2626' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>
                    <span>Pavement Health Index</span>
                    <span style={{ color: '#16a34a' }}>Level 4 (Moderate Wear)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '100%', backgroundColor: '#16a34a' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  handleTriggerReroute();
                  setShowRiskModal(false);
                }}
                className="btn btn-sm btn-blue"
                style={{ backgroundColor: '#16a34a', borderColor: '#15803d', fontWeight: 800 }}
              >
                <Zap size={13} />
                <span>EXECUTE ROUTE B BYPASS</span>
              </button>
              <button type="button" onClick={() => setShowRiskModal(false)} className="btn btn-sm btn-secondary">
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
