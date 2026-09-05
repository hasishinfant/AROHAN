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
  Volume2,
  CheckCheck,
  MapPin,
  Truck,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { MapView } from '../components/Map/MapView';

const CONDITIONS = [
  { key: 'CLEAR', label: 'CLEAR', color: '#15803d', bg: '#f0fdf4', desc: 'Passable road, normal flow' },
  { key: 'SLOW', label: 'SLOW', color: '#b45309', bg: '#fffbeb', desc: 'Passable but heavily delayed' },
  { key: 'PARTIAL', label: 'PARTLY BLOCKED', color: '#ea580c', bg: '#fff7ed', desc: 'Single lane open only' },
  { key: 'BLOCKED', label: 'BLOCKED', color: '#dc2626', bg: '#fef2f2', desc: 'Total obstruction / landslip' },
];

const HAZARD_TYPES = [
  { id: 'LANDSLIDE', label: 'Landslide / Debris' },
  { id: 'FLOOD', label: 'Water Surge / Inundation' },
  { id: 'ROAD_BLOCKED', label: 'Stuck Freight / Blockage' },
  { id: 'BRIDGE_DAMAGE', label: 'Bridge / Culvert Hazard' },
];

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'as', label: 'অসমীয়া', full: 'Assamese' },
  { code: 'mizo', label: 'Mizo', full: 'Mizo ṭawng' },
  { code: 'kha', label: 'Khasi', full: 'Ka Ktien Khasi' },
  { code: 'mni', label: 'মৈতৈলোন্', full: 'Meitei' },
  { code: 'brx', label: 'बड़ो', full: 'Bodo' },
  { code: 'bn', label: 'বাংলা', full: 'Bengali' },
];

export function DriverInterface() {
  const navigate = useNavigate();
  const {
    shipment,
    routes,
    driver_status,
    driverAcknowledge,
    driverReport,
    reportDriverIssue,
    scenario_step,
    current_recommendation,
    gpsUpdate,
    logout,
  } = useArohanStore();

  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedHazardType, setSelectedHazardType] = useState<string>('LANDSLIDE');
  const [notes, setNotes] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [lang, setLang] = useState<string>('en');
  const [audioAnnounced, setAudioAnnounced] = useState(false);
  const [waAcknowledged, setWaAcknowledged] = useState(false);

  const step = scenario_step ?? -1;
  const assignedRoute = routes?.find((r) => r.id === shipment?.assigned_route_id);
  const showRouteChange = step >= 5 || Boolean(current_recommendation);

  const handleReport = async () => {
    if (!selectedCondition) return;
    try {
      await reportDriverIssue({
        movement_code: shipment?.shipment_code || 'REL-001',
        driver_id: 1,
        issue_type: selectedHazardType,
        condition: selectedCondition,
        location_name: 'NH-6 Sector km 48 near Umiam Lake',
        lat: gpsUpdate?.latitude || 25.682,
        lon: gpsUpdate?.longitude || 91.905,
        notes: notes || undefined,
      });
      await driverReport(selectedCondition, notes || undefined);
      setReportSent(true);
      setTimeout(() => setReportSent(false), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWhatsAppAck = async () => {
    await driverAcknowledge();
    setWaAcknowledged(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleAudioHelp = () => {
    setAudioAnnounced(true);
    setTimeout(() => setAudioAnnounced(false), 6000);
  };

  // Multilingual UI dictionaries
  const textMap: Record<string, any> = {
    en: {
      title: 'AROHAN FIELD CONSOLE',
      subtitle: 'Driver Execution & Hazard Reporting Portal',
      driverName: 'Driver: Rahul Kumar (AS-01-A-1234)',
      destination: 'Destination:',
      assignedRoute: 'Assigned Corridor:',
      eta: 'ETA:',
      waHeader: 'OFFICIAL WHATSAPP DISPATCH RECEIVED',
      waDesc: 'Route diversion verified by Regional Disaster Command.',
      waAckBtn: 'ACKNOWLEDGE ROUTE VIA WHATSAPP',
      waAckDone: 'Route Acknowledged! State Command Notified.',
      reportTitle: 'TAP GROUND CONDITION TO REPORT',
      submitBtn: 'CONFIRM & TRANSMIT REPORT',
      submittedAlert: 'Observation transmitted to AROHAN Regional Command! Corroboration active.',
      autoTelemetry: 'GPS Location, Timestamp, Vehicle ID & Corridor ID attached automatically.',
      unverifiedNotice: 'Field feedback enters as UNVERIFIED OBSERVATION to prevent spoofing.',
      audioMsg: 'Audio Instruction: Reroute approved to Route B via Sonapur Ridge. Maintain 40 km/h.',
    },
    as: {
      title: 'আৰোহণ ফিল্ড মোবাইল কনচোল',
      subtitle: 'চালক সম্পাদন আৰু জৰুৰী প্ৰতিবেদন পৰ্টেল',
      driverName: 'চালক: ৰাহুল কুমাৰ (AS-01-A-1234)',
      destination: 'গন্তব্যস্থান:',
      assignedRoute: 'নিৰ্ধাৰিত পথ:',
      eta: 'আনুমানিক সময় (ETA):',
      waHeader: 'হোৱাটছএপ জৰুৰী সাহায্য নিৰ্দেশনা প্ৰাপ্ত হ\'ল',
      waDesc: 'দুৰ্যোগ ব্যৱস্থাপনা কোষে আপোনাৰ পথ সলনি অনুমোদন কৰিছে।',
      waAckBtn: 'হোৱাটছএপ যোগে পথ স্বীকাৰ কৰক (ACKNOWLEDGE)',
      waAckDone: 'নতুন পথ গ্ৰহণ কৰা হ\'ল! কৰ্তৃপক্ষলৈ তথ্য প্ৰেৰণ সম্পন্ন।',
      reportTitle: 'পথৰ অৱস্থা বাছি লওক (TAP GROUND CONDITION)',
      submitBtn: 'প্ৰতিবেদন নিশ্চিত আৰু প্ৰেৰণ কৰক',
      submittedAlert: 'পথৰ তথ্য আৰোহণ আঞ্চলিক কমাণ্ডলৈ প্ৰেৰণ কৰা হ\'ল!',
      autoTelemetry: 'GPS অৱস্থান, সময়, বাহনৰ নম্বৰ স্বয়ংক্ৰিয়ভাৱে সংযুক্ত হৈছে।',
      unverifiedNotice: 'প্ৰতিবেদন প্ৰথমতে পৰীক্ষাধীন (UNVERIFIED) হিচাপে সংৰক্ষিত হয়।',
      audioMsg: 'শ্রাব্য নিৰ্দেশনা: সোণাপুৰ হৈ বি পথলৈ নিৰ্দেশ দিয়া হৈছে। নতুন পথ অনুসৰণ কৰক।',
    },
    mizo: {
      title: 'AROHAN FIELD MOBILE CONSOLE',
      subtitle: 'Driver Execution & Chhiatrup Hriattirna Portal',
      driverName: 'Khalhtu: Rahul Kumar (AS-01-A-1234)',
      destination: 'Thlenna Tur:',
      assignedRoute: 'Kalna Kawng:',
      eta: 'Thlen Hun (ETA):',
      waHeader: 'WHATSAPP TANPUI HRIATTIRNA THAR',
      waDesc: 'Disaster Management Authority in kawng thar a approve ta.',
      waAckBtn: 'WHATSAPP HMANGIN KAWNG PAWN RAWH',
      waAckDone: 'Kawng thar pawm a ni ta! State Command hriattir a ni.',
      reportTitle: 'KAWNG AWMDAN HRIATTIR RAWH',
      submitBtn: 'HRIATTIRNA THAWN NGHAL RAWH',
      submittedAlert: 'Arohan Command ah kawng awmdan thawn fel a ni!',
      autoTelemetry: 'GPS hmun, hun leh motor number a in-attach nghal.',
      unverifiedNotice: 'Hriattirna hi finfiah hmasak phawt tur a ni ang.',
      audioMsg: 'Audio Instruction: Kawng thar him zawk Route B Sonapur lam zawh rawh le.',
    },
    kha: {
      title: 'AROHAN FIELD CONSOLE',
      subtitle: 'Portal ba pynpoi khubor lynti shngain',
      driverName: 'Driver: Rahul Kumar (AS-01-A-1234)',
      destination: 'Jaka Leit:',
      assignedRoute: 'Ka Lynti ba la ai:',
      eta: 'Por ba thikna (ETA):',
      waHeader: 'JINGPYNTHIKNA KYRNGIEH HA WHATSAPP',
      waDesc: 'La pynkylla ia ka lynti da ka Disaster Management Authority.',
      waAckBtn: 'PYNDEP JINGPYNTHIKNA HA WHATSAPP',
      waAckDone: 'La pdiang ia ka lynti bathymmai!',
      reportTitle: 'BUH JINGTIP SHAPHANG KA LYNTI',
      submitBtn: 'PHAH JINGTIP SHA KORTIPHON',
      submittedAlert: 'La pynpoi ia ka khubor sha AROHAN Command!',
      autoTelemetry: 'GPS bad Vehicle ID la thep beit dalade.',
      unverifiedNotice: 'Ka jingtip kan leit kum UNVERIFIED shuwa ban da pynskhem.',
      audioMsg: 'Audio: Sngewbha bud ia ka lynti bathymmai Route B lyngba Sonapur.',
    },
    mni: {
      title: 'অৰোহান ফিল্ড মোবাইল কন্সোল',
      subtitle: 'লমজিং অমসুং খুদোংথিবা পাউজেল পোৰ্টেল',
      driverName: 'গাড়ী থৌবা: Rahul Kumar (AS-01-A-1234)',
      destination: 'য়ৌফম মফম:',
      assignedRoute: 'চৎফম লম্বী:',
      eta: 'মতম (ETA):',
      waHeader: 'WHATSAPP ইমর্জেন্সী রিলীফ পাউজেল ফংলে',
      waDesc: 'ডিজাস্টার ম্যানেজমেন্টনা অনৌবা লম্বী অয়াবা পীখ্রে।',
      waAckBtn: 'লম্বী অসি অয়াবা পীয়ু (ACKNOWLEDGE)',
      waAckDone: 'অনৌবা লম্বী খন্দোক্লে! কম্মাণ্ডদা পাউ পীখ্রে।',
      reportTitle: 'লম্বীগী ফীভম খন্দোক্তুনা পাউ পীবীয়ু',
      submitBtn: 'পাউজেল খুদক্তা থাপীয়ু',
      submittedAlert: 'অৰোহান কম্মাণ্ডদা লম্বীগী ফীভম য়ৌখ্রে!',
      autoTelemetry: 'GPS অমসুং মতম মশামক য়াওখ্রে।',
      unverifiedNotice: 'পাউজেল অসি অহানবদা অচুম-অরান থিজিনগনি।',
      audioMsg: 'সোণাপুৰ লম্বীদা অনৌবা সেফ রুট ফিল্ডদা চৎপীয়ু।',
    },
    brx: {
      title: 'AROHAN फील्ड मोबाइल कनसोल',
      subtitle: 'लामा बिथोन आरो खौरां फोरमायग्रा',
      driverName: 'थांदै सालायग्रा: Rahul Kumar (AS-01-A-1234)',
      destination: 'थांनांगौ जायगा:',
      assignedRoute: 'मोननाय लामा:',
      eta: 'सम (ETA):',
      waHeader: 'WHATSAPP खौरां मोनहैबाय',
      waDesc: 'आपद ब्यवस्थापनाव गोदान लामा फोसावबाय।',
      waAckBtn: 'गोदान लामाखौ रोखा खालाम (ACKNOWLEDGE)',
      waAckDone: 'गोदान लामाखौ रोखा खालामबाय!',
      reportTitle: 'लामाखौ नायना खौरां हर',
      submitBtn: 'खौरां रोखा खालामना दैथाय',
      submittedAlert: 'AROHAN कमान्दाव लामानि खौरां मोनहैबाय!',
      autoTelemetry: 'GPS जायगा आरो सम गावआरि रोखा जाना दं।',
      unverifiedNotice: 'गिबियाव बे खौरांआ आनजाद जासिगोन।',
      audioMsg: 'गोदान लामा Route B जों मोजांयै थां।',
    },
    bn: {
      title: 'আরোহণ ফিল্ড মোবাইল কনসোল',
      subtitle: 'ড্রাইভার নির্দেশনা ও গ্রাউন্ড রিপোর্ট পোর্টাল',
      driverName: 'চালক: রাহুল কুমার (AS-01-A-1234)',
      destination: 'গন্তব্যস্থল:',
      assignedRoute: 'নির্ধারিত রুট:',
      eta: 'পৌঁছানোর সময় (ETA):',
      waHeader: 'হোয়াটসঅ্যাপ জরুরী ত্রাণ বার্তা প্রাপ্ত হয়েছে',
      waDesc: 'দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষ নতুন নিরাপদ রুট বরাদ্দ করেছে।',
      waAckBtn: 'হোয়াটসঅ্যাপ রুট গ্রহণ করুন (ACKNOWLEDGE)',
      waAckDone: 'নতুন রুট গৃহীত হয়েছে! স্টেট কমান্ডকে অবহিত করা হয়েছে।',
      reportTitle: 'রাস্তার বর্তমান পরিস্থিতি নির্বাচন করুন',
      submitBtn: 'রিপোর্ট নিশ্চিত ও প্রেরণ করুন',
      submittedAlert: 'রাস্তার পরিস্থিতি আরোহণ আঞ্চলিক কমান্ডে প্রেরণ করা হয়েছে!',
      autoTelemetry: 'GPS অবস্থান, সময় ও গাড়ির নম্বর স্বয়ংক্রিয়ভাবে সংযুক্ত।',
      unverifiedNotice: 'রিপোর্ট প্রাথমিকভাবে যাঁচাইকরণাধীন (UNVERIFIED) হিসেবে সংরক্ষিত হয়।',
      audioMsg: 'নির্দেশনা: সোনাপুর রিজ দিয়ে রুট বি অনুসরণ করুন।',
    },
  };

  const t = textMap[lang] || textMap.en;

  return (
    <div style={{ backgroundColor: '#0B131E', minHeight: '100vh', padding: '12px', fontFamily: "'Inter', sans-serif", color: '#F1F5F9' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* FIELD CONSOLE TOP HEADER */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid #334155',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#F8FAFC' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                  SIH26002 • Relief Convoy Operator Unit
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={toggleAudioHelp}
                style={{
                  backgroundColor: audioAnnounced ? '#059669' : '#334155',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Play Audio Assistance"
              >
                <Volume2 size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/command')}
                style={{
                  backgroundColor: '#334155',
                  border: 'none',
                  color: '#94A3B8',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Command
              </button>
            </div>
          </div>

          {/* AUDIO ASSISTANCE TOAST */}
          {audioAnnounced && (
            <div
              style={{
                backgroundColor: '#064E3B',
                border: '1px solid #059669',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.72rem',
                color: '#D1FAE5',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Volume2 size={16} style={{ color: '#34D399', flexShrink: 0 }} />
              <span>{t.audioMsg}</span>
            </div>
          )}

          {/* MULTILINGUAL REGIONAL LANGUAGE SELECTOR BAR */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
            {LANGUAGE_OPTIONS.map((item) => {
              const isActive = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  style={{
                    border: 'none',
                    borderRadius: 6,
                    backgroundColor: isActive ? '#059669' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    padding: '4px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.full}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CONVOY SUMMARY CARD */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: 14,
            padding: '14px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: '#064E3B',
                color: '#6EE7B7',
                border: '1px solid #059669',
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              {shipment?.shipment_code || 'REL-001'} (DISASTER RELIEF)
            </span>
            <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700 }}>
              {t.eta} {shipment?.updated_eta || shipment?.planned_eta || '13:12 IST'}
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 2 }}>
            {shipment?.cargo_type || 'Emergency Medical Supplies & Kits'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: 10 }}>
            {t.driverName}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: '0.72rem',
            }}
          >
            <div>
              <div style={{ color: '#64748B', fontSize: '0.65rem' }}>FROM</div>
              <div style={{ fontWeight: 700, color: '#E2E8F0' }}>
                {shipment?.origin?.split('(')[0] || 'Guwahati Depot'}
              </div>
            </div>
            <ArrowRight size={14} style={{ color: '#059669' }} />
            <div>
              <div style={{ color: '#64748B', fontSize: '0.65rem' }}>TO</div>
              <div style={{ fontWeight: 700, color: '#E2E8F0' }}>
                {shipment?.destination?.split('(')[0] || 'Shillong Hub'}
              </div>
            </div>
          </div>
        </div>

        {/* INCOMING SIMULATED WHATSAPP CARD */}
        <div
          style={{
            backgroundColor: '#064E3B',
            border: '1.5px solid #059669',
            borderRadius: 14,
            padding: '14px',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <MessageSquare size={13} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#A7F3D0' }}>
                {t.waHeader}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#D1FAE5' }}>
                {t.waDesc}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#005C4B',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: '0.78rem',
              color: '#F0FDF4',
              lineHeight: 1.5,
              marginBottom: 10,
              border: '1px solid #047857',
            }}
          >
            {lang === 'as' && (
              <div>
                ⚠️ <strong>আৰোহণ জৰুৰী সাহায্য নিৰ্দেশ:</strong> বাহন REL-001। ভূমিস্খলনৰ বাবে আপোনাৰ পথ সলনি কৰা হৈছে।
                <br />• নতুন নিৰ্ধাৰিত সুৰক্ষিত পথ: <strong>Route B (Sonapur Ridge Highland Corridor)</strong>
                <br />• সাহায্য গন্তব্য: শ্বিলং কোৰ হাব (Shillong Core Relief Hub)
              </div>
            )}
            {lang === 'mizo' && (
              <div>
                ⚠️ <strong>AROHAN CHHIATRUP TANPUI HRIATTIRNA:</strong> REL-001 phurh kawng thlak nghal a ni.
                <br />• Kawng thar him zawk: <strong>Route B (Sonapur Ridge Highland Corridor)</strong>
                <br />• Thlenna tur: Shillong Core Relief Hub
              </div>
            )}
            {lang === 'kha' && (
              <div>
                ⚠️ <strong>AROHAN JINGPYNTHIKNA KYRNGIEH:</strong> REL-001 la pynkylla lynti namar landslide ha NH-6.
                <br />• Ka lynti ba shngain: <strong>Route B (Sonapur Ridge Highland Corridor)</strong>
                <br />• Ka jaka leit: Shillong Core Relief Hub
              </div>
            )}
            {lang === 'mni' && (
              <div>
                ⚠️ <strong>অৰোহান ইমর্জেন্সী রিলীফ পাউজেল:</strong> REL-001 গী লম্বী অহোংবা লাক্লে।
                <br />• অনৌবা সেফ ওইবা লম্বী: <strong>Route B (Sonapur Ridge Highland Corridor)</strong>
              </div>
            )}
            {lang === 'brx' && (
              <div>
                ⚠️ <strong>AROHAN खौरां:</strong> REL-001 नि लामाया सोलायबाय।
                <br />• गोदान रैखाथिगोनां लामा: <strong>Route B (Sonapur Ridge Highland Corridor)</strong>
              </div>
            )}
            {lang === 'bn' && (
              <div>
                ⚠️ <strong>আরোহণ জরুরী ত্রাণ বার্তা:</strong> কনভয় REL-001 এর রুট পরিবর্তিত হয়েছে।
                <br />• নতুন নির্ধারিত নিরাপদ রুট: <strong>Route B (Sonapur Ridge Highland Corridor)</strong>
                <br />• গন্তব্য: শিলং কোর রিলিফ হাব
              </div>
            )}
            {lang === 'en' && (
              <div>
                ⚠️ <strong>AROHAN EMERGENCY RELIEF DISPATCH:</strong> Movement REL-001 rerouted due to slope failure at NH-6 km 48.
                <br />• Assigned Safe Corridor: <strong>Route B (Sonapur Ridge Highland Bypass)</strong>
                <br />• Destination: Shillong Core Relief Hub
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4, fontSize: '0.62rem', color: '#8696A0' }}>
              <span>Just now</span>
              <CheckCheck size={12} style={{ color: '#53BDEB' }} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppAck}
            disabled={waAcknowledged}
            style={{
              width: '100%',
              backgroundColor: waAcknowledged ? '#047857' : '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: waAcknowledged ? 'default' : 'pointer',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{waAcknowledged ? t.waAckDone : t.waAckBtn}</span>
          </button>
        </div>

        {/* ONE-TAP FIELD GROUND CONDITION & INCIDENT REPORTER */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: 14,
            padding: '14px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F8FAFC' }}>
              {t.reportTitle}
            </span>
          </div>

          {/* Hazard Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            {HAZARD_TYPES.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedHazardType(h.id)}
                style={{
                  border: `1px solid ${selectedHazardType === h.id ? '#059669' : '#334155'}`,
                  borderRadius: 8,
                  backgroundColor: selectedHazardType === h.id ? '#064E3B' : '#0F172A',
                  color: selectedHazardType === h.id ? '#A7F3D0' : '#94A3B8',
                  padding: '7px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Condition Severity Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
            {CONDITIONS.map((c) => {
              const isSelected = selectedCondition === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCondition(c.key)}
                  style={{
                    borderRadius: 8,
                    border: `1.5px solid ${isSelected ? c.color : '#334155'}`,
                    backgroundColor: isSelected ? c.color : '#0F172A',
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                    padding: '8px 4px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Optional Observation Notes */}
          <input
            type="text"
            placeholder="Notes: e.g., 20m debris on carriageway km 48..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: '0.74rem',
              color: '#F8FAFC',
              outline: 'none',
              marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />

          <button
            type="button"
            onClick={handleReport}
            disabled={!selectedCondition}
            style={{
              width: '100%',
              backgroundColor: selectedCondition ? '#DC2626' : '#475569',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: selectedCondition ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={15} />
            <span>{t.submitBtn}</span>
          </button>

          {reportSent && (
            <div
              style={{
                marginTop: 10,
                padding: '8px 10px',
                borderRadius: 8,
                backgroundColor: '#064E3B',
                border: '1px solid #059669',
                fontSize: '0.72rem',
                color: '#6EE7B7',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={15} />
              <span>{t.submittedAlert}</span>
            </div>
          )}

          <div style={{ fontSize: '0.64rem', color: '#64748B', marginTop: 8, textAlign: 'center' }}>
            {t.autoTelemetry}
          </div>
        </div>

        {/* MAP ROUTE PREVIEW */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid #334155',
            height: 240,
          }}
        >
          <MapView />
        </div>
      </div>
    </div>
  );
}
