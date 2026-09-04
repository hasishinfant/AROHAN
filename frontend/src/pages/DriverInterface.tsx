import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import { Smartphone, CheckCircle2, AlertTriangle, Shield, Clock, Send, LogOut } from 'lucide-react';

const CONDITIONS = [
  { key: 'CLEAR', label: 'CLEAR', desc: 'Passable road, normal flow' },
  { key: 'SLOW', label: 'SLOW', desc: 'Passable but heavily delayed' },
  { key: 'PARTIAL', label: 'PARTIALLY BLOCKED', desc: 'Single lane open' },
  { key: 'BLOCKED', label: 'BLOCKED', desc: 'Total obstruction / landslip' },
];

export function DriverInterface() {
  const navigate = useNavigate();
  const { shipment, routes, driver_status, driverAcknowledge, driverReport, scenario_step, current_recommendation, logout } = useArohanStore();
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [lang, setLang] = useState<'en' | 'as'>('en');

  const step = scenario_step ?? -1;
  const assignedRoute = routes?.find((r) => r.id === shipment?.assigned_route_id);
  const showAcknowledge = step >= 5 && driver_status === 'NOTIFIED';
  const showReport = step >= 6 && (driver_status === 'ACKNOWLEDGED' || driver_status === 'REPORTING');
  const showRouteChange = step >= 5 && current_recommendation;

  const handleReport = async () => {
    if (!selectedCondition) return;
    await driverReport(selectedCondition, notes || undefined);
    setReportSent(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const textMap = {
    en: {
      title: 'AROHAN FIELD',
      subtitle: 'Driver Mission Execution & Verification',
      driverName: 'Driver: Rahul Kumar (AS-01-A-1234)',
      destination: 'Destination:',
      assignedRoute: 'Assigned Route:',
      eta: 'ETA:',
      updateAlert: 'PROACTIVE ROUTE UPDATE',
      newRoute: 'New Route:',
      ackButton: 'ACKNOWLEDGE NEW ROUTE PLAN',
      reportTitle: 'REPORT FIELD ROAD CONDITION',
      submitBtn: 'SUBMIT FIELD CONDITION REPORT',
      submittedAlert: 'Field observation logged! State update sent to Arohan Replanning Engine.',
    },
    as: {
      title: 'আৰোহণ ফিল্ড (AROHAN FIELD)',
      subtitle: 'চালক অভিযান সম্পাদনা আৰু সত্যতা পৰীক্ষা',
      driverName: 'চালক: ৰাহুল কুমাৰ (AS-01-A-1234)',
      destination: 'গন্তব্যস্থান:',
      assignedRoute: 'নিযুক্ত পথ:',
      eta: 'আনুমানিক সময় (ETA):',
      updateAlert: 'আগতীয়া পথ আপডেটোৰ সতৰ্কবাৰ্তা',
      newRoute: 'নতুন পথ:',
      ackButton: 'নতুন পথ পৰিকল্পনা গ্ৰহণ কৰক',
      reportTitle: 'পথৰ অৱস্থাৰ প্ৰতিবেদন দিয়ক',
      submitBtn: 'প্ৰতিবেদন পঠাওক',
      submittedAlert: 'পথৰ অৱস্থা নথিভুক্ত কৰা হ\'ল! ৰিপ্লেনিং ইঞ্জিনলৈ তথ্য প্ৰেৰণ কৰা হৈছে।',
    },
  };

  const t = textMap[lang];

  return (
    <div style={{ padding: '20px 0', backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <div className="driver-container">
        {/* Mobile Header */}
        <div className="driver-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bfdbfe' }}>
              PORTAL 2 — AROHAN FIELD
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Language Selector */}
              <div style={{ display: 'flex', gap: 4, backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 2, borderRadius: 12 }}>
                <button
                  onClick={() => setLang('en')}
                  style={{
                    border: 'none',
                    background: lang === 'en' ? '#ffffff' : 'transparent',
                    color: lang === 'en' ? '#18221c' : '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('as')}
                  style={{
                    border: 'none',
                    background: lang === 'as' ? '#ffffff' : 'transparent',
                    color: lang === 'as' ? '#18221c' : '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}
                >
                  অসমীয়া
                </button>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                style={{ border: 'none', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: 6, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
            {t.title}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: 2 }}>
            {t.subtitle} · {t.driverName}
          </div>
        </div>

        <div className="driver-body">
          {/* Active Mission Details */}
          {shipment ? (
            <div className="card" style={{ padding: 16 }}>
              <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
                <div className="card-title" style={{ fontSize: '0.9rem' }}>
                  <Smartphone size={16} />
                  <span>ACTIVE MISSION — {shipment.shipment_code}</span>
                </div>
                <span className={`badge ${driver_status === 'ACKNOWLEDGED' ? 'badge-success' : 'badge-warning'}`}>
                  <span className="badge-dot" />
                  <span>{driver_status}</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{t.destination}</span>{' '}
                  <strong style={{ color: 'var(--primary-navy)' }}>{shipment.destination}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{t.assignedRoute}</span>{' '}
                  <strong>{assignedRoute?.name ?? 'NH-6 Corridor'}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-navy)', fontWeight: 700 }}>
                  <Clock size={14} />
                  <span>{t.eta} {shipment.updated_eta ?? shipment.planned_eta}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
              No active shipment loaded.
            </div>
          )}

          {/* Proactive Reroute Alert Notification Banner */}
          {showRouteChange && (
            <div className="card" style={{ backgroundColor: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Shield size={20} style={{ color: 'var(--status-warning-accent)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-warning-text)', textTransform: 'uppercase' }}>
                    {t.updateAlert}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 4 }}>
                    {t.newRoute} <strong>Route B (Ridge Bypass via Sonapur)</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Reason: {current_recommendation?.reason}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Large Primary Action: ACKNOWLEDGE */}
          {showAcknowledge && (
            <button className="btn btn-success btn-lg" onClick={driverAcknowledge} style={{ width: '100%', padding: '14px 0' }}>
              <CheckCircle2 size={20} />
              <span>{t.ackButton}</span>
            </button>
          )}

          {/* Field Condition Reporting Form */}
          {showReport && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <AlertTriangle size={16} style={{ color: 'var(--status-warning-accent)' }} />
                  <span>{t.reportTitle}</span>
                </div>
                <span className="data-tag data-tag-real">FIELD INPUT</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <div className="report-grid">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.key}
                      className={`report-btn ${cond.key === 'BLOCKED' ? 'report-btn-blocked' : ''}`}
                      style={{
                        borderColor: selectedCondition === cond.key ? 'var(--primary-navy)' : undefined,
                        backgroundColor: selectedCondition === cond.key ? 'var(--primary-light)' : undefined,
                      }}
                      onClick={() => setSelectedCondition(cond.key)}
                    >
                      <div style={{ fontSize: '0.85rem' }}>{cond.label}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: 2 }}>{cond.desc}</div>
                    </button>
                  ))}
                </div>

                <input
                  className="form-input"
                  type="text"
                  placeholder="Optional field notes (e.g. mudslide kilometer 42)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleReport}
                  disabled={!selectedCondition || reportSent}
                  style={{ width: '100%' }}
                >
                  <Send size={18} />
                  <span>{reportSent ? 'FIELD REPORT SUBMITTED' : t.submitBtn}</span>
                </button>

                {reportSent && (
                  <div className="alert alert-success" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                    {t.submittedAlert}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
