import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { MissionScoreCard } from '../components/MissionScoreCard';
import { RiskGauge } from '../components/RiskGauge';
import { StatusBadge } from '../components/StatusBadge';
import { Package, Shield, Route, ArrowRight } from 'lucide-react';

export function MissionDetail() {
  const { shipment, routes, risk_results, mission_scores, current_recommendation, rainfall_data, scenario_step } = useArohanStore();
  const step = scenario_step ?? -1;

  const scoreA = mission_scores ? Object.values(mission_scores).find((s: any) => s.route_label === 'A') : null;
  const scoreB = mission_scores ? Object.values(mission_scores).find((s: any) => s.route_label === 'B') : null;
  const riskA = risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'A') : null;
  const riskB = risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'B') : null;
  const routeA = routes?.find((r) => r.label === 'A');
  const routeB = routes?.find((r) => r.label === 'B');

  const winner = current_recommendation?.recommended_route_label;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">MISSION DETAIL & ROUTE EVALUATION</h1>
          <div className="page-description">
            Guwahati → Shillong Logistics Corridor · Multi-Route Risk & Mission Loss Tradeoff Analysis
          </div>
        </div>
        {shipment && <StatusBadge status={shipment.status} />}
      </div>

      {/* Active Shipment Information Summary */}
      {shipment && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Package size={18} style={{ color: 'var(--primary-navy)' }} />
              <span>SHIPMENT SPECIFICATION — {shipment.shipment_code}</span>
            </div>
            <span className="data-tag data-tag-simulated">SIMULATED SHIPMENT</span>
          </div>
          <div className="grid-4">
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CARGO TYPE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 2 }}>{shipment.cargo_type}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL WEIGHT</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 2 }}>{shipment.weight_kg} kg</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PRIORITY / URGENCY</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-critical-accent)', marginTop: 2 }}>
                Level {shipment.urgency} / 5
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CURRENT ASSIGNED ROUTE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: 2 }}>
                Route {routes?.find((r) => r.id === shipment.assigned_route_id)?.label ?? 'A'}
                {step >= 5 && winner && ` → Route ${winner} (Updated)`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Mission Loss Score Cards */}
      {scoreA && scoreB && (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>LOGISTICS MISSION LOSS SCORE COMPARISON</span>
            <span className="data-tag data-tag-derived">DERIVED OPTIMIZATION MODEL</span>
          </div>
          <div className="grid-2">
            <MissionScoreCard
              score={scoreA}
              highlight={winner === 'A' ? 'winner' : winner === 'B' ? 'loser' : 'neutral'}
            />
            <MissionScoreCard
              score={scoreB}
              highlight={winner === 'B' ? 'winner' : winner === 'A' ? 'loser' : 'neutral'}
            />
          </div>
        </div>
      )}

      {/* Detailed Technical Comparison Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Route size={18} style={{ color: 'var(--primary-navy)' }} />
            <span>TECHNICAL ROUTE COMPARISON MATRIX</span>
          </div>
          <span className="data-tag data-tag-real">REAL GIS GEOMETRY</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ATTRIBUTE / PARAMETER</th>
                <th>ROUTE A — NH-6 via Umiam</th>
                <th>ROUTE B — Ridge via Sonapur</th>
                <th>DATA CLASSIFICATION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Distance (km)</strong></td>
                <td>{routeA?.distance_km ?? 102} km</td>
                <td>{routeB?.distance_km ?? 128} km</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Base Travel Duration (hours)</strong></td>
                <td>{routeA?.base_duration_h ?? 3.0} h</td>
                <td>{routeB?.base_duration_h ?? 4.2} h</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Corridor Description</strong></td>
                <td>{routeA?.via_description ?? 'NH-6 main arterial road'}</td>
                <td>{routeB?.via_description ?? 'Ridge bypass highland route'}</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Terrain Vulnerability Index</strong></td>
                <td style={{ color: 'var(--status-critical-text)', fontWeight: 700 }}>High (0.85)</td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>Low (0.25)</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Disruption Risk Probability</strong></td>
                <td style={{ color: 'var(--status-critical-text)', fontWeight: 700 }}>
                  {riskA ? `${(riskA.disruption_probability * 100).toFixed(0)}%` : 'Baseline Monitoring'}
                </td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>
                  {riskB ? `${(riskB.disruption_probability * 100).toFixed(0)}%` : 'Baseline Monitoring'}
                </td>
                <td><span className="data-tag data-tag-derived">DERIVED ML</span></td>
              </tr>
              <tr>
                <td><strong>Expected Delay (hours)</strong></td>
                <td style={{ color: 'var(--status-critical-text)', fontWeight: 700 }}>
                  {scoreA ? `+${scoreA.expected_delay_h.toFixed(1)} h` : '—'}
                </td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>
                  {scoreB ? `+${scoreB.expected_delay_h.toFixed(1)} h` : '—'}
                </td>
                <td><span className="data-tag data-tag-derived">DERIVED</span></td>
              </tr>
              <tr>
                <td><strong>Calculated Mission Loss Score</strong></td>
                <td style={{ color: 'var(--status-critical-text)', fontWeight: 800 }}>
                  {scoreA ? scoreA.mission_score.toFixed(0) : '—'}
                </td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 800 }}>
                  {scoreB ? scoreB.mission_score.toFixed(0) : '—'}
                </td>
                <td><span className="data-tag data-tag-derived">DERIVED</span></td>
              </tr>
              <tr>
                <td><strong>System Recommendation Status</strong></td>
                <td>{winner === 'A' ? 'RECOMMENDED' : 'HIGH RISK — AVOID'}</td>
                <td>{winner === 'B' ? 'RECOMMENDED OPTION' : 'ALTERNATIVE'}</td>
                <td><span className="data-tag data-tag-derived">DERIVED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
