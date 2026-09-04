import React, { useState } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { ActionCard } from '../components/ActionCard';
import { Shield, CheckCircle2, XCircle, Sliders, AlertTriangle, UserCheck, Lock } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">ACTION CENTER — DISPATCHER APPROVAL HUB</h1>
          <div className="page-description">
            Human-in-the-Loop Operations Control · Proactive Decision Approval & Dispatch Execution
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="badge badge-info" style={{ padding: '6px 12px' }}>
            <UserCheck size={14} />
            <span>DISPATCHER: Arjun Sharma (ID: DISP-104)</span>
          </div>
        </div>
      </div>

      {/* Decision Engine Rule Disclosure Banner */}
      <div className="card" style={{ backgroundColor: 'var(--status-info-bg)', borderColor: 'var(--status-info-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Shield size={20} style={{ color: 'var(--status-info-accent)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-info-text)', textTransform: 'uppercase' }}>
              CONFIGURED PROACTIVE DECISION RULE
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: 4, fontFamily: 'monospace' }}>
              IF (disruption_probability &ge; 60%) AND (horizon &le; 24h) AND (loss_current &gt; loss_alternative) THEN generate_action_card()
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Proactive Thresholds: Risk Limit = 60% · Planning Horizon = 24 Hours · Mode = Human Approval Required
            </div>
          </div>
        </div>
      </div>

      {step < 4 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, backgroundColor: 'var(--bg-panel)' }}>
          <Shield size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            NO PENDING PROACTIVE DECISION
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 500, margin: '8px auto 20px auto' }}>
            The system is actively monitoring environmental telemetry. A decision action card will be generated automatically when environmental disruption risk crosses the 60% threshold.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/demo')}>
            <Sliders size={16} />
            <span>OPEN SCENARIO CONTROLLER TO ADVANCE TO STEP 4</span>
          </button>
        </div>
      ) : !current_decision ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          Loading decision parameters...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Action Card */}
          <ActionCard
            decision={current_decision}
            routes={routes ?? []}
            onApprove={handleApprove}
            onReject={() => setShowRejectForm(!showRejectForm)}
            onModify={() => setShowRejectForm(true)}
          />

          {/* Rejection / Modification Panel */}
          {showRejectForm && current_decision.status === 'PENDING' && (
            <div className="card" style={{ borderColor: 'var(--status-critical-border)', backgroundColor: 'var(--status-critical-bg)' }}>
              <div className="card-header" style={{ borderBottomColor: 'var(--status-critical-border)' }}>
                <div className="card-title" style={{ color: 'var(--status-critical-text)' }}>
                  <AlertTriangle size={18} />
                  <span>MODIFY OR REJECT DECISION — ENTER DISPATCHER NOTES</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                <textarea
                  className="form-input"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter explicit operational justification for rejecting or modifying this recommendation..."
                />

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setShowRejectForm(false)}>
                    CANCEL
                  </button>
                  <button className="btn btn-danger" onClick={handleReject} disabled={!rejectReason.trim()}>
                    SUBMIT REJECTION RECORD
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Decision Audit Record Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Lock size={16} />
                <span>DECISION AUDIT & COMPLIANCE RECORD</span>
              </div>
              <span className="data-tag data-tag-real">AUDIT TRAIL</span>
            </div>
            <div className="grid-3">
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DECISION TIMESTAMP</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 2 }}>{new Date(current_decision.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>APPROVAL STATUS</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 2, color: current_decision.status === 'APPROVED' ? 'var(--status-success-text)' : 'var(--status-warning-text)' }}>
                  {current_decision.status}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>EXPECTED MISSION LOSS BENEFIT</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-success-text)', marginTop: 2 }}>
                  Score: {current_decision.mission_score_current.toFixed(0)} → {current_decision.mission_score_recommended.toFixed(0)} (-{(current_decision.mission_score_current - current_decision.mission_score_recommended).toFixed(0)} pts)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
