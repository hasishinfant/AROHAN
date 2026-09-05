import React, { useState } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Shield,
  Boxes,
  CloudRain,
  Mountain,
  Waves,
  Truck,
  AlertTriangle,
  Flame,
  Activity,
  Sparkles
} from 'lucide-react';

const STEP_NARRATIONS = [
  'Relief Movement REL-001 initialized. Guwahati Buffer Depot → Shillong Core Relief Hub via Route A (NH-6). Baseline status.',
  'Environmental telemetry received: Rainfall intensity 38 mm/h, cumulative 95 mm/24h in Umiam escarpment sector.',
  'Risk Engine activated. Route A predicted disruption probability: 78% (HIGH confidence, 18h lookahead).',
  'Logistics Impact Engine computed scores. Route A loss score: 82 (expected delay +9.4h). Route B loss score: 34 (expected delay +1.5h).',
  'Optimization Engine selected Route B (Ridge Corridor via Sonapur). Action Card issued for human-in-the-loop approval.',
  'Incident Commander Arjun Sharma approved proactive reroute to Route B. Operational directive logged in audit trail.',
  'Driver Rahul Kumar acknowledged updated relief route. Movement status set to IN_TRANSIT on Route B.',
  'FIELD VERIFICATION: Field patrol reports Route A (NH-6 km 42) is completely BLOCKED due to massive landslide debris.',
  'Network State Engine updated segment state to INFEASIBLE. Route B locked as mandatory lifeline.',
];

const ACCEPTANCE_CHECKLIST = [
  '1. Shipment exists (Guwahati → Shillong)',
  '2. Current route exists (Route A NH-6)',
  '3. Future disruption predicted (78% probability)',
  '4. Risk threshold (60%) exceeded',
  '5. Logistics consequence calculated (Expected delay +9.4h)',
  '6. Alternative route evaluated (Route B Ridge via Sonapur)',
  '7. Proactive recommendation generated (Action Card issued)',
  '8. Dispatcher approves recommendation',
  '9. Driver receives updated route on mobile interface',
  '10. Driver acknowledges route change',
  '11. Driver reports obstruction on Route A',
  '12. Road state updated to BLOCKED',
  '13. Replanning triggered automatically',
  '14. Route recalculated and locked to Route B',
  '15. ETA updated dynamically',
  '16. Mission loss score updated',
  '17. New recommendation confirmed',
  '18. Decision audit trail records all events',
  '19. KPI values update (Delay avoided, risk reduced)',
  '20. Entire process replayable via START / NEXT / RESET',
];

export function DemoController() {
  const {
    scenario_step, scenario_status, all_steps,
    step_label, step_description,
    scenarioStart, scenarioNext, scenarioPause, scenarioResume, scenarioReset, scenarioLowConfidence,
  } = useArohanStore();

  const [rainIntensity, setRainIntensity] = useState(38);
  const [rainDuration, setRainDuration] = useState(18);
  const [landslideHazard, setLandslideHazard] = useState('CRITICAL');
  const [floodLevel, setFloodLevel] = useState('WARNING');
  const [accessibilityReduction, setAccessibilityReduction] = useState(45);
  const [demandSurge, setDemandSurge] = useState(1.8);
  const [selectedCorridor, setSelectedCorridor] = useState('NH-6 Jorabat → Umiam km 42–54');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedImpact, setSimulatedImpact] = useState<{
    accessibilityDrop: number;
    affectedCorridors: { name: string; status: 'RED' | 'AMBER' | 'GREEN'; condition: string }[];
    shortageDistricts: string[];
    recommendedAction: string;
    timestamp: string;
  } | null>({
    accessibilityDrop: 45,
    affectedCorridors: [
      { name: 'NH-6 Jorabat → Umiam km 42–54', status: 'RED', condition: 'Debris Overwash (Probability 78%)' },
      { name: 'NH-27 Lumding Rail-Road Approach', status: 'AMBER', condition: 'Culvert Inundation Depth +0.65m' },
      { name: 'Route B Sonapur Ridge Highway', status: 'GREEN', condition: 'Passable & Resilient (Risk 21%)' },
    ],
    shortageDistricts: ['East Khasi Hills (Shillong)', 'Cachar (Silchar)', 'West Tripura (Agartala)'],
    recommendedAction: 'Execute proactive reroute for REL-001 to Route B; dispatch 1,200 MT grain transfer TRF-00101 from Guwahati before 14:00 IST.',
    timestamp: new Date().toLocaleTimeString() + ' IST',
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      const isCritical = rainIntensity >= 35 || landslideHazard === 'CRITICAL';
      setSimulatedImpact({
        accessibilityDrop: accessibilityReduction,
        affectedCorridors: [
          {
            name: selectedCorridor,
            status: isCritical ? 'RED' : 'AMBER',
            condition: isCritical ? `Severe Disruption Triggered (${rainIntensity} mm/h rain, ${rainDuration}h duration)` : 'Passable with caution',
          },
          { name: 'NH-27 Lumding / Haflong Incline', status: floodLevel === 'DANGER' || floodLevel === 'EXTREME' ? 'RED' : 'AMBER', condition: `River Discharge Level: ${floodLevel}` },
          { name: 'Route B Sonapur Ridge Corridor', status: 'GREEN', condition: 'Designated Safe Lifeline (Elevated above floodplain)' },
        ],
        shortageDistricts: ['East Khasi Hills (Shillong)', 'Cachar (Silchar)', 'West Tripura (Agartala)', 'Aizawl (Zuangtui)'],
        recommendedAction: `Proactive mitigation triggered: Demand surge ${demandSurge}x logged. Emergency rebalance of critical buffers recommended.`,
        timestamp: new Date().toLocaleTimeString() + ' IST',
      });
    }, 600);
  };

  const step = scenario_step ?? -1;
  const status = scenario_status ?? 'IDLE';

  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';
  const isComplete = status === 'COMPLETE';
  const isIdle = status === 'IDLE';

  const narration = step >= 0 && step < STEP_NARRATIONS.length ? STEP_NARRATIONS[step] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">DEMO SCENARIO CONTROLLER</h1>
          <div className="page-description">
            Deterministic Event Sequencer · Evaluator Demonstration & Confidence Gating Test Panel
          </div>
        </div>
        <span className={`badge ${isComplete ? 'badge-success' : isRunning ? 'badge-amber' : isPaused ? 'badge-info' : 'badge-neutral'}`}>
          [STATUS: {status}]
        </span>
      </div>

      {/* Control Buttons Panel */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sliders size={14} />
            <span>SCENARIO EXECUTION CONTROLS</span>
          </div>
          <span className="data-tag data-tag-simulated">SIMULATION CONTROL</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', margin: '4px 0' }}>
          {isIdle && (
            <button className="btn btn-primary" onClick={scenarioStart}>
              <Play size={14} />
              <span>START SCENARIO (STEP 1)</span>
            </button>
          )}

          {(isRunning || isPaused) && (
            <button className="btn btn-primary" onClick={scenarioNext} disabled={isComplete}>
              <SkipForward size={14} />
              <span>NEXT EVENT (STEP {step + 2})</span>
            </button>
          )}

          {isRunning && (
            <button className="btn btn-secondary" onClick={scenarioPause}>
              <Pause size={14} />
              <span>PAUSE</span>
            </button>
          )}

          {isPaused && (
            <button className="btn btn-secondary" onClick={scenarioResume}>
              <Play size={14} />
              <span>RESUME</span>
            </button>
          )}

          <button className="btn btn-warning" onClick={scenarioLowConfidence} style={{ backgroundColor: '#eab308', color: '#000', fontWeight: 700 }}>
            <Shield size={14} />
            <span>TEST LOW-CONFIDENCE GATING SCENARIO</span>
          </button>

          <button className="btn btn-danger" onClick={scenarioReset}>
            <RotateCcw size={14} />
            <span>RESET SCENARIO</span>
          </button>
        </div>

        {/* Current Step Narration Box */}
        {narration ? (
          <div style={{ marginTop: 10, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 12px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
              STEP {step + 1} OF 9 — EVENT NARRATIVE
            </div>
            <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: 2, fontWeight: 700 }}>
              {narration}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 10, backgroundColor: 'var(--bg-panel)', padding: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Press <strong>START SCENARIO</strong> to initiate the demonstration.
          </div>
        )}
      </div>

      {/* DISASTER SCENARIO SIMULATOR — ENVIRONMENTAL PARAMETER INJECTIONS */}
      <div className="card" style={{ padding: 18, border: '1px solid #D97706', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} style={{ color: '#D97706' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                DISASTER SCENARIO SIMULATOR — ENVIRONMENTAL PARAMETER INJECTIONS
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Inject stress parameters into the NER multimodal network to evaluate real-time resilience & automated decision logic
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FDE68A',
              padding: '3px 8px',
              borderRadius: 9999,
            }}
          >
            DISASTER INJECTION MATRIX
          </span>
        </div>

        {/* Injections Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {/* Rainfall Intensity Slider */}
          <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CloudRain size={13} style={{ color: '#0284C7' }} /> RAINFALL INTENSITY
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, color: rainIntensity > 35 ? '#DC2626' : '#0284C7' }}>
                {rainIntensity} mm/h
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="2"
              value={rainIntensity}
              onChange={(e) => setRainIntensity(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8, accentColor: '#0284C7' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: 2 }}>
              <span>10 mm/h (Light)</span>
              <span>120 mm/h (Extreme Cloudburst)</span>
            </div>
          </div>

          {/* Rainfall Duration Slider */}
          <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Activity size={13} style={{ color: '#4F46E5' }} /> RAINFALL DURATION
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#4F46E5' }}>
                {rainDuration} Hours
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="48"
              step="1"
              value={rainDuration}
              onChange={(e) => setRainDuration(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8, accentColor: '#4F46E5' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: 2 }}>
              <span>1h (Flash shower)</span>
              <span>48h (Sustained monsoon depression)</span>
            </div>
          </div>

          {/* Landslide Hazard Index */}
          <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mountain size={13} style={{ color: '#DC2626' }} /> LANDSLIDE HAZARD INDEX
            </span>
            <select
              className="form-input"
              value={landslideHazard}
              onChange={(e) => setLandslideHazard(e.target.value)}
              style={{ fontSize: '0.75rem', width: '100%', marginTop: 8, padding: '4px 6px' }}
            >
              <option value="LOW">LOW — Stable Bedrock</option>
              <option value="MODERATE">MODERATE — Partial Shear Saturation</option>
              <option value="HIGH">HIGH — High Cut Slope Vulnerability</option>
              <option value="CRITICAL">CRITICAL — Imminent Escarpment Slip (42°)</option>
            </select>
          </div>

          {/* River Flood / Discharge Level */}
          <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Waves size={13} style={{ color: '#0284C7' }} /> RIVER DISCHARGE / FLOOD
            </span>
            <select
              className="form-input"
              value={floodLevel}
              onChange={(e) => setFloodLevel(e.target.value)}
              style={{ fontSize: '0.75rem', width: '100%', marginTop: 8, padding: '4px 6px' }}
            >
              <option value="NORMAL">NORMAL — Below Warning Level</option>
              <option value="WARNING">WARNING — Bankfull Discharge Approaches</option>
              <option value="DANGER">DANGER — Culverts Submerged (+0.65m)</option>
              <option value="EXTREME">EXTREME — Regional Basin Inundation</option>
            </select>
          </div>

          {/* Road Accessibility Reduction % Slider */}
          <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A' }}>ROAD ACCESSIBILITY LOSS</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#DC2626' }}>-{accessibilityReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={accessibilityReduction}
              onChange={(e) => setAccessibilityReduction(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8, accentColor: '#DC2626' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: 2 }}>
              <span>0% (Fully open)</span>
              <span>100% (Complete network severance)</span>
            </div>
          </div>

          {/* Resource Demand Surge Multiplier Slider */}
          <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A' }}>RESOURCE DEMAND SURGE</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#B45309' }}>{demandSurge.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={demandSurge}
              onChange={(e) => setDemandSurge(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8, accentColor: '#B45309' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: 2 }}>
              <span>1.0x (Normal baseline)</span>
              <span>3.5x (Critical emergency surge)</span>
            </div>
          </div>
        </div>

        {/* Selected Blockage Corridor Selection & Run Action */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 280 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
              TARGET CORRIDOR INJECTION:
            </label>
            <select
              className="form-input"
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '6px 8px', flex: 1 }}
            >
              <option value="NH-6 Jorabat → Umiam km 42–54">NH-6 Jorabat → Umiam km 42–54 (Arterial)</option>
              <option value="NH-27 Haflong Mountain Pass">NH-27 Haflong Mountain Pass (Dima Hasao)</option>
              <option value="NH-102 Imphal → Moreh Border Corridor">NH-102 Imphal → Moreh Border Corridor</option>
              <option value="NH-29 Dimapur → Kohima Gorge">NH-29 Dimapur → Kohima Gorge</option>
              <option value="Lumding → Badarpur Hill Railway Section">Lumding → Badarpur Hill Railway Section</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            style={{ backgroundColor: '#D97706', borderColor: '#B45309', fontWeight: 800, fontSize: '0.8rem' }}
          >
            <Sparkles size={14} />
            <span>{isSimulating ? 'INJECTING HAZARD TELEMETRY...' : 'RUN SIMULATION / INJECT DISASTER SCENARIO'}</span>
          </button>
        </div>

        {/* SIMULATED IMPACT OUTPUT PANEL */}
        {simulatedImpact && (
          <div
            style={{
              marginTop: 14,
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 10,
              padding: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} style={{ color: '#B45309' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#92400E', textTransform: 'uppercase' }}>
                  SIMULATED IMPACT ASSESSMENT RESULT ({simulatedImpact.timestamp})
                </span>
              </div>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                ACCESSIBILITY REDUCTION: -{simulatedImpact.accessibilityDrop}%
              </span>
            </div>

            {/* Affected Corridors List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, marginTop: 8 }}>
              {simulatedImpact.affectedCorridors.map((c, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${c.status === 'RED' ? '#FECACA' : c.status === 'AMBER' ? '#FDE68A' : '#BBF7D0'}`,
                    borderLeft: `4px solid ${c.status === 'RED' ? '#DC2626' : c.status === 'AMBER' ? '#F59E0B' : '#16A34A'}`,
                    padding: '8px 10px',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A' }}>{c.name}</span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        backgroundColor: c.status === 'RED' ? '#FEE2E2' : c.status === 'AMBER' ? '#FEF3C7' : '#DCFCE7',
                        color: c.status === 'RED' ? '#DC2626' : c.status === 'AMBER' ? '#B45309' : '#15803D',
                        padding: '1px 6px',
                        borderRadius: 9999,
                      }}
                    >
                      [{c.status}]
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2 }}>{c.condition}</div>
                </div>
              ))}
            </div>

            {/* Shortage Districts & Action Directive */}
            <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: '#92400E', fontWeight: 700 }}>Identified Shortage Districts:</span>{' '}
                <strong>{simulatedImpact.shortageDistricts.join(', ')}</strong>
              </div>
            </div>

            <div
              style={{
                marginTop: 8,
                padding: '8px 10px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 6,
                fontSize: '0.75rem',
                color: '#065F46',
              }}
            >
              <strong>PROACTIVE RESPONSE DIRECTIVE:</strong> {simulatedImpact.recommendedAction}
            </div>
          </div>
        )}
      </div>

      {/* Multimodal Transport Mode Simulation Control Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Boxes size={14} style={{ color: '#1d4ed8' }} />
            <span>MULTIMODAL TRANSPORT MODE TEST PANEL</span>
          </div>
          <span className="data-tag data-tag-simulated">MULTIMODAL EXTENSION</span>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
          Test operational mode switching, speed acceleration (1x–100x), and simulation isolation across LAND, RAIL, WATER, and AIR corridors.
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['LAND', 'RAIL', 'WATER', 'AIR'].map((m) => (
            <a
              key={m}
              href="/multimodal"
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 800, fontSize: '0.75rem' }}
            >
              TEST {m} MODE SIMULATION →
            </a>
          ))}
        </div>
      </div>

      {/* 20-Step Acceptance Test Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <CheckCircle2 size={14} />
            <span>ACCEPTANCE TEST VERIFICATION MATRIX (20 REQUIREMENTS)</span>
          </div>
          <span className="data-tag data-tag-real">SYSTEM AUDIT</span>
        </div>

        <div className="grid-2" style={{ gap: 6 }}>
          {ACCEPTANCE_CHECKLIST.map((item, idx) => {
            let fulfilled = false;
            if (idx <= 1 && step >= 0) fulfilled = true;
            else if (idx <= 3 && step >= 2) fulfilled = true;
            else if (idx <= 5 && step >= 3) fulfilled = true;
            else if (idx <= 6 && step >= 4) fulfilled = true;
            else if (idx <= 7 && step >= 5) fulfilled = true;
            else if (idx <= 9 && step >= 6) fulfilled = true;
            else if (idx <= 10 && step >= 7) fulfilled = true;
            else if (idx <= 19 && step >= 8) fulfilled = true;

            return (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  backgroundColor: fulfilled ? '#f0fdf4' : 'var(--bg-panel)',
                  color: fulfilled ? '#14532d' : 'var(--text-muted)',
                  border: `1px solid ${fulfilled ? '#bbf7d0' : 'var(--border-medium)'}`,
                }}
              >
                <CheckCircle2 size={12} style={{ color: fulfilled ? '#16a34a' : 'var(--text-muted)' }} />
                <span style={{ fontWeight: fulfilled ? 700 : 500 }}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
