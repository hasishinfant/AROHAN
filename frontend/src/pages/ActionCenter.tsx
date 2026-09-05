import React, { useState } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { ActionCard } from '../components/ActionCard';
import { Shield, UserCheck, Sliders, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ActionCenter() {
  const { current_decision, routes, approveDecision, rejectDecision, scenario_step } = useArohanStore();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const navigate = useNavigate();
  const step = scenario_step ?? -1;

  const handleApprove = async () => {
    if (current_decision) {
      await approveDecision(current_decision.id);
    }
  };

  const handleReject = async () => {
    if (current_decision && rejectReason.trim()) {
      await rejectDecision(current_decision.id, rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">ACTION CENTER — DISPATCH APPROVAL CONSOLE</h1>
          <div className="page-description">
            Human-in-the-Loop Operations Control · Proactive Decision Approval & Verification
          </div>
        </div>
        <div className="badge badge-info" style={{ padding: '4px 8px' }}>
          <UserCheck size={12} />
          <span>DISPATCHER: Arjun Sharma (ID: DISP-104)</span>
        </div>
      </div>

      {/* Decision Engine Rule Disclosure Banner */}
      <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Shield size={16} style={{ color: '#1e40af', marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
              CONFIGURED PROACTIVE DECISION RULE
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0f172a', marginTop: 2, fontFamily: 'monospace' }}>
              IF (disruption_probability &ge; 60%) AND (horizon &le; 24h) AND (loss_current &gt; loss_alternative) THEN generate_action_card()
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
              Threshold: Risk Limit = 60% · Planning Horizon = 24 Hours · Mode = Human Approval Required
            </div>
          </div>
        </div>
      </div>

      {step < 4 ? (
        <div className="card" style={{ textAlign: 'center', padding: 36, backgroundColor: 'var(--bg-panel)' }}>
          <Shield size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>
            NO PENDING PROACTIVE DECISION
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 480, margin: '6px auto 16px auto' }}>
            System actively monitoring environmental telemetry. Action cards are generated automatically when risk crosses the 60% threshold.
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/demo')}>
            <Sliders size={13} />
            <span>ADVANCE TO SCENARIO STEP 4</span>
          </button>
        </div>
      ) : !current_decision ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Loading decision parameters...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Action Card */}
          <ActionCard
            decision={current_decision}
            routes={routes ?? []}
            onApprove={handleApprove}
            onReject={() => setShowRejectForm(!showRejectForm)}
            onModify={() => setShowRejectForm(true)}
          />

          {/* Rejection / Modification Form */}
          {showRejectForm && current_decision.status === 'PENDING' && (
            <div className="card" style={{ borderColor: 'var(--status-critical-border)', backgroundColor: 'var(--status-critical-bg)' }}>
              <div className="card-header" style={{ borderBottomColor: 'var(--status-critical-border)' }}>
                <div className="card-title" style={{ color: 'var(--status-critical-text)' }}>
                  <AlertTriangle size={14} />
                  <span>MODIFY OR REJECT DECISION — DISPATCHER JUSTIFICATION</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter operational justification for rejecting or modifying this recommendation..."
                />

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowRejectForm(false)}>
                    CANCEL
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleReject} disabled={!rejectReason.trim()}>
                    SUBMIT REJECTION RECORD
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Decision Audit Trail Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span>DECISION AUDIT & COMPLIANCE TRAIL</span>
              </div>
              <span className="data-tag data-tag-real">AUDIT TRAIL</span>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>DECISION TIMESTAMP</th>
                    <th>DISPATCHER ID</th>
                    <th>APPROVAL STATUS</th>
                    <th>EXPECTED LOSS SCORE REDUCTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>{new Date(current_decision.created_at).toLocaleString()} IST</td>
                    <td>DISP-104 (Arjun Sharma)</td>
                    <td style={{ fontWeight: 800, color: current_decision.status === 'APPROVED' ? '#16a34a' : '#ea580c' }}>
                      [{current_decision.status}]
                    </td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>
                      {current_decision.mission_score_current.toFixed(0)} → {current_decision.mission_score_recommended.toFixed(0)} (-{(current_decision.mission_score_current - current_decision.mission_score_recommended).toFixed(0)} pts)
                    </td>
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
