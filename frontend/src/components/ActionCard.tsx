import React from 'react';
import { DecisionData, RouteData } from '../types';
import { Shield, ArrowRight, CheckCircle2, XCircle, Edit3, AlertTriangle } from 'lucide-react';

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
    <div className="card" style={{ borderColor: isPending ? 'var(--status-warning-border)' : 'var(--border-medium)', backgroundColor: 'var(--bg-surface)' }}>
      {/* Header */}
      <div className="card-header" style={{ borderBottomColor: 'var(--border-medium)', paddingBottom: 10 }}>
        <div>
          <div className="card-title" style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
            <Shield size={16} />
            <span>ACTION CARD — REROUTING DECISION #DEC-{String(decision.id).padStart(4, '0')}</span>
          </div>
          <div className="card-subtitle">
            Issued: {new Date(decision.created_at).toLocaleTimeString()} IST
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className={`badge ${decision.decision_type === 'PROACTIVE' ? 'badge-amber' : 'badge-info'}`}>
            [{decision.decision_type} ACTION]
          </span>
          <span className="data-tag data-tag-derived">DERIVED ML</span>
        </div>
      </div>

      {/* Structured Tradeoff Table */}
      <div className="table-container" style={{ marginBottom: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th>OPTION</th>
              <th>CORRIDOR ROUTE</th>
              <th>LOSS SCORE</th>
              <th>EXPECTED DELAY</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 800, color: '#dc2626' }}>CURRENT ({routeA?.label ?? 'A'})</td>
              <td style={{ fontWeight: 700 }}>{routeA?.name ?? 'NH-6 via Umiam Corridor'}</td>
              <td style={{ fontWeight: 800, color: '#dc2626' }}>{decision.mission_score_current.toFixed(0)}</td>
              <td style={{ fontWeight: 700, color: '#dc2626' }}>+{decision.expected_delay_h.toFixed(1)} hrs</td>
              <td><span className="badge badge-critical">[HIGH RISK]</span></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 800, color: '#16a34a' }}>RECOMMENDED ({routeB?.label ?? 'B'})</td>
              <td style={{ fontWeight: 700 }}>{routeB?.name ?? 'Ridge Bypass via Sonapur'}</td>
              <td style={{ fontWeight: 800, color: '#16a34a' }}>{decision.mission_score_recommended.toFixed(0)}</td>
              <td style={{ fontWeight: 700, color: '#16a34a' }}>0.0 hrs (Optimal)</td>
              <td><span className="badge badge-success">[RECOMMENDED]</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rationale Box */}
      <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '8px 12px', marginBottom: 12, borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7c2d12', textTransform: 'uppercase', marginBottom: 2 }}>
          RECOMMENDATION RATIONALE
        </div>
        <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
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
              <CheckCircle2 size={15} />
              <span>APPROVE REROUTE</span>
            </button>
            {onModify && (
              <button className="btn btn-secondary" onClick={onModify} style={{ flex: 1 }}>
                <Edit3 size={15} />
                <span>MODIFY PLAN</span>
              </button>
            )}
            <button className="btn btn-danger" onClick={onReject} style={{ flex: 1 }}>
              <XCircle size={15} />
              <span>REJECT</span>
            </button>
          </>
        ) : (
          <div className={`badge ${decision.status === 'APPROVED' ? 'badge-success' : 'badge-critical'}`} style={{ width: '100%', padding: '8px 12px', justifyContent: 'center', fontSize: '0.8rem' }}>
            {decision.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>DECISION {decision.status} BY DISPATCHER</span>
          </div>
        )}
      </div>
    </div>
  );
}
