import React, { useState, useEffect } from 'react';
import { TransportMode } from '../types';
import { MultimodalMapView } from '../components/Map/MultimodalMapView';
import { multimodalSimulationService, VehicleTelemetry } from '../services/multimodalSimulationService';
import { TERMINALS_BY_MODE, HAZARDS_BY_MODE, MODE_METADATA, JOGIGHOPA_MULTIMODAL_JOURNEY } from '../services/multimodalDataService';
import {
  Truck,
  Train,
  Ship,
  Plane,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Activity,
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';

export function MultimodalOperations() {
  const [activeMode, setActiveMode] = useState<TransportMode>('LAND');
  const [activeSpeed, setActiveSpeed] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<VehicleTelemetry>(
    multimodalSimulationService.getModeTelemetry('LAND')
  );
  const [showJogighopaModal, setShowJogighopaModal] = useState<boolean>(false);

  // Subscribe to simulation updates
  useEffect(() => {
    const unsubscribe = multimodalSimulationService.subscribe((allTelem) => {
      if (allTelem[activeMode]) {
        setTelemetry(allTelem[activeMode]);
      }
    });
    return () => unsubscribe();
  }, [activeMode]);

  const handleModeChange = (mode: TransportMode) => {
    setActiveMode(mode);
    setTelemetry(multimodalSimulationService.getModeTelemetry(mode));
  };

  const handleSpeedChange = (speed: number) => {
    setActiveSpeed(speed);
    multimodalSimulationService.setSpeedMultiplier(activeMode, speed);
  };

  const handleStartSim = () => {
    multimodalSimulationService.startModeSimulation(activeMode);
  };

  const handlePauseSim = () => {
    multimodalSimulationService.pauseModeSimulation(activeMode);
  };

  const handleResetSim = () => {
    multimodalSimulationService.resetModeSimulation(activeMode);
    setActiveSpeed(1);
  };

  const modeMeta = MODE_METADATA[activeMode];
  const terminals = TERMINALS_BY_MODE[activeMode] || [];
  const hazards = HAZARDS_BY_MODE[activeMode] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span className="data-tag data-tag-real">PM GATISHAKTI & ULIP COMPATIBLE</span>
            <span className={`data-tag data-tag-${getDataTagType(modeMeta.dataStatus)}`}>
              STATUS: {modeMeta.dataStatus}
            </span>
          </div>
          <h1 className="page-title">MULTIMODAL TRANSPORT INTELLIGENCE & OPERATIONS</h1>
          <div className="page-description">
            Operational Control Room: Independent Land, Rail, Water, and Air Corridor Surveillance & Simulation
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowJogighopaModal(true)}
          style={{ gap: 8, fontWeight: 800, backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' }}
        >
          <Zap size={16} />
          <span>ASSAM JOGIGHOPA MMLP DEMO</span>
        </button>
      </div>

      {/* 1. Transport Mode Tab Switcher */}
      <div
        className="card"
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['LAND', 'RAIL', 'WATER', 'AIR'] as TransportMode[]).map((mode) => {
            const isSelected = activeMode === mode;
            const meta = MODE_METADATA[mode];
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: isSelected ? getModeColor(mode) : 'var(--border-medium)',
                  backgroundColor: isSelected ? getModeBgColor(mode) : 'var(--bg-panel)',
                  color: isSelected ? getModeColor(mode) : 'var(--text-secondary)',
                  fontWeight: isSelected ? 900 : 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {getModeIcon(mode)}
                <span>[{mode}] {meta.label.split('/')[0]}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={14} style={{ color: getModeColor(activeMode) }} />
          <span>Selected Corridor: <strong>{modeMeta.coverageRegion}</strong> ({modeMeta.totalNetworkKm} km)</span>
        </div>
      </div>

      {/* 2. Main Operational View Grid: Map + Side Control Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, minHeight: 520 }}>
        {/* Map Display */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 550, position: 'relative' }}>
          <MultimodalMapView activeMode={activeMode} />
        </div>

        {/* Side Panel: Simulation Controls & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Simulation Controls Card */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 8, marginBottom: 8 }}>
              <div className="card-title" style={{ fontSize: '0.85rem' }}>
                <FastForward size={16} style={{ color: getModeColor(activeMode) }} />
                <span>SIMULATION SPEED CONTROLS</span>
              </div>
              <span className="badge badge-info">[{telemetry.status}]</span>
            </div>

            {/* Play/Pause/Reset Action Buttons */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <button
                className="btn btn-success btn-sm"
                onClick={handleStartSim}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Play size={14} />
                <span>START</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePauseSim}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Pause size={14} />
                <span>PAUSE</span>
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={handleResetSim}
                style={{ justifyContent: 'center', padding: '0 10px' }}
                title="Reset Simulation"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* 6 Speed Multipliers (1x, 5x, 10x, 20x, 50x, 100x) */}
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
              SPEED MULTIPLIER:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {[1, 5, 10, 20, 50, 100].map((spd) => {
                const isActive = activeSpeed === spd;
                return (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    style={{
                      border: '1px solid',
                      borderColor: isActive ? getModeColor(activeMode) : 'var(--border-medium)',
                      backgroundColor: isActive ? getModeColor(activeMode) : 'var(--bg-panel)',
                      color: isActive ? '#ffffff' : 'var(--text-main)',
                      fontWeight: isActive ? 900 : 700,
                      fontSize: '0.72rem',
                      padding: '6px 0',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      textAlign: 'center',
                    }}
                  >
                    {spd}x
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Telemetry Monitor Card */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header" style={{ paddingBottom: 6, marginBottom: 8 }}>
              <div className="card-title" style={{ fontSize: '0.85rem' }}>
                <Activity size={16} />
                <span>ACTIVE {activeMode} TELEMETRY</span>
              </div>
              <span className={`data-tag data-tag-${getDataTagType(telemetry.dataStatus)}`} style={{ fontSize: '0.62rem' }}>
                {telemetry.dataStatus}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
              <div style={{ backgroundColor: 'var(--bg-panel)', padding: 8, borderRadius: 4 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>VEHICLE / VESSEL NAME</div>
                <strong style={{ color: 'var(--primary-navy)', fontSize: '0.82rem' }}>{telemetry.vehicleName}</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {telemetry.vehicleId}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ backgroundColor: 'var(--bg-panel)', padding: 8, borderRadius: 4 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CURRENT SPEED</div>
                  <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>{telemetry.speedKmh} km/h</strong>
                </div>

                <div style={{ backgroundColor: 'var(--bg-panel)', padding: 8, borderRadius: 4 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PROGRESS</div>
                  <strong style={{ color: '#1d4ed8', fontSize: '0.95rem' }}>{telemetry.progressPct}%</strong>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-panel)', padding: 8, borderRadius: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DISTANCE COVERED:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{telemetry.distanceCoveredKm} / {telemetry.distanceTotalKm} km</strong>
                </div>
                <div style={{ width: '100%', height: 6, backgroundColor: 'var(--border-medium)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${telemetry.progressPct}%`,
                      height: '100%',
                      backgroundColor: getModeColor(activeMode),
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: 8, borderRadius: 4, color: '#1e40af' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>ESTIMATED TIME OF ARRIVAL</div>
                <strong style={{ fontSize: '0.9rem' }}>{telemetry.eta}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Terminals & Active Hazards Grid */}
      <div className="grid-2">
        {/* Terminals List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building2 size={15} style={{ color: getModeColor(activeMode) }} />
              <span>{activeMode} TERMINALS & FREIGHT HUBS ({terminals.length})</span>
            </div>
            <span className="data-tag data-tag-real">INFRASTRUCTURE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {terminals.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--primary-navy)' }}>{t.name}</strong> ({t.code})<br />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location: {t.city}, {t.state}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${t.operationalStatus === 'OPERATIONAL' ? 'badge-success' : 'badge-amber'}`}>
                    [{t.operationalStatus}]
                  </span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Capacity: {t.capacityPct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hazards & Disruption List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={15} style={{ color: '#dc2626' }} />
              <span>{activeMode} NETWORK DISRUPTIONS & HAZARDS ({hazards.length})</span>
            </div>
            <span className="data-tag data-tag-simulated">ALERT MONITOR</span>
          </div>

          {hazards.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hazards.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <strong style={{ color: '#dc2626' }}>{h.title}</strong>
                    <span className="badge badge-critical">[{h.severity} SEVERITY]</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7f1d1d' }}>{h.description}</div>
                  <div style={{ fontSize: '0.68rem', color: '#991b1b', marginTop: 2 }}>Affected: {h.affectedRoute}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', backgroundColor: 'var(--bg-panel)', borderRadius: 6 }}>
              No critical active hazards reported on {activeMode} network.
            </div>
          )}
        </div>
      </div>

      {/* 4. Assam / Jogighopa Multimodal Demo Modal */}
      {showJogighopaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              width: '100%',
              maxWidth: 720,
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid #cbd5e1',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={22} style={{ color: '#1d4ed8' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    ASSAM JOGIGHOPA MMLP MULTIMODAL DEMONSTRATION
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Multi-Leg Corridor Journey: Guwahati → Jogighopa MMLP → Pandu River Port → Shillong
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowJogighopaModal(false)}
                style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.8rem' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: 12, borderRadius: 6, border: '1px solid #bfdbfe', color: '#1e40af' }}>
                <strong>Multimodal Transfer Strategy:</strong> Combines Road transport from Guwahati to Jogighopa MMLP, Inland Waterway (NW-2 Brahmaputra) barge transport to Pandu Port, and final Land feeder leg to Shillong Hub to bypass NH-6 monsoon landslip sector.
              </div>

              <div style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                JOURNEY LEGS BREAKDOWN:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {JOGIGHOPA_MULTIMODAL_JOURNEY.legs.map((leg) => (
                  <div
                    key={leg.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      backgroundColor: leg.status === 'ACTIVE' ? '#f0fdf4' : leg.status === 'COMPLETED' ? '#eff6ff' : '#f8fafc',
                      border: `1px solid ${leg.status === 'ACTIVE' ? '#bbf7d0' : '#e2e8f0'}`,
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          backgroundColor: getModeColor(leg.mode),
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                        }}
                      >
                        {getModeIcon(leg.mode)}
                      </div>
                      <div>
                        <strong>LEG {leg.leg_number}: [{leg.mode}] {leg.origin} → {leg.destination}</strong><br />
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Vehicle: {leg.vehicle_name} ({leg.distance_km} km)</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${leg.status === 'ACTIVE' ? 'badge-success' : leg.status === 'COMPLETED' ? 'badge-info' : 'badge-neutral'}`}>
                        [{leg.status}]
                      </span>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                        ETA: {leg.estimated_arrival}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button className="btn btn-secondary" onClick={() => setShowJogighopaModal(false)}>
                  CLOSE PREVIEW
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowJogighopaModal(false);
                    handleModeChange('WATER');
                    handleStartSim();
                  }}
                  style={{ backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' }}
                >
                  <Play size={14} />
                  <span>LAUNCH WATER LEG SIMULATION</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function getModeColor(mode: TransportMode): string {
  switch (mode) {
    case 'LAND':
      return '#1d4ed8';
    case 'RAIL':
      return '#7e22ce';
    case 'WATER':
      return '#0284c7';
    case 'AIR':
      return '#059669';
  }
}

function getModeBgColor(mode: TransportMode): string {
  switch (mode) {
    case 'LAND':
      return '#eff6ff';
    case 'RAIL':
      return '#faf5ff';
    case 'WATER':
      return '#f0f9ff';
    case 'AIR':
      return '#ecfdf5';
  }
}

function getModeIcon(mode: TransportMode) {
  switch (mode) {
    case 'LAND':
      return <Truck size={14} />;
    case 'RAIL':
      return <Train size={14} />;
    case 'WATER':
      return <Ship size={14} />;
    case 'AIR':
      return <Plane size={14} />;
  }
}

function getDataTagType(dataStatus: string): string {
  switch (dataStatus) {
    case 'CONNECTED':
      return 'real';
    case 'STATIC_DATA':
      return 'derived';
    case 'SIMULATION':
      return 'simulated';
    default:
      return 'neutral';
  }
}
