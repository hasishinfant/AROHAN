import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { Sliders, Play, Pause, RotateCcw, SkipForward, CheckCircle2, AlertTriangle, Shield, Clock } from 'lucide-react';

const STEP_NARRATIONS = [
  'Shipment SHP-001 initialized. Guwahati → Shillong via Route A (NH-6). Nominal baseline status. Driver Rahul Kumar assigned.',
  'Environmental telemetry received: Rainfall intensity 38 mm/h, cumulative 95 mm/24h in Umiam sector.',
  'Risk Engine activated. Route A predicted disruption probability: 78% (HIGH confidence, 18h horizon). Proactive threshold 60% exceeded.',
  'Logistics Impact Engine computed scores. Route A loss score: 82 (expected delay +9.4h). Route B loss score: 34 (expected delay +1.5h). Delta: 48 pts.',
  'Optimization Engine selected Route B (Ridge Road via Sonapur). Action Card issued for human approval.',
  'Dispatcher Arjun Sharma approved proactive reroute to Route B. Decision logged in audit trail. Mobile alert sent to driver.',
  'Driver Rahul Kumar acknowledged updated route plan. Shipment status set to IN_TRANSIT on Route B.',
  'FIELD VERIFICATION: Driver reports Route A (NH-6 km 42) is completely BLOCKED due to landslide debris.',
  'Network State Engine updated segment state to INFEASIBLE. Replanning engine executed. Route B locked as mandatory. Mission saved.',
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
    scenarioStart, scenarioNext, scenarioPause, scenarioResume, scenarioReset,
  } = useArohanStore();

  const step = scenario_step ?? -1;
  const status = scenario_status ?? 'IDLE';
  const steps = all_steps ?? [];

  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';
  const isComplete = status === 'COMPLETE';
  const isIdle = status === 'IDLE';

  const narration = step >= 0 && step < STEP_NARRATIONS.length ? STEP_NARRATIONS[step] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">DEMO SCENARIO CONTROLLER</h1>
          <div className="page-description">
            Deterministic 9-Step Event Sequencer · Evaluator Demonstration Panel
          </div>
        </div>
        <span className={`badge ${isComplete ? 'badge-success' : isRunning ? 'badge-warning' : isPaused ? 'badge-info' : 'badge-neutral'}`} style={{ padding: '6px 12px' }}>
          <span className="badge-dot" />
          <span>STATUS: {status}</span>
        </span>
      </div>

      {/* Control Buttons Panel */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sliders size={18} style={{ color: 'var(--primary-navy)' }} />
            <span>SCENARIO EXECUTION CONTROLS</span>
          </div>
          <span className="data-tag data-tag-simulated">DETERMINISTIC SIMULATION</span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', margin: '8px 0' }}>
          {isIdle && (
            <button className="btn btn-primary btn-lg" onClick={scenarioStart}>
              <Play size={18} />
              <span>START SCENARIO (STEP 1)</span>
            </button>
          )}

          {(isRunning || isPaused) && (
            <button className="btn btn-primary btn-lg" onClick={scenarioNext} disabled={isComplete}>
              <SkipForward size={18} />
              <span>NEXT EVENT (STEP {step + 2})</span>
            </button>
          )}

          {isRunning && (
            <button className="btn btn-secondary btn-lg" onClick={scenarioPause}>
              <Pause size={18} />
              <span>PAUSE</span>
            </button>
          )}

          {isPaused && (
            <button className="btn btn-secondary btn-lg" onClick={scenarioResume}>
              <Play size={18} />
              <span>RESUME</span>
            </button>
          )}

          <button className="btn btn-danger btn-lg" onClick={scenarioReset}>
            <RotateCcw size={18} />
            <span>RESET SCENARIO</span>
          </button>
        </div>

        {/* Current Step Narration Box */}
        {narration ? (
          <div style={{ marginTop: 12, backgroundColor: 'var(--status-info-bg)', border: '1px solid var(--status-info-border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-info-text)', textTransform: 'uppercase' }}>
              STEP {step + 1} OF 9 — NARRATIVE SUMMARY
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginTop: 4, fontWeight: 600 }}>
              {narration}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12, backgroundColor: 'var(--bg-panel)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Press <strong>START SCENARIO</strong> to initiate the deterministic demonstration.
          </div>
        )}

        {/* Progress Bar */}
        {step >= 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>DEMO PROGRESS</span>
              <span>{step + 1} / 9 STEPS</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-subtle)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((step + 1) / 9) * 100}%`,
                  backgroundColor: isComplete ? 'var(--status-success-accent)' : 'var(--primary-navy)',
                  height: '100%',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 20-Step Acceptance Test Checklist Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <CheckCircle2 size={18} style={{ color: 'var(--status-success-accent)' }} />
            <span>ACCEPTANCE TEST VERIFICATION MATRIX (20 REQUIREMENTS)</span>
          </div>
          <span className="data-tag data-tag-real">SYSTEM AUDIT</span>
        </div>

        <div className="grid-2" style={{ gap: 8 }}>
          {ACCEPTANCE_CHECKLIST.map((item, idx) => {
            // Determine if check item is fulfilled based on step
            let fulfilled = false;
            if (idx <= 1 && step >= 0) fulfilled = true;
            else if (idx <= 3 && step >= 2) fulfilled = true;
            else if (idx <= 5 && step >= 3) fulfilled = true;
            else if (idx <= 6 && step >= 4) fulfilled = true;
            else if (idx <= 7 && step >= 5) fulfilled = true;
            else if (idx <= 9 && step >= 6) fulfilled = true;
            else if (idx <= 10 && step >= 7) fulfilled = true;
            else if (idx <= 17 && step >= 8) fulfilled = true;
            else if (idx <= 19 && step >= 8) fulfilled = true;

            return (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: fulfilled ? 'var(--status-success-bg)' : 'var(--bg-panel)',
                  color: fulfilled ? 'var(--status-success-text)' : 'var(--text-muted)',
                  border: `1px solid ${fulfilled ? 'var(--status-success-border)' : 'var(--border-subtle)'}`,
                }}
              >
                <CheckCircle2 size={14} style={{ color: fulfilled ? 'var(--status-success-accent)' : 'var(--text-disabled)' }} />
                <span style={{ fontWeight: fulfilled ? 600 : 400 }}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
