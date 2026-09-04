import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { MissionScoreCard } from '../components/MissionScoreCard';
import { EventTimeline } from '../components/EventTimeline';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Shield, Radio, Activity, GitCompare } from 'lucide-react';

export function ReplanningView() {
  const {
    shipment, routes, mission_scores, risk_results,
    current_recommendation, replan_recommendation,
    segment_statuses, events, scenario_step, kpis,
  } = useArohanStore();

  const step = scenario_step ?? -1;
  const scoreA = mission_scores ? Object.values(mission_scores).find((s: any) => s.route_label === 'A') : null;
  const scoreB = mission_scores ? Object.values(mission_scores).find((s: any) => s.route_label === 'B') : null;
  const routeABlocked = Object.values(segment_statuses ?? {}).includes('BLOCKED');
  const replanComplete = step >= 8;

  const loopNodes = [
    { label: 'SENSE', done: step >= 1, desc: 'Rainfall telemetry' },
    { label: 'PREDICT', done: step >= 2, desc: '78% Disruption Risk' },
    { label: 'OPTIMIZE', done: step >= 4, desc: 'Tradeoff evaluation' },
    { label: 'APPROVE', done: step >= 5, desc: 'Dispatcher approval' },
    { label: 'EXECUTE', done: step >= 6, desc: 'Driver notified' },
    { label: 'VERIFY', done: step >= 7, desc: 'Driver field report' },
    { label: 'REPLAN', done: step >= 8, desc: 'Network state updated' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">REPLANNING VIEW — CLOSED-LOOP FIELD REACTION</h1>
          <div className="page-description">
            Verification & Dynamic Network Adaptation · Field Feedback → State Update → Automatic Replanning
          </div>
        </div>
        {replanComplete && (
          <span className="badge badge-success" style={{ padding: '6px 14px' }}>
            <CheckCircle2 size={14} />
            <span>REPLANNING CYCLE COMPLETE</span>
          </span>
        )}
      </div>

      {/* Core Loop Visualizer */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <GitCompare size={18} style={{ color: 'var(--primary-navy)' }} />
            <span>AROHAN CORE PRODUCT LOOP</span>
          </div>
          <span className="data-tag data-tag-real">LOGISTICS ENGINE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', flexWrap: 'wrap', gap: 8 }}>
          {loopNodes.map((node, i) => (
            <React.Fragment key={node.label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: node.done ? 1 : 0.4 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: node.done ? 'var(--primary-navy)' : 'var(--bg-panel)',
                    color: node.done ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    border: `2px solid ${node.done ? 'var(--primary-navy)' : 'var(--border-medium)'}`,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: node.done ? 'var(--primary-navy)' : 'var(--text-muted)' }}>
                  {node.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{node.desc}</div>
              </div>
              {i < loopNodes.length - 1 && (
                <ArrowRight size={16} style={{ color: node.done ? 'var(--primary-navy)' : 'var(--border-medium)', opacity: node.done ? 1 : 0.4 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {step < 7 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, backgroundColor: 'var(--bg-panel)' }}>
          <RefreshCw size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            AWAITING DRIVER FIELD VERIFICATION REPORT
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 500, margin: '8px auto 0 auto' }}>
            The proactive plan has been issued. Advance the demo controller to Step 7 (Driver Report) to trigger the field verification and secondary replanning sequence.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Explicit BEFORE vs AFTER Field Report Comparison Matrix */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              BEFORE FIELD REPORT vs AFTER FIELD REPORT COMPARISON
            </div>

            <div className="grid-2">
              {/* BEFORE FIELD REPORT */}
              <div className="card" style={{ borderColor: 'var(--status-warning-border)', backgroundColor: 'var(--status-warning-bg)' }}>
                <div className="card-header" style={{ borderBottomColor: 'var(--status-warning-border)' }}>
                  <div className="card-title" style={{ color: 'var(--status-warning-text)' }}>
                    <Shield size={16} />
                    <span>BEFORE FIELD REPORT — PROACTIVE STATE</span>
                  </div>
                  <span className="badge badge-warning">PREDICTED RISK</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Road A Network State:</span>{' '}
                    <strong style={{ color: 'var(--status-warning-text)' }}>PASSABLE (78% Predicted Disruption)</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Planned Route:</span>{' '}
                    <strong>Route B (Proactive Reroute)</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Route A Feasibility:</span>{' '}
                    <strong>FEASIBLE (High Risk)</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Calculated Mission Score:</span>{' '}
                    <strong>Route A: 82 pts · Route B: 34 pts</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>System Decision Type:</span>{' '}
                    <strong>PROACTIVE PRE-DISRUPTION CHANGE</strong>
                  </div>
                </div>
              </div>

              {/* AFTER FIELD REPORT */}
              <div className="card" style={{ borderColor: 'var(--status-critical-border)', backgroundColor: 'var(--status-critical-bg)' }}>
                <div className="card-header" style={{ borderBottomColor: 'var(--status-critical-border)' }}>
                  <div className="card-title" style={{ color: 'var(--status-critical-text)' }}>
                    <AlertTriangle size={16} />
                    <span>AFTER FIELD REPORT — REPLANNED STATE</span>
                  </div>
                  <span className="badge badge-critical">STATE: BLOCKED</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Road A Network State:</span>{' '}
                    <strong style={{ color: 'var(--status-critical-text)' }}>BLOCKED (DRIVER VERIFIED)</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Replanned Route:</span>{' '}
                    <strong style={{ color: 'var(--status-success-text)' }}>Route B (CONFIRMED MANDATORY)</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Route A Feasibility:</span>{' '}
                    <strong style={{ color: 'var(--status-critical-text)' }}>INFEASIBLE (INFINITE DELAY)</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Updated ETA:</span>{' '}
                    <strong>{shipment?.updated_eta ?? '13:12 IST'} (4.2 hours total duration)</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>System Decision Type:</span>{' '}
                    <strong>REACTIVE NETWORK STATE REPLAN</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Replanning Audit Summary */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Activity size={16} />
                <span>REPLANNING ENGINE VERIFICATION SUMMARY</span>
              </div>
              <span className="data-tag data-tag-derived">DERIVED AUDIT</span>
            </div>

            <div className="grid-3">
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FIELD REPORT SOURCE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 2 }}>Driver Rahul Kumar (AS-01-A-1234)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>NETWORK STATE UPDATE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-critical-text)', marginTop: 2 }}>Segment NH-6 km 42 marked INFEASIBLE</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>OPTIMIZATION RESPONSE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-success-text)', marginTop: 2 }}>Route B lock-in confirmed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
