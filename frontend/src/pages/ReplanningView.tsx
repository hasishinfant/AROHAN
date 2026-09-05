import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Shield, GitCompare } from 'lucide-react';

export function ReplanningView() {
  const {
    shipment, scenario_step,
  } = useArohanStore();

  const step = scenario_step ?? -1;
  const replanComplete = step >= 8;

  const loopNodes = [
    { label: 'SENSE', done: step >= 1, desc: 'IMD rainfall stream' },
    { label: 'PREDICT', done: step >= 2, desc: '78% Disruption Risk' },
    { label: 'OPTIMIZE', done: step >= 4, desc: 'Loss score evaluation' },
    { label: 'APPROVE', done: step >= 5, desc: 'Dispatcher approval' },
    { label: 'EXECUTE', done: step >= 6, desc: 'Driver notified' },
    { label: 'VERIFY', done: step >= 7, desc: 'Driver field report' },
    { label: 'REPLAN', done: step >= 8, desc: 'State lock-in complete' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">REPLANNING VIEW — CLOSED-LOOP FIELD REACTION</h1>
          <div className="page-description">
            Verification & Dynamic Network Adaptation · Field Feedback → State Update → Automatic Replanning
          </div>
        </div>
        {replanComplete && (
          <span className="badge badge-success" style={{ padding: '4px 8px' }}>
            <CheckCircle2 size={12} />
            <span>REPLANNING CYCLE COMPLETE</span>
          </span>
        )}
      </div>

      {/* Core Loop Visualizer */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <GitCompare size={14} />
            <span>AROHAN CORE DECISION LOOP</span>
          </div>
          <span className="data-tag data-tag-real">LOGISTICS ENGINE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', flexWrap: 'wrap', gap: 6 }}>
          {loopNodes.map((node, i) => (
            <React.Fragment key={node.label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: node.done ? 1 : 0.4 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: node.done ? 'var(--primary-navy)' : 'var(--bg-panel)',
                    color: node.done ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: `1px solid ${node.done ? 'var(--primary-navy)' : 'var(--border-medium)'}`,
                  }}
                >
                  0{i + 1}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: node.done ? 'var(--primary-navy)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {node.label}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{node.desc}</div>
              </div>
              {i < loopNodes.length - 1 && (
                <ArrowRight size={14} style={{ color: node.done ? 'var(--primary-navy)' : 'var(--border-medium)', opacity: node.done ? 1 : 0.4 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {step < 7 ? (
        <div className="card" style={{ textAlign: 'center', padding: 36, backgroundColor: 'var(--bg-panel)' }}>
          <RefreshCw size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>
            AWAITING DRIVER FIELD VERIFICATION REPORT
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 480, margin: '6px auto 0 auto' }}>
            Proactive plan issued. Advance scenario controller to Step 7 (Driver Report) to trigger field verification and secondary replanning.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* BEFORE vs AFTER Matrix Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span>BEFORE vs AFTER FIELD REPORT STATE COMPARISON</span>
              </div>
              <span className="data-tag data-tag-derived">STATE MATRICES</span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>PARAMETER</th>
                    <th>BEFORE FIELD REPORT (PROACTIVE STATE)</th>
                    <th>AFTER FIELD REPORT (REPLANNED STATE)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Road A Network State</strong></td>
                    <td style={{ color: '#b45309', fontWeight: 700 }}>PASSABLE (78% Predicted Disruption)</td>
                    <td style={{ color: '#dc2626', fontWeight: 800 }}>BLOCKED (DRIVER VERIFIED)</td>
                  </tr>
                  <tr>
                    <td><strong>Assigned Corridor Route</strong></td>
                    <td>Route B (Proactive Reroute)</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>Route B (CONFIRMED MANDATORY)</td>
                  </tr>
                  <tr>
                    <td><strong>Route A Feasibility</strong></td>
                    <td>FEASIBLE (High Risk)</td>
                    <td style={{ color: '#dc2626', fontWeight: 800 }}>INFEASIBLE (INFINITE DELAY)</td>
                  </tr>
                  <tr>
                    <td><strong>Updated Corridor ETA</strong></td>
                    <td>{shipment?.updated_eta ?? '13:12 IST'}</td>
                    <td>{shipment?.updated_eta ?? '13:12 IST'} (4.2 hrs total duration)</td>
                  </tr>
                  <tr>
                    <td><strong>Decision Lifecycle Type</strong></td>
                    <td>PROACTIVE PRE-DISRUPTION REROUTE</td>
                    <td>REACTIVE NETWORK STATE REPLAN</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Replanning Audit Summary */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span>REPLANNING ENGINE VERIFICATION SUMMARY</span>
              </div>
              <span className="data-tag data-tag-real">AUDIT TRAIL</span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>FIELD REPORT SOURCE</th>
                    <th>NETWORK STATE UPDATE</th>
                    <th>OPTIMIZATION RESPONSE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 800 }}>Driver Rahul Kumar (TRUCK-07)</td>
                    <td style={{ fontWeight: 800, color: '#dc2626' }}>Segment NH-6 Umiam marked INFEASIBLE</td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>Route B lock-in confirmed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
