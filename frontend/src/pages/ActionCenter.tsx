import React, { useState, useEffect } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { ActionCard } from '../components/ActionCard';
import { DecisionFlowStepper } from '../components/DecisionFlowStepper';
import {
  Shield,
  UserCheck,
  Sliders,
  AlertTriangle,
  Bell,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  Boxes
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ActionCenter() {
  const {
    current_decision,
    routes,
    approveDecision,
    rejectDecision,
    scenario_step,
    operationalAlerts,
    fetchAlerts,
    reviewAlert,
    approveAlert,
    dismissAlert
  } = useArohanStore();

  const [activeTab, setActiveTab] = useState<'ALERTS' | 'DISPATCH'>('ALERTS');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [dismissReason, setDismissReason] = useState('');
  const [dismissingAlertId, setDismissingAlertId] = useState<number | null>(null);

  const navigate = useNavigate();
  const step = scenario_step ?? -1;

  useEffect(() => {
    fetchAlerts();
  }, []);

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

  const handleReviewAlert = async (id: number) => {
    await reviewAlert(id);
  };

  const handleApproveAlert = async (id: number) => {
    await approveAlert(id);
  };

  const handleDismissAlert = async (id: number) => {
    if (!dismissReason.trim()) return;
    await dismissAlert(id, dismissReason);
    setDismissingAlertId(null);
    setDismissReason('');
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' };
      case 'HIGH':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'MEDIUM':
        return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* End-to-End Decision Flow Stepper */}
      <DecisionFlowStepper />

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="page-title">AUTOMATED COORDINATION & ACTION CENTER</h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                padding: '2px 8px',
                borderRadius: 9999,
                letterSpacing: '0.04em',
              }}
            >
              HUMAN-IN-THE-LOOP CONTROL
            </span>
          </div>
          <div className="page-description">
            Operational Coordination Alerts · Inter-Departmental Logistics Directives · Proactive Reroute Approvals
          </div>
        </div>
        <div className="badge badge-info" style={{ padding: '4px 8px' }}>
          <UserCheck size={12} />
          <span>DISPATCHER: Arjun Sharma (ID: DISP-104)</span>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #E2E8F0', paddingBottom: 6 }}>
        <button
          className="btn btn-sm"
          onClick={() => setActiveTab('ALERTS')}
          style={{
            backgroundColor: activeTab === 'ALERTS' ? '#064E3B' : '#F1F5F9',
            color: activeTab === 'ALERTS' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
          }}
        >
          <Bell size={13} />
          <span>OPERATIONAL COORDINATION ALERTS ({operationalAlerts.length})</span>
        </button>

        <button
          className="btn btn-sm"
          onClick={() => setActiveTab('DISPATCH')}
          style={{
            backgroundColor: activeTab === 'DISPATCH' ? '#064E3B' : '#F1F5F9',
            color: activeTab === 'DISPATCH' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
          }}
        >
          <Shield size={13} />
          <span>DISPATCH ACTION CARD #102 {current_decision ? `[${current_decision.status}]` : ''}</span>
        </button>
      </div>

      {activeTab === 'ALERTS' ? (
        /* ── SECTION 1: OPERATIONAL ACTIONABLE ALERTS ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {operationalAlerts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 36 }}>
              <CheckCircle2 size={36} style={{ color: '#059669', margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                ALL COORDINATION ALERTS RESOLVED
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4 }}>
                No pending supply disruptions or unacknowledged departmental directives.
              </div>
            </div>
          ) : (
            operationalAlerts.map((alert) => {
              const pStyle = getPriorityStyle(alert.priority);
              const isDismissing = dismissingAlertId === alert.id;

              return (
                <div
                  key={alert.id}
                  className="card"
                  style={{
                    padding: 18,
                    borderLeft: `5px solid ${alert.priority === 'CRITICAL' ? '#DC2626' : alert.priority === 'HIGH' ? '#F59E0B' : '#2563EB'}`,
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            backgroundColor: pStyle.bg,
                            color: pStyle.text,
                            border: `1px solid ${pStyle.border}`,
                            padding: '2px 8px',
                            borderRadius: 9999,
                          }}
                        >
                          {alert.priority}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>
                          {alert.alert_code}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: alert.status === 'APPROVED' ? '#ECFDF5' : alert.status === 'REVIEWED' ? '#EFF6FF' : '#FEF3C7',
                            color: alert.status === 'APPROVED' ? '#047857' : alert.status === 'REVIEWED' ? '#1E40AF' : '#B45309',
                            padding: '2px 6px',
                            borderRadius: 9999,
                          }}
                        >
                          STATUS: {alert.status}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                          Confidence: {alert.confidence}
                        </span>
                      </div>

                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: 6 }}>
                        {alert.title}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4, maxWidth: 780 }}>
                        {alert.description}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        SIMULATION DATA
                      </span>
                    </div>
                  </div>

                  {/* Alert Context Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 10,
                      marginTop: 14,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: 12,
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>AFFECTED CORRIDOR</div>
                      <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{alert.affected_corridor}</div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Destination: {alert.location_district}</div>
                    </div>

                    <div>
                      <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>ESSENTIAL RESOURCE</div>
                      <div style={{ fontWeight: 800, color: '#DC2626', marginTop: 2 }}>{alert.affected_resource}</div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Source: {alert.suggested_source_district}</div>
                    </div>

                    <div>
                      <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>RECOMMENDED ROUTE & ETA</div>
                      <div style={{ fontWeight: 800, color: '#059669', marginTop: 2 }}>{alert.recommended_route}</div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Estimated Transit: {alert.estimated_eta}</div>
                    </div>

                    <div>
                      <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>RESPONSIBLE DEPARTMENT</div>
                      <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{alert.responsible_department}</div>
                    </div>
                  </div>

                  {/* Recommendation Action Statement */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: '10px 14px',
                      borderRadius: 8,
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      fontSize: '0.78rem',
                      color: '#1E3A8A',
                    }}
                  >
                    <strong>RECOMMENDED DIRECTIVE:</strong> {alert.recommended_action}
                  </div>

                  {/* Operational Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate('/resources')}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Boxes size={13} />
                      <span>INSPECT DISTRICT INVENTORY</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {alert.status === 'ACTIVE' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleReviewAlert(alert.id)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>[REVIEW]</span>
                        </button>
                      )}

                      {alert.status !== 'APPROVED' && alert.status !== 'DISMISSED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApproveAlert(alert.id)}
                          style={{ backgroundColor: '#059669', borderColor: '#047857', fontSize: '0.75rem' }}
                        >
                          <CheckCircle2 size={13} />
                          <span>[APPROVE DIRECTIVE]</span>
                        </button>
                      )}

                      {alert.status !== 'DISMISSED' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setDismissingAlertId(isDismissing ? null : alert.id)}
                          style={{ borderColor: '#DC2626', color: '#DC2626', fontSize: '0.75rem' }}
                        >
                          <XCircle size={13} />
                          <span>[DISMISS]</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dismiss Form */}
                  {isDismissing && (
                    <div style={{ marginTop: 12, padding: 12, border: '1px solid #FECDD3', backgroundColor: '#FFF5F5', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#BE123C', marginBottom: 6 }}>
                        JUSTIFICATION FOR DISMISSING ALERT
                      </div>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={dismissReason}
                        onChange={(e) => setDismissReason(e.target.value)}
                        placeholder="State administrative reason for dismissing this operational directive..."
                        style={{ fontSize: '0.75rem' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setDismissingAlertId(null)}>
                          CANCEL
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDismissAlert(alert.id)}
                          disabled={!dismissReason.trim()}
                        >
                          CONFIRM DISMISSAL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ── SECTION 2: DISPATCH REROUTE APPROVAL (Action Card #102) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/demo')} style={{ backgroundColor: '#059669', borderColor: '#047857' }}>
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
      )}
    </div>
  );
}
