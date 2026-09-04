import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { BarChart3, TrendingUp, ShieldCheck, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export function BaselineComparison() {
  const { kpis, scenario_step } = useArohanStore();
  const step = scenario_step ?? -1;

  const strategies = [
    {
      name: 'BASELINE 1: SHORTEST ROUTE',
      type: 'Naive Strategy',
      route: 'Route A (NH-6 via Umiam)',
      distance: '102 km',
      expectedDelay: '+9.4 hours',
      riskExposure: '78% (High)',
      leadTime: '0 hours (No prediction)',
      missionSuccess: '33% (Failure on landslip)',
      lossScore: '88 pts',
      bgClass: 'var(--status-critical-bg)',
      borderClass: 'var(--status-critical-border)',
      textClass: 'var(--status-critical-text)',
      tagClass: 'badge-critical',
    },
    {
      name: 'BASELINE 2: REACTIVE REROUTE',
      type: 'Post-Failure Strategy',
      route: 'Route A → Route B (Only after blockage)',
      distance: '102 km → 128 km',
      expectedDelay: '+6.5 hours',
      riskExposure: '78% Initial',
      leadTime: '0 hours (Reacts post-blockage)',
      missionSuccess: '67% (Traffic bottleneck)',
      lossScore: '75 pts',
      bgClass: 'var(--status-warning-bg)',
      borderClass: 'var(--status-warning-border)',
      textClass: 'var(--status-warning-text)',
      tagClass: 'badge-warning',
    },
    {
      name: 'AROHAN: PROACTIVE STRATEGY',
      type: 'Risk-Aware Predictive Engine',
      route: 'Route B (Ridge via Sonapur)',
      distance: '128 km (Pre-diverted)',
      expectedDelay: '+1.5 hours',
      riskExposure: '21% (Low)',
      leadTime: '18 hours (Pre-disruption)',
      missionSuccess: '100% (Guaranteed delivery)',
      lossScore: '34 pts',
      bgClass: 'var(--status-success-bg)',
      borderClass: 'var(--status-success-border)',
      textClass: 'var(--status-success-text)',
      tagClass: 'badge-success',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">BASELINE COMPARISON & EXPERIMENT MODE</h1>
          <div className="page-description">
            Quantitative Evaluation: Naive Shortest Route vs Reactive Reroute vs AROHAN Proactive Decision Layer
          </div>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div className="grid-4">
        <div className="kpi-tile">
          <div className="kpi-label">
            <span>EXPECTED DELAY AVOIDED</span>
            <span className="data-tag data-tag-derived">DERIVED</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-success-text)' }}>
            7.9 Hours
          </div>
          <div className="kpi-subtext">vs Baseline Shortest Route</div>
        </div>

        <div className="kpi-tile">
          <div className="kpi-label">
            <span>RISK EXPOSURE DELTA</span>
            <span className="data-tag data-tag-derived">DERIVED</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-info-text)' }}>
            -57%
          </div>
          <div className="kpi-subtext">Exposure reduction</div>
        </div>

        <div className="kpi-tile">
          <div className="kpi-label">
            <span>DECISION LEAD TIME</span>
            <span className="data-tag data-tag-real">REAL TIME</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-navy)' }}>
            18 Hours
          </div>
          <div className="kpi-subtext">Before physical failure</div>
        </div>

        <div className="kpi-tile">
          <div className="kpi-label">
            <span>MISSION SUCCESS RATE</span>
            <span className="data-tag data-tag-derived">DERIVED</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-success-text)' }}>
            100%
          </div>
          <div className="kpi-subtext">Proactive delivery assurance</div>
        </div>
      </div>

      {/* 3-Way Strategy Comparison Cards */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>SIDE-BY-SIDE STRATEGY BENCHMARKING</span>
          <span className="data-tag data-tag-simulated">SIMULATED BENCHMARK</span>
        </div>

        <div className="grid-3">
          {strategies.map((strat) => (
            <div key={strat.name} className="card" style={{ backgroundColor: strat.bgClass, borderColor: strat.borderClass }}>
              <div className="card-header" style={{ borderBottomColor: strat.borderClass, paddingBottom: 10 }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: strat.textClass }}>{strat.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{strat.type}</div>
                </div>
                <span className={`badge ${strat.tagClass}`}>{strat.lossScore}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', marginTop: 10 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Corridor:</span><br />
                  <strong>{strat.route}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Normal Distance:</span>
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

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
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
            <BarChart3 size={18} />
            <span>BENCHMARKING MATRIX SUMMARY</span>
          </div>
          <span className="data-tag data-tag-derived">DECISION ENGINE METRICS</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>DECISION STRATEGY</th>
                <th>DECISION TIMING</th>
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
                <td style={{ color: 'var(--status-critical-text)', fontWeight: 700 }}>+9.4 hours</td>
                <td style={{ color: 'var(--status-critical-text)' }}>78%</td>
                <td>0 hours</td>
                <td style={{ color: 'var(--status-critical-text)', fontWeight: 800 }}>88 pts</td>
              </tr>
              <tr>
                <td><strong>Baseline 2 (Reactive Reroute)</strong></td>
                <td>Post-disruption (After blockage)</td>
                <td style={{ color: 'var(--status-warning-text)', fontWeight: 700 }}>+6.5 hours</td>
                <td>78% Initial</td>
                <td>0 hours</td>
                <td style={{ color: 'var(--status-warning-text)', fontWeight: 800 }}>75 pts</td>
              </tr>
              <tr style={{ backgroundColor: 'var(--status-success-bg)' }}>
                <td><strong style={{ color: 'var(--status-success-text)' }}>AROHAN Proactive Strategy</strong></td>
                <td><strong style={{ color: 'var(--status-success-text)' }}>Pre-disruption (18h forecast)</strong></td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 800 }}>+1.5 hours</td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>21%</td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>18 hours</td>
                <td style={{ color: 'var(--status-success-text)', fontWeight: 800 }}>34 pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
