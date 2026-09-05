import React, { useState, useEffect } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import {
  MessageSquare,
  Shield,
  Smartphone,
  CheckCheck,
  Clock,
  Send,
  Search,
  Filter,
  Users,
  Building2,
  MapPin,
  Truck,
  Layers,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const GOVERNMENT_LEVELS = [
  {
    level: 1,
    id: 'REGIONAL_COMMAND',
    title: 'Level 1: Regional Command',
    authority: 'North Eastern Regional Node for Disaster Risk Reduction (NER-DRR) / NESAC',
    jurisdiction: 'NER Interstate Corridor Network (8 States)',
    responsibilities: 'Cross-border resource balancing, strategic corridor declaration, regional early warning.',
    color: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: Building2,
  },
  {
    level: 2,
    id: 'STATE_CONTROL',
    title: 'Level 2: State Control',
    authority: 'State Disaster Management Authorities (SDMA Assam, Meghalaya, Mizoram, etc.)',
    jurisdiction: 'State High Risk Corridors & Buffer Hubs',
    responsibilities: 'Inter-district transit permits, police pilot escorts, state-level resource requisitions.',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    icon: Shield,
  },
  {
    level: 3,
    id: 'DISTRICT_CONTROL',
    title: 'Level 3: District Control',
    authority: 'District Disaster Management Authorities (DDMA) & District Magistrates',
    jurisdiction: 'District Reception Hubs & Storage Godowns',
    responsibilities: 'Relief camp requisitions, civil supplies store receipt acknowledgement, local road blocks.',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: MapPin,
  },
  {
    level: 4,
    id: 'LOGISTICS_COORDINATOR',
    title: 'Level 4: Logistics Coordinator',
    authority: 'Buffer Depot Logistics Wing & Convoy Dispatchers',
    jurisdiction: 'Fleet Staging Points & Depots',
    responsibilities: 'Vehicle loading manifests, driver assignments, route dispatch issuance, convoy tracking.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    icon: Layers,
  },
  {
    level: 5,
    id: 'DRIVER',
    title: 'Level 5: Field Driver',
    authority: 'Relief Convoy Operators & Observation Units',
    jurisdiction: 'Active Highway In-Transit Highway Sectors',
    responsibilities: 'Safe transit, native language route compliance, one-tap ground hazard verification.',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#6EE7B7',
    icon: Truck,
  },
];

export function CommunicationCenter() {
  const {
    communicationLogs,
    fetchCommunicationHistory,
    openWhatsAppModal,
    activeRoleLevel,
    setActiveRoleLevel,
    acknowledgeWhatsAppMessage,
  } = useArohanStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLangFilter, setSelectedLangFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCommunicationHistory();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCommunicationHistory();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredLogs = (communicationLogs || []).filter((log) => {
    const matchesSearch =
      log.movement_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message_body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLangFilter === 'ALL' || log.language_code === selectedLangFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || log.status === selectedStatusFilter;
    return matchesSearch && matchesLang && matchesStatus;
  });

  const totalDispatches = communicationLogs?.length || 0;
  const acknowledgedCount = communicationLogs?.filter((l) => l.status === 'ACKNOWLEDGED').length || 0;
  const ackRate = totalDispatches > 0 ? Math.round((acknowledgedCount / totalDispatches) * 100) : 94;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>
      {/* 1. EXECUTIVE HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                borderRadius: 9999,
                padding: '2px 8px',
                letterSpacing: '0.04em',
              }}
            >
              MULTI-LEVEL INSTITUTIONAL COORDINATION
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#0284C7',
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 9999,
                padding: '2px 8px',
              }}
            >
              WHATSAPP CLOUD API SIMULATION
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>
            Multi-Level Coordination & Multilingual WhatsApp Dispatch
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0 0', maxWidth: 960, lineHeight: 1.5 }}>
            Direct communication pipeline sending verified regional emergency instructions (Assamese, Mizo, Khasi, Meitei, Bodo, Bengali, English) to frontline relief drivers and disaster response authorities across all 5 operational tiers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleRefresh}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: '0.82rem',
              borderColor: '#CBD5E1',
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh Logs</span>
          </button>

          <button
            type="button"
            onClick={() => openWhatsAppModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 10,
              backgroundColor: '#059669',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              cursor: 'pointer',
            }}
          >
            <Send size={15} />
            <span>Compose WhatsApp Dispatch</span>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Total Simulated Dispatches
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginTop: 4 }}>
            {totalDispatches}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
            WhatsApp Cloud Sandbox Active
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #0284C7' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Driver Acknowledged Rate
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284C7', marginTop: 4 }}>
            {ackRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>
            {acknowledgedCount} / {totalDispatches} confirmed receipt
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #7C3AED' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Verified Regional Languages
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7C3AED', marginTop: 4 }}>
            7 Scripts
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>
            AS, MIZO, KHA, MNI, BRX, BN, EN
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Avg Driver Response Latency
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: 4 }}>
            3.8 min
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>
            Target: &lt; 15 min under disaster protocol
          </div>
        </div>
      </div>

      {/* 3. 5-TIER GOVERNMENT HIERARCHY ARCHITECTURE VISUALIZER */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              5-Tier Multi-Level Government Coordination Framework
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Select an operational tier to inspect the authority role, jurisdictional mandate, and telemetry visibility.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: 9999 }}>
            Active View: Level {activeRoleLevel}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
          }}
        >
          {GOVERNMENT_LEVELS.map((g) => {
            const isSelected = activeRoleLevel === g.level;
            const Icon = g.icon;
            return (
              <div
                key={g.level}
                onClick={() => setActiveRoleLevel(g.level)}
                style={{
                  padding: '14px',
                  borderRadius: 12,
                  backgroundColor: isSelected ? g.bg : '#F8FAFC',
                  border: `1.5px solid ${isSelected ? g.color : '#E2E8F0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: isSelected ? g.color : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? g.color : '#1E293B' }}>
                    {g.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: 4, lineHeight: 1.3 }}>
                  {g.authority}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.4 }}>
                  {g.responsibilities}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CHRONOLOGICAL WHATSAPP AUDIT TRAIL */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              WhatsApp Emergency Dispatch Audit Trail
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Chronological log of verified emergency messages dispatched to frontline relief drivers and field officials.
            </p>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '6px 12px',
              }}
            >
              <Search size={14} style={{ color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Filter by Convoy / Driver / Text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.78rem',
                  color: '#0F172A',
                  width: 180,
                }}
              />
            </div>

            <select
              value={selectedLangFilter}
              onChange={(e) => setSelectedLangFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.78rem',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Languages</option>
              <option value="as">Assamese (অসমীয়া)</option>
              <option value="mizo">Mizo (Mizo ṭawng)</option>
              <option value="kha">Khasi (Ka Ktien Khasi)</option>
              <option value="mni">Meitei (মৈতৈলোন্)</option>
              <option value="brx">Bodo (बड़ो)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="en">English</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.78rem',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="DELIVERED_SIMULATED">Delivered (Simulated)</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '10px 14px' }}>Dispatch Code</th>
                <th style={{ padding: '10px 14px' }}>Convoy / Movement</th>
                <th style={{ padding: '10px 14px' }}>Recipient & Masked Phone</th>
                <th style={{ padding: '10px 14px' }}>Script / Language</th>
                <th style={{ padding: '10px 14px' }}>Type</th>
                <th style={{ padding: '10px 14px' }}>Message Excerpt</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px 14px', textAlign: 'center', color: '#94A3B8' }}>
                    No communication logs matching current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isAck = log.status === 'ACKNOWLEDGED';
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                        {log.dispatch_id}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: '#065F46',
                            backgroundColor: '#ECFDF5',
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: '1px solid #A7F3D0',
                            fontSize: '0.75rem',
                          }}
                        >
                          {log.movement_code}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{log.recipient_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontFamily: 'monospace' }}>
                          {log.phone_masked}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{log.language_name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          {log.language_code.toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                          }}
                        >
                          {log.message_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: 280 }}>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#334155',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={log.message_body}
                        >
                          {log.message_body}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 9999,
                            backgroundColor: isAck ? '#ECFDF5' : '#F0F9FF',
                            color: isAck ? '#047857' : '#0284C7',
                            border: `1px solid ${isAck ? '#A7F3D0' : '#BAE6FD'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {isAck ? <CheckCircle2 size={12} /> : <CheckCheck size={12} />}
                          <span>{isAck ? 'ACKNOWLEDGED' : 'DELIVERED'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() =>
                              openWhatsAppModal({
                                movement_code: log.movement_code,
                                driver_name: log.recipient_name,
                                driver_phone: log.phone_masked,
                              })
                            }
                            style={{
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              padding: '4px 8px',
                              borderRadius: 6,
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            Preview
                          </button>

                          {!isAck && (
                            <button
                              type="button"
                              onClick={() => acknowledgeWhatsAppMessage(log.dispatch_id)}
                              style={{
                                border: 'none',
                                backgroundColor: '#ECFDF5',
                                color: '#047857',
                                padding: '4px 8px',
                                borderRadius: 6,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Simulate Driver Tap on Acknowledge Button"
                            >
                              Simulate Ack
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
