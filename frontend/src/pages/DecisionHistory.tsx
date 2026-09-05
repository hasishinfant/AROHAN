import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { EventTimeline } from '../components/EventTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { History, FileText, CheckCircle2, Shield, Activity } from 'lucide-react';

export function DecisionHistory() {
  const { events, current_decision, kpis, shipment, scenario_step } = useArohanStore();
  const step = scenario_step ?? -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">DECISION HISTORY & SYSTEM AUDIT TRAIL</h1>
          <div className="page-description">
            Immutable Chronological Record of Proactive Decisions, Approvals, and Field Verification
          </div>
        </div>
      </div>

      {/* KPI Outcomes Summary Grid */}
      {step >= 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Shield size={18} style={{ color: 'var(--primary-navy)' }} />
              <span>LOGISTICS OUTCOME & PERFORMANCE METRICS</span>
            </div>
            <span className="data-tag data-tag-derived">DERIVED ANALYSIS</span>
          </div>

          <div className="grid-4">
            <div className="kpi-tile">
              <div className="kpi-label">
                <span>DELAY AVOIDED</span>
                <span className="data-tag data-tag-derived">DERIVED</span>
              </div>
              <div className="kpi-value" style={{ color: 'var(--status-success-text)' }}>
                {kpis?.delay_avoided_h != null ? `${kpis.delay_avoided_h} h` : '—'}
              </div>
              <div className="kpi-subtext">Prevented bottleneck delay</div>
            </div>

            <div className="kpi-tile">
              <div className="kpi-label">
                <span>RISK REDUCTION</span>
                <span className="data-tag data-tag-derived">DERIVED</span>
              </div>
              <div className="kpi-value" style={{ color: 'var(--status-info-text)' }}>
                {kpis?.risk_exposure_reduced_pct != null ? `${kpis.risk_exposure_reduced_pct}%` : '—'}
              </div>
              <div className="kpi-subtext">Exposure delta</div>
            </div>

            <div className="kpi-tile">
              <div className="kpi-label">
                <span>DECISION LATENCY</span>
                <span className="data-tag data-tag-simulated">SIMULATED</span>
              </div>
              <div className="kpi-value" style={{ color: 'var(--primary-navy)' }}>
                {kpis?.decision_latency_sec != null ? `${kpis.decision_latency_sec} s` : '—'}
              </div>
              <div className="kpi-subtext">Response latency</div>
            </div>

            <div className="kpi-tile">
              <div className="kpi-label">
                <span>DRIVER ACK</span>
                <span className="data-tag data-tag-real">REAL EVENT</span>
              </div>
              <div className="kpi-value" style={{ color: kpis?.driver_acknowledged ? 'var(--status-success-text)' : 'var(--text-muted)' }}>
                {kpis?.driver_acknowledged ? 'VERIFIED' : 'PENDING'}
              </div>
              <div className="kpi-subtext">Acknowledgement status</div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Log Table */}
      {current_decision && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} style={{ color: 'var(--primary-navy)' }} />
              <span>OFFICIAL DECISION LOG</span>
            </div>
            <span className="data-tag data-tag-real">AUDIT TRAIL</span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>DECISION ID</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>SHIPMENT</th>
                  <th>FROM ROUTE</th>
                  <th>TO ROUTE</th>
                  <th>RISK %</th>
                  <th>LOSS SCORE DELTA</th>
                  <th>CONFIDENCE</th>
                  <th>TIMESTAMP</th>
                  <th>DISPATCHER</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>DEC-{String(current_decision.id).padStart(4, '0')}</strong></td>
                  <td>
                    <span className={`badge ${current_decision.decision_type === 'PROACTIVE' ? 'badge-warning' : 'badge-info'}`}>
                      {current_decision.decision_type}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={current_decision.status} />
                  </td>
                  <td>SHP-001</td>
                  <td>Route A (NH-6)</td>
                  <td>Route B (Ridge)</td>
                  <td style={{ color: 'var(--status-critical-text)', fontWeight: 700 }}>
                    {(current_decision.disruption_probability * 100).toFixed(0)}%
                  </td>
                  <td style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>
                    {current_decision.mission_score_current.toFixed(0)} → {current_decision.mission_score_recommended.toFixed(0)}
                  </td>
                  <td>{current_decision.confidence}</td>
                  <td>{new Date(current_decision.created_at).toLocaleTimeString()}</td>
                  <td>Arjun Sharma (ID: 1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chronological Event Audit Trail */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} style={{ color: 'var(--primary-navy)' }} />
            <span>FULL CHRONOLOGICAL EVENT TIMELINE</span>
          </div>
          <span className="data-tag data-tag-simulated">SIMULATED EVENT TIMELINE</span>
        </div>

        <EventTimeline events={events ?? []} />
      </div>
    </div>
  );
}
