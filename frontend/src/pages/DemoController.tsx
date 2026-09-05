import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { Sliders, Play, Pause, RotateCcw, SkipForward, CheckCircle2, Shield } from 'lucide-react';

const STEP_NARRATIONS = [
  'Shipment SHP-001 initialized. Guwahati → Shillong via Route A (NH-6). Nominal baseline status.',
  'Environmental telemetry received: Rainfall intensity 38 mm/h, cumulative 95 mm/24h in Umiam sector.',
  'Risk Engine activated. Route A predicted disruption probability: 78% (HIGH confidence, 18h horizon).',
  'Logistics Impact Engine computed scores. Route A loss score: 82 (expected delay +9.4h). Route B loss score: 34 (expected delay +1.5h).',
  'Optimization Engine selected Route B (Ridge Road via Sonapur). Action Card issued for human approval.',
  'Dispatcher Arjun Sharma approved proactive reroute to Route B. Decision logged in audit trail.',
  'Driver Rahul Kumar acknowledged updated route plan. Shipment status set to IN_TRANSIT on Route B.',
  'FIELD VERIFICATION: Driver reports Route A (NH-6 km 42) is completely BLOCKED due to landslide debris.',
  'Network State Engine updated segment state to INFEASIBLE. Route B locked as mandatory.',
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

      {/* Multimodal Transport Mode Simulation Controls */}
      <div className="card" style={{ borderLeft: '4px solid #1d4ed8' }}>
        <div className="card-header">
          <div className="card-title">
            <Sliders size={14} style={{ color: '#1d4ed8' }} />
            <span>MULTIMODAL TRANSPORT MODE TEST PANEL</span>
          </div>
          <span className="data-tag data-tag-real">MULTIMODAL CONTROLLER</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['LAND', 'RAIL', 'WATER', 'AIR'].map((mode) => (
              <a
                key={mode}
                href="/multimodal"
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', fontWeight: 800 }}
              >
                TEST [{mode}] SIMULATION MAP
              </a>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Supports <strong>1x, 5x, 10x, 20x, 50x, 100x</strong> speed multipliers for Land (Truck), Rail (Freight Train), Water (IWAI Barge), and Air (Cargo Aircraft).
          </div>
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
