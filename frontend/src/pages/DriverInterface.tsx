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
  MapPin,
  Volume2,
  Lock,
  Layers,
  Radio,
  UserCheck
} from 'lucide-react';

const CONDITIONS = [
  { key: 'CLEAR', label: 'CLEAR', color: '#047857', bg: '#ecfdf5', desc: 'Passable road, normal flow' },
  { key: 'SLOW', label: 'SLOW', color: '#d97706', bg: '#fffbeb', desc: 'Passable but heavily delayed' },
  { key: 'PARTIAL', label: 'PARTLY BLOCKED', color: '#c05621', bg: '#fff7ed', desc: 'Single lane open only' },
  { key: 'BLOCKED', label: 'BLOCKED', color: '#b91c1c', bg: '#fef2f2', desc: 'Total obstruction / landslip' },
];

export function DriverInterface() {
  const navigate = useNavigate();
  const { shipment, routes, driver_status, driverAcknowledge, driverReport, scenario_step, current_recommendation, logout } = useArohanStore();
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [lang, setLang] = useState<'en' | 'as'>('en');
  const [audioAnnounced, setAudioAnnounced] = useState(false);

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
    <div style={{ backgroundColor: '#f0f4f2', minHeight: '100vh', padding: '16px 12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Mobile Header Bar */}
        <div
          style={{
            backgroundColor: '#0f4c42',
            color: '#ffffff',
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 8px 24px rgba(15, 76, 66, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a7f3d0' }}>
              PORTAL 2 — AROHAN FIELD PWA
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Language Switcher Toggle */}
              <div style={{ display: 'flex', gap: 2, backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 2, borderRadius: 16 }}>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  style={{
                    border: 'none',
                    background: lang === 'en' ? '#ffffff' : 'transparent',
                    color: lang === 'en' ? '#0f4c42' : '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 14,
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
                    color: lang === 'as' ? '#0f4c42' : '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  অসমীয়া
                </button>
              </div>

              {/* Voice Assistance Button */}
              <button
                type="button"
                onClick={toggleAudioHelp}
                style={{
                  border: 'none',
                  backgroundColor: audioAnnounced ? '#ea580c' : 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Voice Assistance"
              >
                <Volume2 size={16} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            {t.title}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#a7f3d0', marginTop: 2, fontWeight: 600 }}>
            {t.subtitle} &nbsp;·&nbsp; {t.driverName}
          </div>
        </div>

        {/* Audio Announcement Alert Banner */}
        {audioAnnounced && (
          <div className="alert alert-info" style={{ backgroundColor: '#fff7ed', borderColor: '#fdba74', color: '#9a3412', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Volume2 size={20} style={{ flexShrink: 0, color: '#ea580c' }} />
            <div>
              <strong>🔊 Voice Assistant Spoken Audio:</strong>
              <div>"{t.audioMsg}"</div>
            </div>
          </div>
        )}

        {/* Active Mission Overview Card */}
        {shipment ? (
          <div className="card" style={{ padding: 20, backgroundColor: '#ffffff', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={18} style={{ color: '#0f4c42' }} />
                <span>MISSION {shipment.shipment_code}</span>
              </div>
              <span className={`badge ${driver_status === 'ACKNOWLEDGED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                {driver_status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>{t.destination}</span>{' '}
                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{shipment.destination}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>{t.assignedRoute}</span>{' '}
                <strong style={{ color: '#0f4c42' }}>{assignedRoute?.name ?? 'NH-6 Corridor'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', padding: '10px 14px', borderRadius: 12, color: '#047857', fontWeight: 800 }}>
                <Clock size={18} />
                <span>{t.eta} {shipment.updated_eta ?? shipment.planned_eta}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
            No active shipment loaded.
          </div>
        )}

        {/* Proactive Reroute Instruction Box */}
        {showRouteChange && (
          <div className="card" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', borderRadius: 20, padding: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Shield size={24} style={{ color: '#ea580c', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t.updateAlert}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {t.newRoute} <strong>Route B (Ridge Bypass via Sonapur)</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 6, lineHeight: 1.5 }}>
                  Reason: {current_recommendation?.reason}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Large Primary Action Button: ACKNOWLEDGE */}
        {showAcknowledge && (
          <button
            type="button"
            className="btn btn-success btn-lg"
            onClick={driverAcknowledge}
            style={{
              width: '100%',
              padding: '18px 0',
              fontSize: '1.05rem',
              fontWeight: 900,
              borderRadius: 24,
              boxShadow: '0 8px 20px rgba(4, 120, 87, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <CheckCircle2 size={24} />
            <span>{t.ackButton}</span>
          </button>
        )}

        {/* LOW-FRICTION FIELD CONDITION REPORTING CARD */}
        {showReport && (
          <div className="card" style={{ padding: 20, backgroundColor: '#ffffff', borderRadius: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} style={{ color: '#ea580c' }} />
                <span>{t.reportTitle}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                {t.autoTelemetry}
              </div>
            </div>

            {/* Auto Telemetry Attachment Metadata Banner */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 14,
                padding: '10px 14px',
                fontSize: '0.72rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}>
                <span style={{ color: '#0f4c42' }}>📍 AUTO-ATTACHED GROUND TELEMETRY</span>
                <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>UNVERIFIED OBSERVATION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 2 }}>
                <div>• <strong>GPS:</strong> 25.82°N, 91.95°E (KM 42)</div>
                <div>• <strong>Driver:</strong> DRIVER-07 (Rahul Kumar)</div>
                <div>• <strong>Mission:</strong> SHP-001 (M1042)</div>
                <div>• <strong>Segment:</strong> SEG-03 (Umiam Pass)</div>
              </div>
            </div>

            {/* 4 Large Touch Condition Buttons (SEE -> TAP -> CONFIRM) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {CONDITIONS.map((cond) => {
                const isSelected = selectedCondition === cond.key;
                return (
                  <button
                    key={cond.key}
                    type="button"
                    onClick={() => setSelectedCondition(cond.key)}
                    style={{
                      border: isSelected ? `3px solid ${cond.color}` : '1.5px solid #cbd5e1',
                      backgroundColor: isSelected ? cond.bg : '#ffffff',
                      borderRadius: 16,
                      padding: 16,
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: isSelected ? `0 4px 14px ${cond.color}33` : '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: cond.color }}>
                      {cond.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginTop: 4 }}>
                      {cond.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Field Notes (Not mandatory) */}
            <input
              className="form-input"
              type="text"
              placeholder="Optional field notes (or leave blank)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ borderRadius: 16, padding: '12px 16px', fontSize: '0.85rem', marginBottom: 14 }}
            />

            {/* Primary Submit Button */}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleReport}
              disabled={!selectedCondition || reportSent}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 20,
                fontSize: '0.95rem',
                fontWeight: 800,
                backgroundColor: reportSent ? '#047857' : '#0f4c42',
              }}
            >
              <Send size={18} />
              <span>{reportSent ? 'OBSERVATION SENT TO SYSTEM' : t.submitBtn}</span>
            </button>

            {reportSent && (
              <div className="alert alert-success" style={{ fontSize: '0.8rem', marginTop: 12, borderRadius: 12 }}>
                {t.submittedAlert}
                <div style={{ fontSize: '0.72rem', marginTop: 4, fontWeight: 600 }}>
                  {t.unverifiedNotice}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
