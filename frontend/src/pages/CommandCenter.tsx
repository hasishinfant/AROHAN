import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Truck,
  MapPin,
  RefreshCw,
  GitCompare,
  FileText
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
    isConnected,
    approveDecision
  } = useArohanStore();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const step = scenario_step ?? -1;
  const riskA = risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'A') : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 1. LIVE SYSTEM OPERATIONAL CLOCK & PROVENANCE BAR */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          backgroundColor: '#ffffff',
          borderRadius: 20,
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              {isConnected ? 'LIVE WEBSOCKET STREAM' : 'CONNECTING...'}
            </span>
          </div>

          <div style={{ width: 1, height: 18, backgroundColor: '#cbd5e1' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#047857' }}>
            <Clock size={16} />
            <span>SYSTEM TIME: {currentTime} IST</span>
          </div>
        </div>

        {/* Data Classification Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="data-tag data-tag-real">LIVE IMD RAINFALL</span>
          <span className="data-tag data-tag-real">REAL OSM GEOMETRY</span>
          <span className="data-tag data-tag-derived">DERIVED DECISION ENGINE</span>
        </div>
      </div>

      {/* 2. LIVE OPERATIONS METRICS COUNTERS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        <div className="card" style={{ padding: 14, backgroundColor: '#ffffff', borderRadius: 16 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ACTIVE MISSIONS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0b2545', marginTop: 2 }}>1</div>
          <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: 700, marginTop: 2 }}>SHP-001 (Medical)</div>
        </div>

        <div className="card" style={{ padding: 14, backgroundColor: step >= 2 ? '#fef2f2' : '#ffffff', borderColor: step >= 2 ? '#fecaca' : '#cbd5e1', borderRadius: 16 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: step >= 2 ? '#991b1b' : '#64748b', textTransform: 'uppercase' }}>AT-RISK MISSIONS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: step >= 2 ? '#b91c1c' : '#0b2545', marginTop: 2 }}>{step >= 2 ? 1 : 0}</div>
          <div style={{ fontSize: '0.65rem', color: step >= 2 ? '#b91c1c' : '#64748b', fontWeight: 700, marginTop: 2 }}>{step >= 2 ? 'Route A NH-6 78%' : 'Nominal'}</div>
        </div>

        <div className="card" style={{ padding: 14, backgroundColor: current_decision?.status === 'PENDING' ? '#fffbeb' : '#ffffff', borderColor: current_decision?.status === 'PENDING' ? '#fde68a' : '#cbd5e1', borderRadius: 16 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: current_decision?.status === 'PENDING' ? '#9a3412' : '#64748b', textTransform: 'uppercase' }}>PENDING DECISIONS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: current_decision?.status === 'PENDING' ? '#d97706' : '#0b2545', marginTop: 2 }}>
            {current_decision?.status === 'PENDING' ? 1 : 0}
          </div>
          <div style={{ fontSize: '0.65rem', color: current_decision?.status === 'PENDING' ? '#d97706' : '#64748b', fontWeight: 700, marginTop: 2 }}>
            {current_decision?.status === 'PENDING' ? 'Action Required' : 'All Clear'}
          </div>
        </div>

        <div className="card" style={{ padding: 14, backgroundColor: '#ffffff', borderRadius: 16 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>CRITICAL CORRIDORS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0b2545', marginTop: 2 }}>1</div>
          <div style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 700, marginTop: 2 }}>Guwahati–Shillong</div>
        </div>

        <div className="card" style={{ padding: 14, backgroundColor: step >= 7 ? '#fef2f2' : '#ffffff', borderRadius: 16 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>FIELD REPORTS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: step >= 7 ? '#b91c1c' : '#0b2545', marginTop: 2 }}>{step >= 7 ? 1 : 0}</div>
          <div style={{ fontSize: '0.65rem', color: step >= 7 ? '#b91c1c' : '#64748b', fontWeight: 700, marginTop: 2 }}>{step >= 7 ? 'Route A BLOCKED' : 'No Reports'}</div>
        </div>

        <div className="card" style={{ padding: 14, backgroundColor: '#ffffff', borderRadius: 16 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ROUTE CHANGES</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857', marginTop: 2 }}>{step >= 5 ? 1 : 0}</div>
          <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: 700, marginTop: 2 }}>{step >= 5 ? 'Route B Approved' : 'Original Route'}</div>
        </div>
      </div>

      {/* 3. HERO DECISION FEATURE & ACTIVE MISSION BANNER */}
      <div className="grid-command-center">
        {/* Featured Decision Card */}
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

          {/* Metric Pills inside Featured Card */}
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
              <Truck size={16} />
              <span>ACTIVE MISSION & VEHICLE TELEMETRY</span>
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

      {/* 4. MAIN MAP & INTELLIGENCE SECTION */}
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

          {/* Operational Event History Log */}
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
