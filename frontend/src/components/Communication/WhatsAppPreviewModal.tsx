import React, { useState, useEffect } from 'react';
import { useArohanStore } from '../../stores/arohanStore';
import {
  X,
  Send,
  Smartphone,
  Shield,
  Check,
  CheckCheck,
  Code2,
  AlertTriangle,
  Info,
  Layers,
  Copy
} from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', status: 'VERIFIED', region: 'Assam / Brahmaputra Valley' },
  { code: 'mizo', name: 'Mizo', native: 'Mizo ṭawng', status: 'VERIFIED', region: 'Mizoram' },
  { code: 'kha', name: 'Khasi', native: 'Ka Ktien Khasi', status: 'VERIFIED', region: 'Meghalaya (Khasi Hills)' },
  { code: 'mni', name: 'Meitei', native: 'মৈতৈলোন্', status: 'VERIFIED', region: 'Manipur' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो', status: 'VERIFIED', region: 'Bodoland (Assam)' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', status: 'VERIFIED', region: 'Barak Valley / Tripura' },
  { code: 'en', name: 'English', native: 'English', status: 'VERIFIED', region: 'National / NER Common' },
  { code: 'garo', name: 'Garo', native: 'A·chik', status: 'PENDING', region: 'Meghalaya (Garo Hills)' },
  { code: 'nag', name: 'Nagamese', native: 'Nagamese Creole', status: 'PENDING', region: 'Nagaland' },
];

const MESSAGE_TYPES = [
  { id: 'ROUTE_CHANGE', label: 'Route Change Instruction', tag: 'DIVERSION' },
  { id: 'ROAD_DISRUPTION', label: 'Road Access Disruption', tag: 'HAZARD' },
  { id: 'FLOOD_ALERT', label: 'Flash Flood & Runoff Warning', tag: 'SURGE' },
  { id: 'MOVEMENT_SUMMARY', label: 'Convoy Dispatch Manifest', tag: 'SUMMARY' },
  { id: 'DELIVERY_CONFIRMATION', label: 'Relief Delivery Receipt', tag: 'CONFIRM' },
];

export function WhatsAppPreviewModal() {
  const {
    isWhatsAppModalOpen,
    whatsAppModalContext,
    closeWhatsAppModal,
    sendWhatsAppMessage,
    selectedShipmentId,
    shipmentsList,
    routes,
  } = useArohanStore();

  const [messageType, setMessageType] = useState<string>('ROUTE_CHANGE');
  const [selectedLang, setSelectedLang] = useState<string>('as');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'payload'>('visual');
  const [copied, setCopied] = useState<boolean>(false);

  // Derive default context from selected shipment or modal context
  const currentShipment = shipmentsList?.find((s) => s.id === selectedShipmentId) || shipmentsList?.[0];
  const assignedRoute = routes?.find((r) => r.id === currentShipment?.assigned_route_id);

  const contextData = {
    movement_code: whatsAppModalContext?.movement_code || currentShipment?.shipment_code || 'REL-001',
    driver_name: whatsAppModalContext?.driver_name || 'Rahul Kumar',
    driver_phone: whatsAppModalContext?.driver_phone || '+91 98765 43210',
    reason: whatsAppModalContext?.reason || 'Severe landslide hazard blocking primary corridor',
    old_route: whatsAppModalContext?.old_route || assignedRoute?.name || 'NH-6 via Umiam Escarpment',
    new_route: whatsAppModalContext?.new_route || 'Route B (Sonapur Ridge Highland Corridor)',
    destination: whatsAppModalContext?.destination || currentShipment?.destination || 'Shillong Core Relief Hub',
    eta: whatsAppModalContext?.eta || '4h 15m',
    resource: whatsAppModalContext?.resource || currentShipment?.cargo_type || 'Emergency Medical Supplies & Kits',
    origin: whatsAppModalContext?.origin || currentShipment?.origin || 'Guwahati Buffer Depot',
  };

  // Fetch rendered preview when messageType or language changes
  useEffect(() => {
    if (!isWhatsAppModalOpen) return;

    let isMounted = true;
    setLoading(true);
    setSentSuccess(false);

    fetch('/api/communications/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_type: messageType,
        language_code: selectedLang,
        ...contextData,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setPreviewData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch preview, using fallback:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isWhatsAppModalOpen, messageType, selectedLang, whatsAppModalContext, selectedShipmentId]);

  if (!isWhatsAppModalOpen) return null;

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];
  const isVerified = currentLangObj.status === 'VERIFIED';

  const handleSend = async () => {
    setSending(true);
    try {
      await sendWhatsAppMessage({
        movement_code: contextData.movement_code,
        recipient_name: contextData.driver_name,
        recipient_role: 'DRIVER',
        recipient_phone: contextData.driver_phone,
        message_type: messageType,
        language_code: selectedLang,
        dispatched_by: 'REGIONAL_COMMAND',
        context_data: contextData,
      });
      setSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        closeWhatsAppModal();
      }, 2200);
    } catch (err) {
      setSending(false);
      alert('Failed to send simulated message. Check server logs.');
    }
  };

  const handleCopyPayload = () => {
    if (previewData?.whatsapp_payload) {
      navigator.clipboard.writeText(JSON.stringify(previewData.whatsapp_payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWhatsAppModal();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#064E3B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #047857',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                  Driver WhatsApp Dispatch & Verification
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    backgroundColor: '#065F46',
                    border: '1px solid #34D399',
                    color: '#D1FAE5',
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}
                >
                  SIMULATION / DEMO MODE
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#A7F3D0', marginTop: 2 }}>
                Meta WhatsApp Business Cloud API Architecture • Verified Regional Languages
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={closeWhatsAppModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#D1FAE5',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* CONTROLS ROW */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
              marginBottom: 16,
              backgroundColor: '#F8FAFC',
              padding: 14,
              borderRadius: 12,
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Message Type */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                MESSAGE TEMPLATE TYPE
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                {MESSAGE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
                  REGIONAL LANGUAGE SCRIPT
                </label>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 9999,
                    backgroundColor: isVerified ? '#ECFDF5' : '#FFFBEB',
                    color: isVerified ? '#047857' : '#B45309',
                    border: `1px solid ${isVerified ? '#A7F3D0' : '#FDE68A'}`,
                  }}
                >
                  {isVerified ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} — {l.name} ({l.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient & Phone Masking */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                DISPATCH TARGET (MASKED)
              </label>
              <div
                style={{
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.8rem',
                  color: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: 600 }}>{contextData.driver_name}</span>
                <span style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 700 }}>
                  {previewData?.masked_phone || '+91 98*** ***10'}
                </span>
              </div>
            </div>
          </div>

          {/* VIEW TOGGLE TABS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'visual' ? '#047857' : '#F1F5F9',
                  color: activeTab === 'visual' ? '#FFFFFF' : '#475569',
                }}
              >
                <Smartphone size={14} />
                <span>WhatsApp Phone View</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payload')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'payload' ? '#047857' : '#F1F5F9',
                  color: activeTab === 'payload' ? '#FFFFFF' : '#475569',
                }}
              >
                <Code2 size={14} />
                <span>Meta Cloud API Payload (v20.0)</span>
              </button>
            </div>

            {activeTab === 'payload' && (
              <button
                type="button"
                onClick={handleCopyPayload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <Copy size={13} />
                <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {/* TAB 1: VISUAL WHATSAPP PHONE PREVIEW */}
          {activeTab === 'visual' && (
            <div
              style={{
                backgroundColor: '#0B141A',
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid #1F2C34',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                maxWidth: 580,
                margin: '0 auto',
              }}
            >
              {/* WhatsApp App Bar */}
              <div
                style={{
                  backgroundColor: '#202C33',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #2A3942',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: '#00A884',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    AR
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E9EDEF' }}>
                        AROHAN Relief Dispatch
                      </span>
                      <span
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: '50%',
                          backgroundColor: '#00A884',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.55rem',
                        }}
                      >
                        ✓
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#8696A0' }}>
                      Official Disaster Logistics Channel • Govt of India
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#00A884', fontWeight: 600 }}>VERIFIED</div>
              </div>

              {/* Chat Canvas */}
              <div
                style={{
                  backgroundColor: '#0B141A',
                  backgroundImage: 'radial-gradient(#182229 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  padding: '16px 14px',
                }}
              >
                {/* Yellow End-to-End Encryption Notice */}
                <div
                  style={{
                    backgroundColor: '#182229',
                    border: '1px solid #222E35',
                    borderRadius: 8,
                    padding: '8px 12px',
                    marginBottom: 16,
                    textAlign: 'center',
                    fontSize: '0.68rem',
                    color: '#FDD835',
                    lineHeight: 1.4,
                  }}
                >
                  🔒 Messages to this chat are secured with end-to-end encryption. Official relief instructions are logged into AROHAN Audit Node.
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    backgroundColor: '#005C4B',
                    color: '#E9EDEF',
                    borderRadius: '10px 10px 10px 2px',
                    padding: '12px 14px',
                    maxWidth: '92%',
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {loading ? (
                    <div style={{ color: '#8696A0', fontStyle: 'italic', padding: 8 }}>
                      Rendering official {currentLangObj.name} template...
                    </div>
                  ) : (
                    previewData?.rendered_body || 'Loading verified template...'
                  )}

                  {/* Bubble Timestamp & Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      marginTop: 6,
                      fontSize: '0.65rem',
                      color: '#8696A0',
                    }}
                  >
                    <span>14:30</span>
                    <CheckCheck size={14} style={{ color: '#53BDEB' }} />
                  </div>
                </div>

                {/* WhatsApp Interactive Action Buttons */}
                <div style={{ maxWidth: '92%', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div
                    style={{
                      backgroundColor: '#202C33',
                      border: '1px solid #2A3942',
                      borderRadius: 6,
                      padding: '8px 12px',
                      textAlign: 'center',
                      color: '#00A884',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <span>🔘</span>
                    <span>Acknowledge Route ({contextData.movement_code})</span>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#202C33',
                      border: '1px solid #2A3942',
                      borderRadius: 6,
                      padding: '8px 12px',
                      textAlign: 'center',
                      color: '#EF4444',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <span>⚠️</span>
                    <span>Report Road Block / Hazard</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: META CLOUD API PAYLOAD VIEW */}
          {activeTab === 'payload' && (
            <div
              style={{
                backgroundColor: '#0F172A',
                color: '#E2E8F0',
                borderRadius: 12,
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                lineHeight: 1.5,
                maxHeight: 380,
                overflowY: 'auto',
                border: '1px solid #334155',
              }}
            >
              <div style={{ color: '#94A3B8', marginBottom: 8, fontSize: '0.7rem' }}>
                // HTTP POST https://graph.facebook.com/v20.0/{'{WHATSAPP_PHONE_NUMBER_ID}'}/messages
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(previewData?.whatsapp_payload || {}, null, 2)}
              </pre>
            </div>
          )}

          {/* NOTICE BANNER */}
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.74rem',
              color: '#065F46',
            }}
          >
            <Info size={16} style={{ flexShrink: 0, color: '#059669' }} />
            <div>
              <span style={{ fontWeight: 700 }}>Decision Loop Transparency: </span>
              Dispatching simulated WhatsApp instructions triggers an audit record in AROHAN's database and reflects on the Driver Field Mobile Portal. Real API credentials can be connected via <code style={{ backgroundColor: '#D1FAE5', padding: '1px 4px', borderRadius: 4 }}>WHATSAPP_CLOUD_TOKEN</code> in production.
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {sentSuccess ? (
              <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Notification successfully simulated & delivered!
              </span>
            ) : (
              <span>Target: {contextData.movement_code} • Script: {currentLangObj.name} ({currentLangObj.native})</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={closeWhatsAppModal}
              disabled={sending}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || sentSuccess}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: sentSuccess ? '#10B981' : '#059669',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: sending || sentSuccess ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
              }}
            >
              <Send size={15} />
              <span>{sending ? 'Transmitting...' : sentSuccess ? 'Dispatched!' : 'Send via WhatsApp (Simulation)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
