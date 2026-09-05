import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { BarChart3 } from 'lucide-react';

export function BaselineComparison() {
  const { kpis, scenario_step } = useArohanStore();
  const step = scenario_step ?? -1;

  const strategies = [
    {
      name: 'BASELINE 1: SHORTEST ROUTE',
      type: 'Naive Fixed Route',
      route: 'Route A (NH-6 via Umiam)',
      distance: '102 km',
      expectedDelay: '+9.4 hrs',
      riskExposure: '78% (High)',
      leadTime: '0 hrs (No prediction)',
      missionSuccess: '33% (Failure on landslip)',
      lossScore: '88 pts',
      bgClass: '#fef2f2',
      borderClass: '#fecaca',
      textClass: '#dc2626',
      tagClass: 'badge-critical',
    },
    {
      name: 'BASELINE 2: REACTIVE REROUTE',
      type: 'Post-Failure Reaction',
      route: 'Route A → Route B (Only post-blockage)',
      distance: '102 km → 128 km',
      expectedDelay: '+6.5 hrs',
      riskExposure: '78% Initial',
      leadTime: '0 hrs (Post-blockage)',
      missionSuccess: '67% (Traffic bottleneck)',
      lossScore: '75 pts',
      bgClass: '#fff7ed',
      borderClass: '#ffedd5',
      textClass: '#ea580c',
      tagClass: 'badge-amber',
    },
    {
      name: 'AROHAN: PROACTIVE STRATEGY',
      type: 'Risk-Aware Predictive Engine',
      route: 'Route B (Ridge via Sonapur)',
      distance: '128 km (Pre-diverted)',
      expectedDelay: '+1.5 hrs',
      riskExposure: '21% (Low)',
      leadTime: '18 hours (Pre-disruption)',
      missionSuccess: '0 missed deliveries in scenario',
      lossScore: '34 pts',
      bgClass: '#f0fdf4',
      borderClass: '#bbf7d0',
      textClass: '#16a34a',
      tagClass: 'badge-success',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">BASELINE COMPARISON & BENCHMARKING</h1>
          <div className="page-description">
            Quantitative Evaluation: Naive Shortest Route vs Reactive Reroute vs AROHAN Proactive Decision Layer
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid-4">
        <div className="kpi-tile">
          <div className="kpi-label">EXPECTED DELAY AVOIDED</div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>7.9 Hours</div>
          <div className="kpi-subtext">vs Baseline Shortest Route</div>
        </div>

        <div className="kpi-tile">
          <div className="kpi-label">RISK EXPOSURE DELTA</div>
          <div className="kpi-value" style={{ color: '#1e40af' }}>-57%</div>
          <div className="kpi-subtext">Exposure reduction</div>
        </div>

        <div className="kpi-tile">
          <div className="kpi-label">
            <span>DECISION LEAD TIME</span>
            <span className="data-tag data-tag-simulated">SIMULATED SCENARIO</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-navy)' }}>
            18 Hours
          </div>
          <div className="kpi-subtext">Before physical failure</div>
        </div>

        <div className="kpi-tile">
          <div className="kpi-label">
            <span>MISSED DELIVERIES</span>
            <span className="data-tag data-tag-derived">DERIVED</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-success-text)' }}>
            0 Missed
          </div>
          <div className="kpi-subtext">0 missed deliveries in simulated scenario</div>
        </div>
      </div>

      {/* 3-Way Strategy Comparison Grid */}
      <div>
        <div className="section-header">
          <span>SIDE-BY-SIDE STRATEGY BENCHMARKING</span>
          <span className="data-tag data-tag-simulated">BENCHMARK DATA</span>
        </div>

        <div className="grid-3">
          {strategies.map((strat) => (
            <div key={strat.name} className="card" style={{ backgroundColor: strat.bgClass, borderColor: strat.borderClass }}>
              <div className="card-header" style={{ borderBottomColor: strat.borderClass, paddingBottom: 6 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: strat.textClass }}>{strat.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{strat.type}</div>
                </div>
                <span className={`badge ${strat.tagClass}`}>[{strat.lossScore}]</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', marginTop: 6 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Route:</span><br />
                  <strong>{strat.route}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Distance:</span>
                  <strong>{strat.distance}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Expected Delay:</span>
                  <strong style={{ color: strat.textClass }}>{strat.expectedDelay}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Risk Exposure:</span>
                  <strong>{strat.riskExposure}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Decision Lead Time:</span>
                  <strong>{strat.leadTime}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Mission Success:</span>
                  <strong style={{ color: strat.textClass }}>{strat.missionSuccess}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Summary Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={14} />
            <span>BENCHMARKING MATRIX SUMMARY TABLE</span>
          </div>
          <span className="data-tag data-tag-derived">DECISION ENGINE METRICS</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>DECISION STRATEGY</th>
                <th>TIMING MODE</th>
                <th>EXPECTED DELAY</th>
                <th>RISK EXPOSURE</th>
                <th>LEAD TIME</th>
                <th>MISSION LOSS SCORE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Baseline 1 (Shortest Route)</strong></td>
                <td>No decision (Fixed route)</td>
                <td style={{ color: '#dc2626', fontWeight: 800 }}>+9.4 hrs</td>
                <td style={{ color: '#dc2626' }}>78%</td>
                <td>0 hrs</td>
                <td style={{ color: '#dc2626', fontWeight: 800 }}>88 pts</td>
              </tr>
              <tr>
                <td><strong>Baseline 2 (Reactive Reroute)</strong></td>
                <td>Post-disruption (After blockage)</td>
                <td style={{ color: '#ea580c', fontWeight: 800 }}>+6.5 hrs</td>
                <td>78% Initial</td>
                <td>0 hrs</td>
                <td style={{ color: '#ea580c', fontWeight: 800 }}>75 pts</td>
              </tr>
              <tr style={{ backgroundColor: '#f0fdf4' }}>
                <td><strong style={{ color: '#16a34a' }}>AROHAN Proactive Strategy</strong></td>
                <td><strong style={{ color: '#16a34a' }}>Pre-disruption (18h forecast)</strong></td>
                <td style={{ color: '#16a34a', fontWeight: 800 }}>+1.5 hrs</td>
                <td style={{ color: '#16a34a', fontWeight: 800 }}>21%</td>
                <td style={{ color: '#16a34a', fontWeight: 800 }}>18 hrs</td>
                <td style={{ color: '#16a34a', fontWeight: 800 }}>34 pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
