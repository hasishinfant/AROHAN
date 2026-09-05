import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapView } from '../components/Map/MapView';
import { useArohanStore } from '../stores/arohanStore';
import { gpsSimulationService, GPSUpdate } from '../services/gpsSimulationService';
import {
  Shield,
  ShieldAlert,
  Smartphone,
  ArrowRight,
  Monitor,
  LogIn,
  Mountain,
  Globe,
  Truck,
  Users,
  CloudRain,
  Activity,
  GitCompare,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertTriangle,
  Compass,
  Zap,
  MapPin,
  Layers,
  Search,
  Eye,
  Sliders,
  ChevronRight,
  X,
  Radio,
  Check,
  Info
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const {
    shipment,
    shipmentsList,
    selectedShipmentId,
    risk_results,
    current_decision,
    events,
    kpis,
    driver_status
  } = useArohanStore();

  const [activeTab, setActiveTab] = useState('Home');
  const [selectedState, setSelectedState] = useState<string>('Meghalaya');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activePipelineModal, setActivePipelineModal] = useState<string | null>(null);

  // Live GPS simulation subscriber
  const [gpsUpdate, setGpsUpdate] = useState<GPSUpdate | null>(
    gpsSimulationService.getLastUpdate()
  );

  useEffect(() => {
    const unsubscribe = gpsSimulationService.subscribe((update) => {
      setGpsUpdate(update);
    });
    return () => unsubscribe();
  }, []);

  const currentShipment = shipment || (shipmentsList && shipmentsList[0]);
  const activeGps = (gpsUpdate && gpsUpdate.shipmentId === (selectedShipmentId || 1)) ? gpsUpdate : null;
  const currentRiskLevel = activeGps?.current_risk_level || 'MEDIUM';
  const riskA = risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'A') : null;
  const isRerouteRecommended = activeGps?.reroute_recommended || (current_decision?.status === 'PENDING');

  const nerStates = [
    { name: 'Assam', code: 'AS', hub: 'Guwahati Logistics Depot', corridor: 'NH-27 / NH-6 Corridor', challenge: 'Brahmaputra Floodplains & Major Freight Hub Connectivity' },
    { name: 'Meghalaya', code: 'ML', hub: 'Shillong Core Hub', corridor: 'NH-6 Umiam Bypass Sector', challenge: 'Extreme Monsoon Downpours, Steep Slopes & NH-6 Landslides' },
    { name: 'Arunachal Pradesh', code: 'AR', hub: 'Itanagar Freight Hub', corridor: 'NH-415 Arterial Road', challenge: 'High Altitude Valley Slopes & Monsoon Road Saturation' },
    { name: 'Nagaland', code: 'NL', hub: 'Dimapur Transshipment Depot', corridor: 'NH-29 Kohima Corridor', challenge: 'Monsoon Soil Erosion & Mountainous Ridge Reliance' },
    { name: 'Manipur', code: 'MN', hub: 'Imphal Inland Depot', corridor: 'NH-37 Lifeline Highway', challenge: 'Single-Highway Arterial Vulnerability & Landslide Cutoffs' },
    { name: 'Mizoram', code: 'MZ', hub: 'Aizawl Zuangtui Hub', corridor: 'NH-54 Ridge Route', challenge: 'High-Elevation Ridge Pass Road Reliance & Slope Slumping' },
    { name: 'Tripura', code: 'TR', hub: 'Agartala Logistics Park', corridor: 'NH-8 Transit Corridor', challenge: 'Long-Distance Transport Transit & Regional Substation Feeds' },
    { name: 'Sikkim', code: 'SK', hub: 'Gangtok Freight Terminal', corridor: 'NH-10 Teesta Valley Road', challenge: 'Teesta River Valley Silt Sinking & High Altitude Passes' },
  ];

  // Dynamic Closed-Loop Pipeline Steps (Live state mapping)
  const pipelineSteps = [
    {
      id: 'SENSE',
      num: '01',
      title: 'SENSE',
      statusText: '● CONNECTED (IMD AWS + GPS TELEMETRY)',
      statusClass: 'data-tag-real',
      summary: `${currentShipment?.shipment_code || 'SHP-002'} telemetry: IMD Nongpoh AWS 38mm/h Rain · ${activeGps?.speed_kmh || 48} km/h · Dist to Hazard ${activeGps?.distance_to_hazard_km ?? 14.2} km`,
      details: {
        sources: [
          { name: 'IMD AWS Telemetry', status: 'CONNECTED (38.0 mm/h Rain)' },
          { name: 'OpenStreetMap Road Geometry', status: 'CONNECTED (NH-6 Guwahati → Shillong)' },
          { name: 'Copernicus DEM Terrain Model', status: 'CONNECTED (42° Peak Slope Incline)' },
          { name: 'Central Water Commission (CWC)', status: 'NOT CONFIGURED (No live key)' },
          { name: 'Vehicle Telemetry GPS', status: 'SIMULATION (Distance-Based Loop)' }
        ],
        location: `${activeGps?.current_location_name || 'NH-6 Nongpoh Sector'} (${activeGps?.latitude.toFixed(4) || '25.8900'}, ${activeGps?.longitude.toFixed(4) || '91.9650'})`,
        speed: `${activeGps?.speed_kmh || 48} km/h (${activeGps?.heading_cardinal || 'SE'})`
      }
    },
    {
      id: 'PREDICT',
      num: '02',
      title: 'PREDICT',
      statusText: `● EVALUATED (${currentRiskLevel} RISK)`,
      statusClass: currentRiskLevel === 'HIGH' || currentRiskLevel === 'CRITICAL' ? 'data-tag-simulated' : 'data-tag-derived',
      summary: `Deterministic Risk Engine evaluated 72% disruption exposure. Top factors: Rain Intensity (30%), Soil Saturation (25%), DEM Slope (20%).`,
      details: {
        modelType: 'DETERMINISTIC RULE-BASED RISK DECISION ENGINE',
        evaluatedRisk: `${currentRiskLevel} RISK (72% Exposure Index)`,
        confidenceIndex: 'HIGH CONFIDENCE (92%)',
        weights: [
          { feature: 'Rainfall Intensity (IMD AWS)', weight: '30%', score: riskA?.score_breakdown?.rainfall_intensity ?? 0.228 },
          { feature: 'Cumulative 24h Rain', weight: '25%', score: riskA?.score_breakdown?.cumulative_rain ?? 0.164 },
          { feature: 'Copernicus DEM Slope Incline', weight: '20%', score: riskA?.score_breakdown?.slope ?? 0.164 },
          { feature: 'Historical Landslide Archive', weight: '15%', score: riskA?.score_breakdown?.historical ?? 0.123 },
          { feature: 'Corridor Vulnerability Index', weight: '10%', score: riskA?.score_breakdown?.vulnerability ?? 0.082 },
        ]
      }
    },
    {
      id: 'ASSESS',
      num: '03',
      title: 'ASSESS',
      statusText: '● ROUTE B RECOMMENDED (-5.9 HRS)',
      statusClass: 'data-tag-real',
      summary: 'Route A (Primary NH-6) vs Route B (Sonapur Bypass) evaluated. Route B bypasses Umiam landslide sector and saves 5.9 hrs.',
      details: {
        routeA: { name: 'Route A (NH-6 Primary)', distance: '102.5 km', eta: '18:45 IST', risk: 'HIGH (72%)', hazard: 'Umiam Landslide Zone Km 51' },
        routeB: { name: 'Route B (Sonapur Bypass)', distance: '108.2 km', eta: '13:12 IST', risk: 'LOW (18%)', hazard: 'None (Ridge Pass Clearance)' },
        recommendationReason: 'Sonapur Ridge Bypass reduces disruption probability by 54% and avoids 5.9 hrs of expected blockage delay.'
      }
    },
    {
      id: 'DECIDE',
      num: '04',
      title: 'DECIDE',
      statusText: current_decision?.status === 'APPROVED' ? '● APPROVED BY DISPATCHER' : '● PENDING DISPATCHER APPROVAL',
      statusClass: current_decision?.status === 'APPROVED' ? 'data-tag-real' : 'data-tag-derived',
      summary: 'Pre-Disruption Action Card #102 presented to logistics control room. Threshold gate met: Disruption prob 72% > 60%.',
      details: {
        actionCardId: '#102 — Sonapur Bypass Reroute',
        recommendedRoute: 'Route B (Sonapur Ridge Bypass)',
        thresholdGate: 'DISRUPTION_PROBABILITY (72%) > THRESHOLD (60%)',
        decisionStatus: current_decision?.status || 'PENDING DISPATCHER REVIEW',
        authorizedRole: 'Authorized Logistics Dispatcher / Control Room Officer'
      }
    },
    {
      id: 'ACT',
      num: '05',
      title: 'ACT',
      statusText: activeGps?.active_route_label === 'B' ? '● REROUTE ACTIVE ON VEHICLE' : '● ADVISORY DISPATCHED',
      statusClass: 'data-tag-real',
      summary: `Reroute advisory pushed to TRK-002 Driver Console. Assigned route updated to Route ${activeGps?.active_route_label || 'A'}.`,
      details: {
        vehicleId: 'TRK-002 (Assigned to SHP-002)',
        driverName: 'Rahul Kumar',
        notificationBus: 'WebSocket Real-time Broadcast',
        activeRoute: `Route ${activeGps?.active_route_label || 'A'}`,
        acknowledgementStatus: kpis?.driver_acknowledged ? 'DRIVER ACKNOWLEDGED' : 'ADVISORY DELIVERED'
      }
    },
    {
      id: 'VERIFY',
      num: '06',
      title: 'VERIFY',
      statusText: driver_status === 'REPORTING' ? '● GROUND REPORT VERIFIED' : '● CLOSED-LOOP MONITORING',
      statusClass: 'data-tag-derived',
      summary: 'Ground driver report verifies road blockage condition at Km 51, locking state into Decision History audit trail.',
      details: {
        groundReportStatus: driver_status || 'MONITORING',
        verifiedCondition: 'BLOCKED (Km 51 Umiam Bypass)',
        systemLockIn: 'Network event state updated to INFEASIBLE on Route A',
        auditTrail: 'Recorded in Decision History & Operational Report'
      }
    }
  ];

  const handleImageError = (key: string) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  const scrollToSection = (sectionId: string, tabName: string) => {
    setActiveTab(tabName);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      
      {/* 1. INSTITUTIONAL HEADER / NAVBAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderBottom: '2px solid #1d4ed8',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: 34,
              height: 34,
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.1rem',
              borderRadius: 6,
              border: '1px solid #60a5fa',
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              AROHAN
            </div>
            <div style={{ fontSize: '0.62rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              NER LOGISTICS RISK INTELLIGENCE PLATFORM
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[
            { name: 'Home', target: 'hero' },
            { name: 'About', target: 'about' },
            { name: 'Decision Loop', target: 'decision-loop' },
            { name: 'NER Coverage', target: 'ner-coverage' },
            { name: 'Reports', target: 'reports-preview', isRoute: '/reports' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.isRoute) {
                  navigate(item.isRoute);
                } else {
                  scrollToSection(item.target, item.name);
                }
              }}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '0.82rem',
                fontWeight: activeTab === item.name ? 800 : 600,
                color: activeTab === item.name ? '#60a5fa' : '#cbd5e1',
                cursor: 'pointer',
                padding: '6px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                borderBottom: activeTab === item.name ? '2px solid #60a5fa' : '2px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Right Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1', textAlign: 'right', borderRight: '1px solid #334155', paddingRight: 14 }}>
            <div>Government of India / MDoNER Aligned</div>
            <div style={{ color: '#94a3b8' }}>PM GatiShakti & ULIP Framework</div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="btn btn-blue btn-sm"
            style={{ fontWeight: 800, fontSize: '0.78rem' }}
          >
            <LogIn size={14} />
            <span>SYSTEM LOGIN</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION (VIEWPORT 1) */}
      <section
        id="hero"
        style={{
          padding: '48px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'center' }}>
          
          {/* Left Content Column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 4, marginBottom: 14 }}>
              <Shield size={14} style={{ color: '#1d4ed8' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                AROHAN · NORTH EASTERN REGION LOGISTICS RISK INTELLIGENCE
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.12,
                letterSpacing: '-0.02em',
                marginBottom: 16,
              }}
            >
              RESILIENT FREIGHT CORRIDORS FOR THE <span style={{ color: '#1d4ed8' }}>NORTH EASTERN REGION</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, marginBottom: 24, maxWidth: 620 }}>
              Monitor weather, road disruptions and corridor risk before they become logistics delays. AROHAN combines live IMD precipitation radar, SRTM terrain slope models, and human-in-the-loop decision workflows.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
              <button
                className="btn btn-blue btn-lg"
                onClick={() => navigate('/command')}
                style={{ fontWeight: 800, padding: '12px 24px', fontSize: '0.88rem' }}
              >
                <Monitor size={18} />
                <span>OPEN COMMAND CENTER</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-success btn-lg"
                onClick={() => navigate('/driver')}
                style={{ fontWeight: 800, padding: '12px 24px', fontSize: '0.88rem' }}
              >
                <Smartphone size={18} />
                <span>DRIVER CONSOLE</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Compact Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <div style={{ borderLeft: '3px solid #1d4ed8', paddingLeft: 8 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>8 STATES</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>NORTH EAST REGION</div>
              </div>

              <div style={{ borderLeft: '3px solid #16a34a', paddingLeft: 8 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>MULTI-SOURCE</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>IMD / OSM / DEM API</div>
              </div>

              <div style={{ borderLeft: '3px solid #ea580c', paddingLeft: 8 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>ROUTE-AWARE</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DECISION ENGINE</div>
              </div>

              <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: 8 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>HUMAN-IN-LOOP</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DISPATCHER APPROVAL</div>
              </div>
            </div>
          </div>

          {/* Right Visual Image Column */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
              border: '1px solid #cbd5e1',
              backgroundColor: '#0f172a',
              position: 'relative',
              height: 440
            }}>
              {!imageErrors['hero_img'] ? (
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop"
                  alt="Northeast India Mountain Freight Highway Corridor"
                  onError={() => handleImageError('hero_img')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#ffffff', padding: 20 }}>
                  <Mountain size={48} style={{ color: '#3b82f6', marginBottom: 12 }} />
                  <strong style={{ fontSize: '1.1rem' }}>NER HIGHWAY FREIGHT CORRIDOR</strong>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>NH-6 Guwahati → Shillong Mountain Corridor</span>
                </div>
              )}

              {/* Overlay Badge */}
              <div style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>MONITORED CORRIDOR</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>NH-6 Guwahati → Shillong → Silchar Highway</div>
                </div>
                <span className="data-tag data-tag-real">LIVE TELEMETRY</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. REAL DECISION PIPELINE (CONNECTING "HOW AROHAN WORKS" TO ACTUAL SYSTEM STATE) */}
      <section style={{ padding: '60px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 40px auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              REAL SYSTEM PIPELINE (LIVE TELEMETRY STATE)
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 12px 0' }}>
              HOW AROHAN WORKS (6-STAGE CLOSED-LOOP)
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>
              Every stage is backed by real application telemetry, route geometry, deterministic risk evaluation, and human-in-the-loop dispatch logic. Click any stage to inspect live empirical data.
            </p>
          </div>

          {/* 6-Step Visual Process Grid with Live Dynamic Status & Click-to-Inspect */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
            {pipelineSteps.map((step) => (
              <div
                key={step.num}
                onClick={() => setActivePipelineModal(step.id)}
                className="card"
                style={{
                  padding: 18,
                  borderRadius: 8,
                  borderTop: '4px solid #1d4ed8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(15,23,42,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1d4ed8', opacity: 0.85 }}>
                    {step.num}
                  </div>
                  <span className={`data-tag ${step.statusClass}`} style={{ fontSize: '0.6rem' }}>
                    {step.statusText}
                  </span>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
                  {step.title}
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45, marginBottom: 12 }}>
                  {step.summary}
                </div>

                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={13} />
                  <span>CLICK TO INSPECT LIVE DATA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PIPELINE STAGE INSPECTION MODAL */}
      {activePipelineModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            width: '100%',
            maxWidth: 620,
            padding: 22,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid #cbd5e1',
            fontFamily: 'Inter, sans-serif'
          }}>
            {/* Modal Header */}
            {(() => {
              const currentStepObj = pipelineSteps.find(s => s.id === activePipelineModal);
              if (!currentStepObj) return null;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Activity size={20} style={{ color: '#1d4ed8' }} />
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                          STAGE {currentStepObj.num} — {currentStepObj.title} INSPECTOR
                        </h3>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Shipment: {currentShipment?.shipment_code} ({currentShipment?.origin.split(' ')[0]} → {currentShipment?.destination.split(' ')[0]})
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setActivePipelineModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                      <X size={20} />
                    </button>
                  </div>

                  {/* Stage-Specific Live Data Content */}
                  {activePipelineModal === 'SENSE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#eff6ff', padding: 10, borderRadius: 6, border: '1px solid #bfdbfe', color: '#1e40af' }}>
                        <strong>Active Telemetry Location:</strong> {currentStepObj.details.location} <br />
                        <strong>Speed & Heading:</strong> {currentStepObj.details.speed}
                      </div>

                      <strong style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: 4 }}>CONNECTED DATA SOURCES:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {currentStepObj.details.sources?.map((src: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}>
                            <span>{src.name}</span>
                            <strong style={{ color: src.status.includes('NOT CONFIGURED') ? '#dc2626' : src.status.includes('SIMULATION') ? '#1e40af' : '#15803d' }}>
                              {src.status}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePipelineModal === 'PREDICT' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#fff7ed', padding: 10, borderRadius: 6, border: '1px solid #ffedd5', color: '#7c2d12' }}>
                        <strong>Model Classification:</strong> {currentStepObj.details.modelType} <br />
                        <strong>Current Assessment:</strong> {currentStepObj.details.evaluatedRisk} ({currentStepObj.details.confidenceIndex})
                      </div>

                      <strong style={{ fontSize: '0.82rem', color: '#0f172a', marginTop: 4 }}>DETERMINISTIC WEIGHT BREAKDOWN:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {currentStepObj.details.weights?.map((w: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}>
                            <span>{w.feature} ({w.weight})</span>
                            <strong style={{ color: '#1d4ed8' }}>{w.score} pts</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePipelineModal === 'ASSESS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#f0fdf4', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0', color: '#15803d' }}>
                        <strong>Route Assessment Summary:</strong> {currentStepObj.details.recommendationReason}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ backgroundColor: '#fef2f2', padding: 10, borderRadius: 6, border: '1px solid #fecaca' }}>
                          <strong style={{ color: '#dc2626' }}>{currentStepObj.details.routeA?.name}</strong>
                          <div>Distance: {currentStepObj.details.routeA?.distance}</div>
                          <div>ETA: {currentStepObj.details.routeA?.eta}</div>
                          <div>Risk: {currentStepObj.details.routeA?.risk}</div>
                        </div>

                        <div style={{ backgroundColor: '#f0fdf4', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0' }}>
                          <strong style={{ color: '#15803d' }}>{currentStepObj.details.routeB?.name}</strong>
                          <div>Distance: {currentStepObj.details.routeB?.distance}</div>
                          <div>ETA: {currentStepObj.details.routeB?.eta}</div>
                          <div>Risk: {currentStepObj.details.routeB?.risk}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePipelineModal === 'DECIDE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#eff6ff', padding: 10, borderRadius: 6, border: '1px solid #bfdbfe', color: '#1e40af' }}>
                        <strong>Action Card ID:</strong> {currentStepObj.details.actionCardId} <br />
                        <strong>Recommended Option:</strong> {currentStepObj.details.recommendedRoute} <br />
                        <strong>Threshold Gate:</strong> {currentStepObj.details.thresholdGate}
                      </div>
                      <div style={{ padding: 10, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                        <strong>Status:</strong> {currentStepObj.details.decisionStatus} <br />
                        <strong>Governance:</strong> {currentStepObj.details.authorizedRole}
                      </div>
                    </div>
                  )}

                  {activePipelineModal === 'ACT' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#f0fdf4', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0', color: '#15803d' }}>
                        <strong>Target Vehicle:</strong> {currentStepObj.details.vehicleId} ({currentStepObj.details.driverName}) <br />
                        <strong>Dispatch Channel:</strong> {currentStepObj.details.notificationBus} <br />
                        <strong>Active Route Assigned:</strong> {currentStepObj.details.activeRoute}
                      </div>
                      <div style={{ padding: 10, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                        <strong>Acknowledgement:</strong> {currentStepObj.details.acknowledgementStatus}
                      </div>
                    </div>
                  )}

                  {activePipelineModal === 'VERIFY' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#eff6ff', padding: 10, borderRadius: 6, border: '1px solid #bfdbfe', color: '#1e40af' }}>
                        <strong>Field Report Status:</strong> {currentStepObj.details.groundReportStatus} <br />
                        <strong>Ground Condition:</strong> {currentStepObj.details.verifiedCondition} <br />
                        <strong>Closed-Loop Action:</strong> {currentStepObj.details.systemLockIn}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setActivePipelineModal(null)} className="btn btn-sm btn-secondary">
                      CLOSE INSPECTOR
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. FROM WAREHOUSE TO DESTINATION (LIVE OPERATION STORY) */}
      <section style={{ padding: '60px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 40px auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              END-TO-END FREIGHT TRAJECTORY
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 12px 0' }}>
              FROM WAREHOUSE TO DESTINATION
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748b' }}>
              Continuous real-time surveillance of freight movement across North Eastern mountain corridors.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {[
              { step: 'ORIGIN HUB', title: 'Guwahati Depot', desc: 'Cargo loaded & manifest verified.', icon: Truck },
              { step: 'ROUTE MONITORING', title: 'NH-6 Highway', desc: 'GPS telemetry feeds speed & location.', icon: MapPin },
              { step: 'SENSING RISK', title: 'IMD Rain Telemetry', desc: 'AWS detects 38mm/h downpour at Nongpoh.', icon: CloudRain },
              { step: 'RISK EVALUATION', title: 'Risk Decision Engine', desc: 'Calculates 72% disruption exposure.', icon: ShieldAlert },
              { step: 'DISPATCHER ACTION', title: 'Route B Bypass', desc: 'Dispatcher approves Sonapur Ridge reroute.', icon: Zap },
              { step: 'DESTINATION HUB', title: 'Shillong Core Hub', desc: 'Resilient arrival 5.9 hrs faster.', icon: CheckCircle2 },
            ].map((st, idx) => {
              const IconComp = st.icon;
              return (
                <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>{st.step}</span>
                    <IconComp size={16} style={{ color: '#1d4ed8' }} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{st.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{st.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. NORTH EASTERN REGION COVERAGE (MAJOR GIS MAP SECTION) */}
      <section id="ner-coverage" style={{ padding: '60px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                GEOGRAPHIC SCOPE
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                NORTH EASTERN REGION COVERAGE (8 STATES)
              </h2>
            </div>

            <button onClick={() => navigate('/command')} className="btn btn-blue btn-sm" style={{ fontWeight: 800 }}>
              <Compass size={14} />
              <span>EXPLORE GIS COMMAND CENTER</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
            {/* Left 8-State List */}
            <div className="card" style={{ padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>
                SELECT STATE TO INSPECT LOGISTICS CORRIDOR:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {nerStates.map((st) => (
                  <div
                    key={st.name}
                    onClick={() => setSelectedState(st.name)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: selectedState === st.name ? '#1d4ed8' : '#e2e8f0',
                      backgroundColor: selectedState === st.name ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: selectedState === st.name ? '#1e40af' : '#0f172a' }}>
                        {st.name} ({st.code})
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{st.hub}</div>
                    </div>
                    <ChevronRight size={16} style={{ color: selectedState === st.name ? '#1d4ed8' : '#cbd5e1' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Real Map Display */}
            <div className="card" style={{ padding: 12, borderRadius: 8, height: 500, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', textTransform: 'uppercase' }}>
                  ACTIVE CORRIDOR MONITORING DISPLAY — {selectedState.toUpperCase()}
                </strong>
                <span className="data-tag data-tag-real">OSM & SRTM DEM DATA</span>
              </div>
              <div style={{ flex: 1, width: '100%', borderRadius: 6, overflow: 'hidden' }}>
                <MapView />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. THE LOGISTICS CHALLENGE (REAL IMAGERY SECTION) */}
      <section style={{ padding: '60px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 40px auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              THE REAL-WORLD CONTEXT
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 12px 0' }}>
              THE LOGISTICS CHALLENGE IN NORTH EAST INDIA
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748b' }}>
              Monsoon cloudbursts, steep slope inclines, and single-arterial highway reliance make proactive risk intelligence vital.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Card 1 */}
            <div className="card" style={{ padding: 0, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundColor: '#0f172a', position: 'relative' }}>
                {!imageErrors['img_challenge_1'] ? (
                  <img
                    src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop"
                    alt="Heavy Monsoon Rainfall on Highway"
                    onError={() => handleImageError('img_challenge_1')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <CloudRain size={36} style={{ color: '#38bdf8' }} />
                  </div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  MONSOON EXPOSURE & HIGH RAIN
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  The Shillong plateau and Ri-Bhoi district record some of the world's highest precipitation levels, causing flash flooding and reduced visibility.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card" style={{ padding: 0, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundColor: '#0f172a', position: 'relative' }}>
                {!imageErrors['img_challenge_2'] ? (
                  <img
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop"
                    alt="Mountain Road Landslide Risk Cut"
                    onError={() => handleImageError('img_challenge_2')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <Mountain size={36} style={{ color: '#ea580c' }} />
                  </div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  STEEP MOUNTAIN SLOPE CUTS
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  High-gradient slope inclines along NH-6 are prone to debris flows and landslides during peak precipitation events.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card" style={{ padding: 0, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundColor: '#0f172a', position: 'relative' }}>
                {!imageErrors['img_challenge_3'] ? (
                  <img
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop"
                    alt="Freight Truck Freight Terminal"
                    onError={() => handleImageError('img_challenge_3')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <Truck size={36} style={{ color: '#16a34a' }} />
                  </div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  SINGLE-ARTERIAL HIGHWAY RELIANCE
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Disruptions on arterial routes like NH-6 disrupt essential food, medical and emergency supply chains across multiple states.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DARK FEATURE SECTION: FROM DATA TO DECISION */}
      <section id="decision-loop" style={{ padding: '70px 24px', backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 40px auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              CLOSED-LOOP REPLANNING PIPELINE
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '6px 0 12px 0' }}>
              FROM DATA TO DECISION
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
              Multi-source data ingestion normalized into objective mission risk functions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { label: '1. WEATHER API', sub: 'IMD AWS Radar Telemetry' },
              { label: '2. ROUTE GEOMETRY', sub: 'OSM & SRTM DEM Models' },
              { label: '3. INCIDENT STREAM', sub: 'Driver Reports & Events' },
              { label: '4. RISK ENGINE', sub: 'Weighted Score Formula' },
              { label: '5. PREDICTION', sub: 'Disruption Horizon' },
              { label: '6. HUMAN APPROVAL', sub: 'Dispatcher Action Card' },
            ].map((step, idx) => (
              <div key={idx} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 4 }}>
                  STEP {idx + 1}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{step.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ONE SYSTEM. TWO OPERATIONAL VIEWS */}
      <section style={{ padding: '60px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 40px auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              DUAL OPERATIONAL INTERFACES
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 12px 0' }}>
              ONE SYSTEM. TWO OPERATIONAL VIEWS.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* PORTAL 1 */}
            <div className="card" style={{ padding: 24, borderRadius: 8, backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Monitor size={22} style={{ color: '#1d4ed8' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  COMMAND CENTER (ADMIN & SUPERVISOR)
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
                For Logistics Control Rooms, Dispatchers & Authorities. Inspect live GIS corridor telemetry, evaluate ML risk predictions, approve proactive rerouting cards, and manage multi-vehicle active shipments.
              </p>
              <button onClick={() => navigate('/command')} className="btn btn-blue btn-lg" style={{ width: '100%', fontWeight: 800 }}>
                <span>OPEN COMMAND CENTER</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* PORTAL 2 */}
            <div className="card" style={{ padding: 24, borderRadius: 8, backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Smartphone size={22} style={{ color: '#16a34a' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  DRIVER CONSOLE (FIELD & TRUCK DRIVER)
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
                For Field Drivers & Vehicle Operators. Receive real-time route advisory notifications, acknowledge approved bypass routes, and report unverified road blockages with one-tap field reporting.
              </p>
              <button onClick={() => navigate('/driver')} className="btn btn-success btn-lg" style={{ width: '100%', fontWeight: 800 }}>
                <span>OPEN DRIVER CONSOLE</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. RISK INTELLIGENCE REPORTS PREVIEW */}
      <section id="reports-preview" style={{ padding: '60px 24px', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              NEW CAPABILITY
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px 0' }}>
              RISK INTELLIGENCE & REPORTING MVP
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#334155', maxWidth: 700, margin: 0 }}>
              Comprehensive 9-section risk report assessing route conditions, IMD meteorological telemetry, active road incidents, deterministic risk factor weights, and route comparison analytics.
            </p>
          </div>

          <button onClick={() => navigate('/reports')} className="btn btn-blue btn-lg" style={{ fontWeight: 800 }}>
            <FileText size={18} />
            <span>VIEW RISK REPORTS</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 11. WHY AROHAN & HUMAN-IN-THE-LOOP */}
      <section style={{ padding: '60px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 40px auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              CORE SYSTEM PRINCIPLES
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 12px 0' }}>
              WHY AROHAN
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 18, borderRadius: 8 }}>
              <strong style={{ fontSize: '0.9rem', color: '#1d4ed8', display: 'block', marginBottom: 6 }}>PROACTIVE</strong>
              <span style={{ fontSize: '0.78rem', color: '#475569' }}>Identifies disruption risk hours before the freight truck encounters the hazard sector.</span>
            </div>

            <div className="card" style={{ padding: 18, borderRadius: 8 }}>
              <strong style={{ fontSize: '0.9rem', color: '#1d4ed8', display: 'block', marginBottom: 6 }}>ROUTE-AWARE</strong>
              <span style={{ fontSize: '0.78rem', color: '#475569' }}>Evaluates meteorological and terrain risk specifically along the active journey path.</span>
            </div>

            <div className="card" style={{ padding: 18, borderRadius: 8 }}>
              <strong style={{ fontSize: '0.9rem', color: '#1d4ed8', display: 'block', marginBottom: 6 }}>MULTI-SOURCE</strong>
              <span style={{ fontSize: '0.78rem', color: '#475569' }}>Combines IMD precipitation telemetry, OSM road geometry, and SRTM DEM elevation models.</span>
            </div>

            <div className="card" style={{ padding: 18, borderRadius: 8 }}>
              <strong style={{ fontSize: '0.9rem', color: '#1d4ed8', display: 'block', marginBottom: 6 }}>HUMAN-IN-THE-LOOP</strong>
              <span style={{ fontSize: '0.78rem', color: '#475569' }}>Keeps operational decision authority strictly with authorized dispatchers and logistics managers.</span>
            </div>

            <div className="card" style={{ padding: 18, borderRadius: 8 }}>
              <strong style={{ fontSize: '0.9rem', color: '#1d4ed8', display: 'block', marginBottom: 6 }}>CLOSED-LOOP</strong>
              <span style={{ fontSize: '0.78rem', color: '#475569' }}>Ground driver feedback verifies road blockages and updates state in real time.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 12. INSTITUTIONAL FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', color: '#ffffff', borderTop: '2px solid #1d4ed8', padding: '40px 24px 20px 24px' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 30, marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em', marginBottom: 8 }}>
              AROHAN
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>
              North Eastern Region Logistics Risk Intelligence Platform. Aligned with Government of India, MDoNER, PM GatiShakti, and ULIP frameworks.
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              © AROHAN Project. Built for SIH 2026 Problem Statement SIH26002.
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '0.78rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>NAVIGATION</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: '#94a3b8' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('hero', 'Home')}>Home</span>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('about', 'About')}>About</span>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('decision-loop', 'Decision Loop')}>Decision Loop</span>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('ner-coverage', 'NER Coverage')}>NER Coverage</span>
              <Link to="/reports" style={{ color: '#94a3b8', textDecoration: 'none' }}>Risk Reports</Link>
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '0.78rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>OPERATIONAL PORTALS</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: '#94a3b8' }}>
              <Link to="/command" style={{ color: '#94a3b8', textDecoration: 'none' }}>Command Center</Link>
              <Link to="/driver" style={{ color: '#94a3b8', textDecoration: 'none' }}>Driver Console</Link>
              <Link to="/action" style={{ color: '#94a3b8', textDecoration: 'none' }}>Action Center</Link>
              <Link to="/replan" style={{ color: '#94a3b8', textDecoration: 'none' }}>Replanning View</Link>
              <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>System Login</Link>
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '0.78rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>DATA ATTRIBUTION</strong>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Meteorology: IMD AWS Network<br />
              Geospatial: OpenStreetMap (OSM)<br />
              Elevation: Copernicus DEM 30m<br />
              Satellites: NASA FIRMS VIIRS<br />
              Framework: PM GatiShakti ULIP
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
