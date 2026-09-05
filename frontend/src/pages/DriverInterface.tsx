import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Clock,
  Send,
  LogOut,
  Volume2
} from 'lucide-react';

import { MapView } from '../components/Map/MapView';

const CONDITIONS = [
  { key: 'CLEAR', label: 'CLEAR', color: '#15803d', bg: '#f0fdf4', desc: 'Passable road, normal flow' },
  { key: 'SLOW', label: 'SLOW', color: '#b45309', bg: '#fffbeb', desc: 'Passable but heavily delayed' },
  { key: 'PARTIAL', label: 'PARTLY BLOCKED', color: '#ea580c', bg: '#fff7ed', desc: 'Single lane open only' },
  { key: 'BLOCKED', label: 'BLOCKED', color: '#dc2626', bg: '#fef2f2', desc: 'Total obstruction / landslip' },
];

export function DriverInterface() {
  const navigate = useNavigate();
  const { shipment, routes, driver_status, driverAcknowledge, driverReport, scenario_step, current_recommendation, gpsUpdate, logout } = useArohanStore();
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [lang, setLang] = useState<'en' | 'as'>('en');
  const [audioAnnounced, setAudioAnnounced] = useState(false);

  const step = scenario_step ?? -1;
  const assignedRoute = routes?.find((r) => r.id === shipment?.assigned_route_id);
  const showAcknowledge = step >= 5 && driver_status === 'NOTIFIED';
  const showReport = true;
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

  const toggleAudioHelp = () => {
    setAudioAnnounced(true);
    setTimeout(() => setAudioAnnounced(false), 5000);
  };

  const textMap = {
    en: {
      title: 'AROHAN FIELD',
      subtitle: 'Driver Execution & Verification Portal',
      driverName: 'Driver: Rahul Kumar (AS-01-A-1234)',
      destination: 'Destination:',
      assignedRoute: 'Current Route:',
      eta: 'ETA:',
      updateAlert: 'PROACTIVE ROUTE INSTRUCTION',
      newRoute: 'Approved New Route:',
      ackButton: 'ACKNOWLEDGE ROUTE INSTRUCTION',
      reportTitle: 'TAP GROUND CONDITION TO REPORT',
      submitBtn: 'CONFIRM & TRANSMIT REPORT',
      submittedAlert: 'Field observation logged! State update sent to Arohan Replanning Engine.',
      autoTelemetry: 'GPS Location, Timestamp, Vehicle ID & Segment ID attached automatically. Zero typing required.',
      unverifiedNotice: 'Field feedback enters system as UNVERIFIED OBSERVATION to be cross-verified.',
      audioMsg: 'Audio Instruction: Reroute approved to Route B via Sonapur Ridge. Tap green button to acknowledge.',
    },
    as: {
      title: 'আৰোহণ ফিল্ড (AROHAN FIELD)',
      subtitle: 'চালক সম্পাদন আৰু প্ৰত্যক্ষ সত্যতা প্ৰতিবেদন',
      driverName: 'চালক: ৰাহুল কুমাৰ (AS-01-A-1234)',
      destination: 'গন্তব্যস্থান:',
      assignedRoute: 'বৰ্তমান পথ:',
      eta: 'আনুমানিক সময় (ETA):',
      updateAlert: 'আগতীয়া পথ নিৰ্দেশনা',
      newRoute: 'অনুমোদিত নতুন পথ:',
      ackButton: 'নতুন পথ স্বীকাৰ কৰক (ACKNOWLEDGE)',
      reportTitle: 'পথৰ অৱস্থা বাছি লওক (TAP TO REPORT)',
      submitBtn: 'প্ৰতিবেদন পঠাওক (CONFIRM REPORT)',
      submittedAlert: 'পথৰ অৱস্থা নথিভুক্ত কৰা হ\'ল! ৰিপ্লেনিং ইঞ্জিনলৈ তথ্য প্ৰেৰণ কৰা হৈছে।',
      autoTelemetry: 'GPS অৱস্থান, সময়, গাড়ীৰ নম্বৰ আৰু পথৰ অংশ স্বয়ংক্ৰিয়ভাৱে সংযুক্ত।',
      unverifiedNotice: 'প্ৰতিবেদন প্ৰথমতে অসম্পূৰ্ণ/পৰীক্ষাধীন (UNVERIFIED) হিচাপে সংৰক্ষিত হয়।',
      audioMsg: 'শ্রাব্য নিৰ্দেশনা: সোণাপুৰ হৈ বি পথলৈ নিৰ্দেশ দিয়া হৈছে। গ্ৰহণ কৰিবলৈ সেউজীয়া বুটামত টিপক।',
    },
  };

  const t = textMap[lang];

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', padding: '12px', fontFamily: "'Inter', sans-serif" }}>
      <div className="driver-container">
        
        {/* Field App Header Bar */}
        <div className="driver-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#93c5fd' }}>
              AROHAN FIELD MOBILE CONSOLE
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Language Switcher */}
              <div style={{ display: 'flex', gap: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 2 }}>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  style={{
                    border: 'none',
                    background: lang === 'en' ? '#ffffff' : 'transparent',
                    color: lang === 'en' ? '#0f172a' : '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    cursor: 'pointer',
                  }}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('as')}
                  style={{
                    border: 'none',
                    background: lang === 'as' ? '#ffffff' : 'transparent',
                    color: lang === 'as' ? '#0f172a' : '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    cursor: 'pointer',
                  }}
                >
                  অসমীয়া
                </button>
              </div>

              {/* Voice Assistance */}
              <button
                type="button"
                onClick={toggleAudioHelp}
                style={{
                  border: 'none',
                  backgroundColor: audioAnnounced ? '#ea580c' : 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Voice Assistance"
              >
                <Volume2 size={14} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Logout"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>
            {t.title}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#93c5fd', marginTop: 2, fontWeight: 700 }}>
            {t.subtitle} &nbsp;·&nbsp; {t.driverName}
          </div>
        </div>

        {/* Audio Announcement Alert Banner */}
        {audioAnnounced && (
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', padding: '8px 12px', color: '#7c2d12', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={16} style={{ flexShrink: 0, color: '#ea580c' }} />
            <div>
              <strong>🔊 Voice Assistant Spoken Audio:</strong>
              <div>"{t.audioMsg}"</div>
            </div>
          </div>
        )}

        {/* Active Journey Information Table & Real-Time Telemetry */}
        <div style={{ padding: '12px' }}>
          {shipment ? (
            <div className="card" style={{ padding: '12px', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-medium)', paddingBottom: 6 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                  <Smartphone size={14} />
                  <span>MY JOURNEY — {shipment.shipment_code}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="data-tag data-tag-real" style={{ fontSize: '0.62rem' }}>MODE: LAND</span>
                  <span className={`badge ${gpsUpdate?.simulated_status === 'DELIVERED' ? 'badge-success' : 'badge-info'}`}>
                    [{gpsUpdate?.simulated_status || driver_status}]
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {gpsUpdate && (
                <div style={{ backgroundColor: '#f8fafc', padding: 8, border: '1px solid var(--border-medium)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, marginBottom: 4 }}>
                    <span>JOURNEY PROGRESS</span>
                    <span style={{ color: 'var(--primary-blue)' }}>{gpsUpdate.progress_pct}% ({gpsUpdate.distance_covered_km} / {gpsUpdate.total_distance_km} km)</span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${gpsUpdate.progress_pct}%`, height: '100%', backgroundColor: gpsUpdate.progress_pct >= 100 ? '#16a34a' : '#2563eb', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 700 }}>
                    <span>Speed: {gpsUpdate.speed_kmh} km/h ({gpsUpdate.heading_cardinal})</span>
                    <span>ETA: {gpsUpdate.eta_formatted}</span>
                  </div>
                </div>
              )}

              <div className="table-container">
                <table className="table">
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 800, width: '40%', color: 'var(--text-muted)' }}>{t.destination}</td>
                      <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{shipment.destination}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>{t.assignedRoute}</td>
                      <td style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>{assignedRoute?.name ?? 'NH-6 Corridor'}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>{t.eta}</td>
                      <td style={{ fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>{gpsUpdate?.eta_formatted ?? (shipment.updated_eta ?? shipment.planned_eta)}</td>
                    </tr>
                    {gpsUpdate?.current_risk_level && (
                      <tr>
                        <td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>CURRENT RISK</td>
                        <td style={{ fontWeight: 800, color: gpsUpdate.current_risk_level === 'HIGH' ? '#dc2626' : '#16a34a' }}>
                          [{gpsUpdate.current_risk_level} RISK]
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Embedded GIS Navigation Map View */}
              <div style={{ marginTop: 4, height: 280, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                <MapView />
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No active shipment assigned.
            </div>
          )}

          {/* Proactive Reroute Instruction Panel */}
          {showRouteChange && (
            <div className="card" style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5', marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Shield size={18} style={{ color: '#ea580c', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7c2d12', textTransform: 'uppercase' }}>
                    {t.updateAlert}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {t.newRoute} <strong>Route B (Ridge Bypass via Sonapur)</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                    Reason: {current_recommendation?.reason}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Large Action Button: ACKNOWLEDGE */}
          {showAcknowledge && (
            <button
              type="button"
              className="btn btn-success btn-lg"
              onClick={driverAcknowledge}
              style={{
                width: '100%',
                padding: '12px 0',
                marginTop: 10,
                fontSize: '0.9rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{t.ackButton}</span>
            </button>
          )}

          {/* GROUND CONDITION REPORTING PANEL */}
          {showReport && (
            <div className="card" style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                  <AlertTriangle size={14} style={{ color: '#ea580c' }} />
                  <span>{t.reportTitle}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {t.autoTelemetry}
                </div>
              </div>

              {/* Auto Telemetry Attachment Metadata Banner */}
              <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-medium)', padding: '6px 10px', fontSize: '0.68rem', marginBottom: 10 }}>
                <div style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>📍 AUTO-ATTACHED TELEMETRY</div>
                <div>GPS: 25.82°N, 91.95°E (NH-6 KM 42) · Vehicle: TRUCK-07</div>
              </div>

              {/* 4 Touch Condition Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {CONDITIONS.map((cond) => {
                  const isSelected = selectedCondition === cond.key;
                  return (
                    <button
                      key={cond.key}
                      type="button"
                      onClick={() => setSelectedCondition(cond.key)}
                      style={{
                        border: isSelected ? `2px solid ${cond.color}` : '1px solid var(--border-medium)',
                        backgroundColor: isSelected ? cond.bg : '#ffffff',
                        borderRadius: 'var(--radius-sm)',
                        padding: 10,
                        minHeight: 64,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: cond.color }}>
                        [{cond.label}]
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>
                        {cond.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              <input
                className="form-input"
                type="text"
                placeholder="Optional field notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ marginBottom: 10 }}
              />

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleReport}
                disabled={!selectedCondition || reportSent}
                style={{ width: '100%' }}
              >
                <Send size={16} />
                <span>{reportSent ? 'OBSERVATION TRANSMITTED' : t.submitBtn}</span>
              </button>

              {reportSent && (
                <div style={{ fontSize: '0.75rem', marginTop: 8, padding: 8, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', fontWeight: 700 }}>
                  {t.submittedAlert}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
