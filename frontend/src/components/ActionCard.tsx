import React from 'react';
import { DecisionData, RouteData } from '../types';
import { Shield, ArrowRight, CheckCircle2, XCircle, Edit3, Clock, AlertTriangle, FileText } from 'lucide-react';

interface ActionCardProps {
  decision: DecisionData;
  routes: RouteData[];
  onApprove: () => void;
  onReject: () => void;
  onModify?: () => void;
}

export function ActionCard({ decision, routes, onApprove, onReject, onModify }: ActionCardProps) {
  const routeA = routes.find((r) => r.id === decision.current_route_id);
  const routeB = routes.find((r) => r.id === decision.recommended_route_id);
  const isPending = decision.status === 'PENDING';

  return (
    <div className="card" style={{ borderColor: isPending ? 'var(--status-warning-border)' : 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
      {/* Header */}
      <div className="card-header" style={{ borderBottomColor: 'var(--border-subtle)', paddingBottom: 12 }}>
        <div>
          <div className="card-title" style={{ color: 'var(--primary-navy)', fontSize: '1.05rem' }}>
            <Shield size={18} style={{ color: 'var(--primary-navy)' }} />
            <span>ACTION CARD — REROUTING RECOMMENDATION</span>
          </div>
          <div className="card-subtitle">
            Decision ID: DEC-{String(decision.id).padStart(4, '0')} · Issued: {new Date(decision.created_at).toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${decision.decision_type === 'PROACTIVE' ? 'badge-warning' : 'badge-info'}`}>
            <span className="badge-dot" />
            <span>{decision.decision_type} ACTION</span>
          </span>
          <span className="data-tag data-tag-derived">DERIVED</span>
        </div>
      </div>

      {/* Structured Fields Grid */}
      <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: 10, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            SHIPMENT & ROUTE PARAMETERS
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4, color: 'var(--text-main)' }}>
            Shipment: SHP-001 (Medical & Disaster Relief Supplies)
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Origin: Guwahati GST Depot → Destination: Shillong Core Hub
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', padding: 10, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            RISK & PREDICTION HORIZON
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-critical-text)', marginTop: 4 }}>
            Disruption Risk: {(decision.disruption_probability * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Confidence: {decision.confidence} · Horizon: {decision.horizon_h} Hours Ahead
          </div>
        </div>
      </div>

      {/* Route Comparison Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', backgroundColor: 'var(--bg-base)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
        <div style={{ padding: 8, backgroundColor: 'var(--status-critical-bg)', border: '1px solid var(--status-critical-border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--status-critical-text)', textTransform: 'uppercase' }}>
            CURRENT ROUTE ({routeA?.label ?? 'A'})
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
            {routeA?.name ?? 'NH-6 via Umiam Corridor'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-critical-text)', marginTop: 2 }}>
            Loss Score: {decision.mission_score_current.toFixed(0)} · Expected Delay: +{decision.expected_delay_h.toFixed(1)}h
          </div>
        </div>

        <div style={{ color: 'var(--primary-navy)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ArrowRight size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>RECOMMENDED</span>
        </div>

        <div style={{ padding: 8, backgroundColor: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--status-success-text)', textTransform: 'uppercase' }}>
            RECOMMENDED ROUTE ({routeB?.label ?? 'B'})
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
            {routeB?.name ?? 'Ridge Bypass via Sonapur'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-success-text)', marginTop: 2 }}>
            Loss Score: {decision.mission_score_recommended.toFixed(0)} · Safer Route
          </div>
        </div>
      </div>

      {/* Rationale Box */}
      <div style={{ backgroundColor: 'var(--status-warning-bg)', border: '1px solid var(--status-warning-border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-warning-text)', textTransform: 'uppercase', marginBottom: 2 }}>
          RECOMMENDATION REASONING
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
          "{decision.reason}"
        </div>
      </div>

      {/* Decision Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {decision.status === 'DEFERRED' || decision.decision_type === 'HUMAN_REVIEW_REQUIRED' ? (
          <div className="alert alert-warning" style={{ width: '100%', alignItems: 'center' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>HUMAN REVIEW REQUIRED (CONFIDENCE GATED)</strong><br />
              System gating rule enforced: Prediction confidence is <strong>LOW</strong> (below <strong>MEDIUM</strong> threshold). Auto-reroute recommendation gated. Deferred to dispatcher manual review.
            </div>
          </div>
        ) : isPending ? (
          <>
            <button className="btn btn-success" onClick={onApprove} style={{ flex: 1 }}>
              <CheckCircle2 size={16} />
              <span>APPROVE REROUTE</span>
            </button>
            {onModify && (
              <button className="btn btn-secondary" onClick={onModify} style={{ flex: 1 }}>
                <Edit3 size={16} />
                <span>MODIFY PLAN</span>
              </button>
            )}
            <button className="btn btn-danger" onClick={onReject} style={{ flex: 1 }}>
              <XCircle size={16} />
              <span>REJECT</span>
            </button>
          </>
        ) : (
          <div className={`alert ${decision.status === 'APPROVED' ? 'alert-success' : 'alert-critical'}`} style={{ width: '100%', alignItems: 'center' }}>
            {decision.status === 'APPROVED' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <div>
              <strong>DECISION {decision.status}</strong> by Dispatcher
              {decision.approved_at && ` at ${new Date(decision.approved_at).toLocaleTimeString()}`}
              {decision.modifier_notes && ` — Notes: "${decision.modifier_notes}"`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
