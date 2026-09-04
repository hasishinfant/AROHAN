import React from 'react';
import { MapView } from '../components/Map/MapView';
import { RiskGauge } from '../components/RiskGauge';
import { EventTimeline } from '../components/EventTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { useArohanStore } from '../stores/arohanStore';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Clock,
  AlertTriangle,
  Radio,
  ArrowRight,
  TrendingDown,
  Activity,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export function CommandCenter() {
  const {
    shipment,
    routes,
    risk_results,
    current_recommendation,
    current_decision,
    events,
    rainfall_data,
    scenario_step,
    kpis,
    approveDecision
  } = useArohanStore();
  const navigate = useNavigate();

  const step = scenario_step ?? -1;
  const riskA = risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'A') : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Hero Section: Featured Pastel Mint Card (Matching Ref Image Top Left) + Quick Overview */}
      <div className="grid-command-center">
        {/* Featured Mint Pastel Card (Ref Image Left Featured Card) */}
        <div className="card-featured-mint" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 800, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Sparkles size={16} />
                <span>AROHAN PROACTIVE DECISION ENGINE</span>
              </div>
              <span className="data-tag data-tag-derived">DERIVED OPTIMIZATION</span>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#092e15', lineHeight: 1.3 }}>
              "Given what is likely to happen next, what should the logistics network do NOW?"
            </div>
            <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: 4, fontWeight: 500 }}>
              Primary Corridor: Guwahati → Shillong (NH-6) · Proactive Reroute Layer
            </div>
          </div>

          {/* Metric Pills inside Featured Card (Matching Lime Pill Metric Badges in Ref Image) */}
          <div className="grid-2" style={{ gap: 12, marginTop: 16 }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: 12, borderRadius: 'var(--radius-md)', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>DELAY AVOIDED</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#092e15', marginTop: 2 }}>
                {kpis?.delay_avoided_h != null ? `${kpis.delay_avoided_h} hrs` : '7.9 hrs'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: 'var(--pill-lime)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: '0.65rem', fontWeight: 800, color: '#1a2e05', marginTop: 4 }}>
                <ArrowUpRight size={12} />
                <span>Optimal Savings</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: 12, borderRadius: 'var(--radius-md)', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>RISK REDUCTION</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#092e15', marginTop: 2 }}>
                {kpis?.risk_exposure_reduced_pct != null ? `-${kpis.risk_exposure_reduced_pct}%` : '-57%'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: '#bbf7d0', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: '0.65rem', fontWeight: 800, color: '#14532d', marginTop: 4 }}>
                <span>Safer Route B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Top Card: Active Mission Status & Action Banner */}
        <div className="card" style={{ justifyContent: 'space-between' }}>
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <div className="card-title">
              <Shield size={16} />
              <span>ACTIVE MISSION & VEHICLE</span>
            </div>
            {shipment && <StatusBadge status={shipment.status} />}
          </div>

          {shipment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>SHIPMENT CODE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{shipment.shipment_code}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>URGENCY</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--status-critical-accent)' }}>
                    Level {shipment.urgency}/5
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'var(--bg-panel)', padding: 10, borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>ORIGIN</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{shipment.origin.split(' ')[0]}</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>DESTINATION</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{shipment.destination.split(' ')[0]}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>ETA</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    {shipment.updated_eta ?? shipment.planned_eta}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active shipment loaded.</div>
          )}

          {/* Action Callout if Decision Pending */}
          {current_decision && current_decision.status === 'PENDING' ? (
            <div style={{ backgroundColor: 'var(--status-warning-bg)', border: '1px solid var(--status-warning-border)', borderRadius: 'var(--radius-md)', padding: 10, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--status-warning-text)' }}>
                Proactive Reroute Recommended (Route B)
              </div>
              <button className="btn btn-success btn-sm" onClick={() => approveDecision(current_decision.id)}>
                APPROVE
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/demo')} style={{ width: '100%', marginTop: 10 }}>
              <Sliders size={14} />
              <span>OPEN SCENARIO CONTROLLER</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map & Intelligence Section (Ref Matched Rounded Panels) */}
      <div className="grid-command-center">
        {/* Map View Panel */}
        <div className="card" style={{ padding: 12 }}>
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <div className="card-title">
              <Radio size={16} />
              <span>CORRIDOR GIS NETWORK MAP</span>
            </div>
            <span className="data-tag data-tag-real">REAL OSM NETWORK</span>
          </div>
          <MapView />
        </div>

        {/* Risk & Events Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk Prediction Panel */}
          {step >= 2 && riskA ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <AlertTriangle size={16} style={{ color: 'var(--status-critical-accent)' }} />
                  <span>ENVIRONMENTAL DISRUPTION RISK</span>
                </div>
                <span className="data-tag data-tag-derived">DERIVED ML</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <RiskGauge
                  probability={riskA.disruption_probability}
                  confidence={riskA.confidence}
                  label="Route A Risk"
                  size={125}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem' }}>
                  <div><strong>Prediction Horizon:</strong> {riskA.horizon_h} Hours</div>
                  <div><strong>Confidence:</strong> {riskA.confidence}</div>
                  <div><strong>Risk Segment:</strong> NH-6 Umiam Zone</div>
                  {rainfall_data && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Rainfall: {rainfall_data.intensity_mmh} mm/h
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ backgroundColor: 'var(--bg-panel)' }}>
              <div className="card-title" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                TELEMETRY & RISK MONITORING
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Monitoring environmental telemetry. Advance scenario to step 2 to trigger risk prediction.
              </div>
            </div>
          )}

          {/* Event History Log */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">
                <Activity size={16} />
                <span>DECISION & NETWORK TIMELINE</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
                VIEW ALL
              </button>
            </div>
            <EventTimeline events={events} maxItems={3} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
