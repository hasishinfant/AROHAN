import React, { useState, useEffect } from 'react';
import { MultimodalMapView } from '../components/Map/MultimodalMapView';
import { TransportMode } from '../types/multimodalTypes';
import { MULTIMODAL_NETWORKS, JOGIGHOPA_MULTIMODAL_DEMO } from '../config/multimodalRoutes';
import { multimodalSimulationService, MultimodalGPSUpdate } from '../services/multimodalSimulationService';
import {
  Truck,
  Train,
  Ship,
  Plane,
  Play,
  Pause,
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  ArrowRight,
  Activity,
  Layers,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';

export function MultimodalOperations() {
  const [activeMode, setActiveMode] = useState<TransportMode>('LAND');
  const [gpsUpdate, setGpsUpdate] = useState<MultimodalGPSUpdate | null>(
    multimodalSimulationService.getLastUpdate('LAND')
  );
  const [simSpeed, setSimSpeed] = useState<number>(
    multimodalSimulationService.getSpeedMultiplier()
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(
    multimodalSimulationService.isSimulating()
  );

  useEffect(() => {
    multimodalSimulationService.setMode(activeMode);
    const unsubscribe = multimodalSimulationService.subscribe((update) => {
      if (update.mode === activeMode) {
        setGpsUpdate(update);
        setIsSimulating(multimodalSimulationService.isSimulating());
      }
    });
    return () => unsubscribe();
  }, [activeMode]);

  const handleModeChange = (mode: TransportMode) => {
    setActiveMode(mode);
  };

  const handleSpeedChange = (multiplier: number) => {
    multimodalSimulationService.setSpeedMultiplier(multiplier);
    setSimSpeed(multiplier);
  };

  const handleStart = () => {
    multimodalSimulationService.start();
    setIsSimulating(true);
  };

  const handlePause = () => {
    multimodalSimulationService.pause();
    setIsSimulating(false);
  };

  const handleReset = () => {
    multimodalSimulationService.reset(activeMode);
    setIsSimulating(false);
  };

  const config = MULTIMODAL_NETWORKS[activeMode] || MULTIMODAL_NETWORKS.LAND;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">MULTIMODAL LOGISTICS OPERATIONS CENTER</h1>
          <div className="page-description">
            Integrated Freight Surveillance Across LAND, RAIL, WATER & AIR Corridors in Northeast India
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-info">[NORTHEAST REGION COMMAND]</span>
          <span className="data-tag data-tag-real">PM GATISHAKTI ALIGNED</span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="card" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              SELECT TRANSPORT MODE:
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['LAND', 'RAIL', 'WATER', 'AIR'] as TransportMode[]).map((m) => {
                const isActive = activeMode === m;
                return (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`btn ${isActive ? 'btn-blue' : 'btn-secondary'} btn-sm`}
                    style={{ fontWeight: isActive ? 900 : 700, gap: 6 }}
                  >
                    {m === 'LAND' && <Truck size={15} />}
                    {m === 'RAIL' && <Train size={15} />}
                    {m === 'WATER' && <Ship size={15} />}
                    {m === 'AIR' && <Plane size={15} />}
                    <span>{m} MODE</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>NETWORK TELEMETRY STATUS:</span>
            <span className={`data-tag ${config.dataSourceStatus === 'CONNECTED' ? 'data-tag-real' : config.dataSourceStatus === 'SIMULATION' ? 'data-tag-simulated' : 'data-tag-derived'}`}>
              {config.dataSourceStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 14 }}>
        
        {/* Left: Operational Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 580, display: 'flex', flexDirection: 'column' }}>
          <MultimodalMapView mode={activeMode} onModeChange={handleModeChange} />
        </div>

        {/* Right: Simulation Controls & Active Telemetry Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Simulation Controls Panel */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Activity size={15} />
                <span>FREIGHT SIMULATION CONTROLS</span>
              </div>
              <span className="data-tag data-tag-simulated">SPEED MULTIPLIER</span>
            </div>

            {/* Start / Pause / Reset Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {!isSimulating ? (
                <button className="btn btn-success" onClick={handleStart} style={{ flex: 1 }}>
                  <Play size={15} />
                  <span>START SIMULATION</span>
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={handlePause} style={{ flex: 1 }}>
                  <Pause size={15} />
                  <span>PAUSE SIMULATION</span>
                </button>
              )}
              <button className="btn btn-danger" onClick={handleReset} style={{ flex: 0.5 }}>
                <RotateCcw size={15} />
                <span>RESET</span>
              </button>
            </div>

            {/* Whitelisted Speed Buttons 1x 5x 10x 20x 50x 100x */}
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>
              SIMULATION ACCELERATION SPEED:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {[1, 5, 10, 20, 50, 100].map((spd) => {
                const isSelected = simSpeed === spd;
                return (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    style={{
                      padding: '6px 0',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 900 : 700,
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary-navy)' : 'var(--border-medium)',
                      backgroundColor: isSelected ? 'var(--primary-navy)' : 'var(--bg-panel)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {spd}x
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Telemetry Monitor */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Compass size={15} />
                <span>ACTIVE {activeMode} TELEMETRY</span>
              </div>
              <span className="badge badge-info">[{gpsUpdate?.simulated_status || 'SCHEDULED'}]</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Vehicle:</span>
                <strong>{gpsUpdate?.vehicleName || config.vehicleName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Location:</span>
                <strong>{gpsUpdate?.current_location_name || config.originHub}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress:</span>
                <strong style={{ color: '#16a34a' }}>{gpsUpdate?.progress_pct || 0}% ({gpsUpdate?.distance_covered_km || 0} / {gpsUpdate?.total_distance_km || 0} km)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operational Speed:</span>
                <strong>{gpsUpdate?.speed_kmh || 0} km/h ({gpsUpdate?.heading_cardinal || 'SE'})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Arrival (ETA):</span>
                <strong style={{ color: '#1d4ed8' }}>{gpsUpdate?.eta_formatted || '18:30 IST'}</strong>
              </div>
            </div>
          </div>

          {/* Mode Risk & Hazard Indicator */}
          <div className="card" style={{ borderColor: gpsUpdate?.current_risk_level === 'HIGH' ? 'var(--status-critical-border)' : 'var(--border-medium)' }}>
            <div className="card-header">
              <div className="card-title">
                <Shield size={15} />
                <span>MODE RISK & HAZARD ASSESSMENT</span>
              </div>
              <span className={`badge ${gpsUpdate?.current_risk_level === 'HIGH' ? 'badge-critical' : 'badge-success'}`}>
                [{gpsUpdate?.current_risk_level || 'LOW'} RISK]
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <strong>Hazard Sector:</strong> {config.hazardName}<br />
              <strong>Risk Classification:</strong> {config.hazardType}<br />
              <strong>Proximity:</strong> {gpsUpdate?.distance_to_hazard_km || 14.2} km from active vehicle.
            </div>
          </div>

        </div>
      </div>

      {/* Candidate Demo: Jogighopa Multimodal Logistics Park (MMLP) Transfer Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Boxes size={16} style={{ color: '#1d4ed8' }} />
            <span>CANDIDATE DEMONSTRATION: JOGIGHOPA MULTIMODAL LOGISTICS PARK (MMLP) TRANSFER</span>
          </div>
          <span className="data-tag data-tag-simulated">CANDIDATE DEMO SCENARIO</span>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
          {JOGIGHOPA_MULTIMODAL_DEMO.corridorName} — Multi-leg freight routing combining highway drayage and IWAI National Waterway 2 Brahmaputra barge transport to bypass NH-6 mountain landslides.
        </div>

        {/* 3 Leg Trajectory Grid */}
        <div className="grid-3" style={{ gap: 10 }}>
          {JOGIGHOPA_MULTIMODAL_DEMO.legs.map((leg) => (
            <div key={leg.id} className="card" style={{ backgroundColor: 'var(--bg-panel)', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="badge badge-info">LEG {leg.legNumber} · [{leg.mode}]</span>
                <span className={`data-tag ${leg.status === 'COMPLETED' ? 'data-tag-real' : leg.status === 'IN_TRANSIT' ? 'data-tag-simulated' : 'data-tag-derived'}`}>
                  {leg.status}
                </span>
              </div>

              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: 4 }}>
                {leg.origin.split(' ')[0]} → {leg.destination.split(' ')[0]}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                {leg.description}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                <span>Vehicle: <strong>{leg.vehicleName.split(' ')[0]}</strong></span>
                <span>Dist: <strong>{leg.distance_km} km</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
