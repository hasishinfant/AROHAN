import React, { useState } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { DecisionFlowStepper } from '../components/DecisionFlowStepper';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  GitCompare,
  ShieldAlert,
  Boxes,
  Truck,
  Train,
  Ship,
  PhoneCall,
  Sliders
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ReplanningView() {
  const { shipment, scenario_step } = useArohanStore();
  const navigate = useNavigate();

  const [simulateTotalBlockage, setSimulateTotalBlockage] = useState(false);

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
      {/* End-to-End Decision Flow Stepper */}
      <DecisionFlowStepper />

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="page-title">INTELLIGENT REROUTING & DYNAMIC ADAPTATION</h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                padding: '2px 8px',
                borderRadius: 9999,
              }}
            >
              FEASIBILITY ENGINE
            </span>
          </div>
          <div className="page-description">
            Objective: Safe + Feasible + Reliable Delivery (Not merely shortest distance)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setSimulateTotalBlockage(!simulateTotalBlockage)}
            style={{
              borderColor: simulateTotalBlockage ? '#DC2626' : '#CBD5E1',
              color: simulateTotalBlockage ? '#DC2626' : '#475569',
            }}
          >
            <ShieldAlert size={13} />
            <span>{simulateTotalBlockage ? 'RESTORE CORRIDOR PASSABILITY' : 'SIMULATE TOTAL NETWORK BLOCKAGE'}</span>
          </button>

          {replanComplete && (
            <span className="badge badge-success" style={{ padding: '4px 8px' }}>
              <CheckCircle2 size={12} />
              <span>REPLANNING CYCLE COMPLETE</span>
            </span>
          )}
        </div>
      </div>

      {/* EMERGENCY ESCALATION BANNER (When No Reliable Route Exists) */}
      {simulateTotalBlockage && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #DC2626',
            borderRadius: 12,
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                padding: 10,
                borderRadius: '50%',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#991B1B', letterSpacing: '0.02em' }}>
                NO RELIABLE ROUTE FOUND — MANDATORY DISPATCH ESCALATION
              </div>
              <div style={{ fontSize: '0.8rem', color: '#7F1D1D', marginTop: 4, maxWidth: 740, lineHeight: 1.4 }}>
                Primary Corridor (NH-6) is BLOCKED. Secondary Ridge Route (Route B) has exceeded safety risk threshold (Disruption P &gt; 85%).
                The algorithm refuses to force an unsafe route recommendation. System has escalated the situation to the Ministry of Development of North Eastern Region (MDoNER) Emergency Operations Centre.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => navigate('/resources')}
              style={{ fontWeight: 800 }}
            >
              <Boxes size={14} />
              <span>DISPATCH AIRLIFT / LOCAL SURPLUS</span>
            </button>
          </div>
        </div>
      )}

      {/* FEATURE 2: ROUTE FEASIBILITY EVALUATION MATRIX */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
              CORRIDOR FEASIBILITY & SAFETY EVALUATION
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Multi-factor assessment: Distance, Travel Duration, Slope Gradient, Flood Hazard & Transport Mode
            </div>
          </div>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              padding: '2px 8px',
              borderRadius: 9999,
            }}
          >
            OR-TOOLS GRAPH ALGORITHM
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {/* Normal Route */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #FECACA',
              borderRadius: 10,
              padding: 14,
              borderLeft: '4px solid #DC2626',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#DC2626' }}>NORMAL LIFELINE ROUTE</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '2px 6px',
                  borderRadius: 9999,
                }}
              >
                BLOCKED / SEVERE RISK
              </span>
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: 6 }}>
              Route A — NH-6 via Jorabat–Umiam
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
              Distance: <strong>102 km</strong> · Normal ETA: <strong>3.0h</strong>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 4, fontWeight: 700 }}>
              Disruption Probability: 74% · Peak Slope: 42° (Low Valley Cut)
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 6, lineHeight: 1.4 }}>
              Active landslide threat km 68–74. Escarpment saturated by continuous 38 mm/h rainfall. Infeasible for heavy goods transit.
            </div>
          </div>

          {/* Alternative Route B (Recommended) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #A7F3D0',
              borderRadius: 10,
              padding: 14,
              borderLeft: '4px solid #059669',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669' }}>RECOMMENDED ALTERNATIVE</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  padding: '2px 6px',
                  borderRadius: 9999,
                }}
              >
                PASSABLE & SAFE
              </span>
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: 6 }}>
              Route B — Ridge Road via Sonapur
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
              Distance: <strong>128 km (+26 km)</strong> · Updated ETA: <strong>4.2h (+1.2h)</strong>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4, fontWeight: 700 }}>
              Disruption Probability: 22% · Peak Slope: 18° (High Ridge Drainage)
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 6, lineHeight: 1.4 }}>
              <strong>Recommendation Rationale:</strong> Higher elevation ridge corridor avoids low-lying catchment flooding. 26 km detour preserves 100% mission SLA and prevents 12h+ blockage.
            </div>
          </div>

          {/* Alternative Corridor 3: Rail Link */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 10,
              padding: 14,
              borderLeft: '4px solid #475569',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569' }}>MULTIMODAL RAIL BYPASS</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  padding: '2px 6px',
                  borderRadius: 9999,
                }}
              >
                STANDBY BACKUP
              </span>
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: 6 }}>
              NFR Lumding–Badarpur Hill Freight
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
              Mode: <strong>RAILWAY</strong> · Transit: <strong>7.5h</strong> · Cap: <strong>2,400 MT</strong>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
              Subsidence Risk: 44% · Track Condition: INSPECTED
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 6, lineHeight: 1.4 }}>
              Feasible for heavy bulk grains and fuel reallocation to Southern Assam and Tripura if road corridors collapse.
            </div>
          </div>
        </div>
      </div>

      {/* Core Loop Visualizer */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <GitCompare size={14} />
            <span>AROHAN CLOSED-LOOP GOVERNANCE ENGINE</span>
          </div>
          <span className="data-tag data-tag-real">AUTOMATION PIPELINE</span>
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
                    backgroundColor: node.done ? '#064E3B' : 'var(--bg-panel)',
                    color: node.done ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: `1px solid ${node.done ? '#064E3B' : 'var(--border-medium)'}`,
                  }}
                >
                  0{i + 1}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: node.done ? '#064E3B' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {node.label}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{node.desc}</div>
              </div>
              {i < loopNodes.length - 1 && (
                <ArrowRight size={14} style={{ color: node.done ? '#064E3B' : 'var(--border-medium)', opacity: node.done ? 1 : 0.4 }} />
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
