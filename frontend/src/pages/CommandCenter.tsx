import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArohanStore } from '../stores/arohanStore';
import { OperationalAlertData } from '../types';
import { DecisionFlowStepper } from '../components/DecisionFlowStepper';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  TrendingUp,
  MapPin,
  Compass,
  Boxes,
  Truck,
  Layers,
  ArrowRight,
  ArrowUpRight,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  Calendar,
  CloudRain,
  Flame,
  Info,
  ExternalLink,
  ChevronRight,
  Activity,
  Sparkles,
  RefreshCw,
  Bell,
  Check,
  X,
  Navigation,
  MessageSquare
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export function CommandCenter() {
  const navigate = useNavigate();
  const {
    commandKpis,
    operationalAlerts,
    resourceStocks,
    resourceTransfers,
    fieldReports,
    fetchCommandKpis,
    fetchAlerts,
    fetchResources,
    fetchFieldReports,
    fetchFloodVulnerabilities,
    approveAlert,
    reviewAlert,
    dismissAlert,
    approveTransfer,
    isConnected,
    events,
    openWhatsAppModal
  } = useArohanStore();

  // Component state
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN', { hour12: false }));
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live operational data on mount
  useEffect(() => {
    fetchCommandKpis();
    fetchAlerts();
    fetchResources();
    fetchFieldReports();
    fetchFloodVulnerabilities();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchCommandKpis(),
      fetchAlerts(),
      fetchResources(),
      fetchFieldReports(),
      fetchFloodVulnerabilities(),
    ]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // KPI calculations with fallback to default operational numbers
  const kpis = commandKpis || {
    active_risk_events: operationalAlerts.filter(a => a.status !== 'DISMISSED').length || 12,
    predicted_disruptions: 8,
    affected_corridors: 6,
    resource_shortages: resourceStocks.filter(s => s.status === 'SHORTAGE' || s.status === 'CRITICAL').length || 4,
    ai_recommendations: 18,
    high_priority_actions: operationalAlerts.filter(a => a.priority === 'CRITICAL' && a.status === 'ACTIVE').length || 5,
    resource_transfers: resourceTransfers.length || 9,
    forecast_horizon: '48h',
    data_notice: 'SIMULATION / PROTOTYPE DATA — Calibrated with Official IMD & NESAC Parameters',
    last_updated: new Date().toISOString(),
  };

  // Section B: 48h Predictive Risk Trend Data
  const riskTrendData = [
    { time: 'Current', activeRisks: 12, disruptions: 8, rainfallAvg: 38 },
    { time: '+6h', activeRisks: 15, disruptions: 11, rainfallAvg: 44 },
    { time: '+12h', activeRisks: 18, disruptions: 14, rainfallAvg: 52 },
    { time: '+24h', activeRisks: 14, disruptions: 9, rainfallAvg: 30 },
    { time: '+48h', activeRisks: 8, disruptions: 5, rainfallAvg: 18 },
  ];

  // Section C: Risk Type Distribution Data
  const riskTypeData = [
    { name: 'Landslide', value: 35, color: '#ef4444' },
    { name: 'Flood Surge', value: 30, color: '#3b82f6' },
    { name: 'Heavy Rainfall', value: 20, color: '#06b6d4' },
    { name: 'Road Degradation', value: 10, color: '#f59e0b' },
    { name: 'Bridge Scour', value: 5, color: '#8b5cf6' },
  ];

  // Section G: Resource Availability vs Requirement (Surplus vs Shortage)
  const resourceBalanceData = [
    { district: 'Guwahati (Kamrup)', available: 4500, required: 2000, type: 'Food Grains' },
    { district: 'Shillong (E. Khasi)', available: 850, required: 2400, type: 'Food Grains' },
    { district: 'Silchar (Cachar)', available: 420, required: 1500, type: 'Medical Kits' },
    { district: 'Agartala (W. Tripura)', available: 110, required: 450, type: 'Oxygen' },
    { district: 'Aizawl (Mizoram)', available: 480, required: 950, type: 'Fuel (x100 L)' },
    { district: 'Itanagar (Papum Pare)', available: 2400, required: 2000, type: 'Water (x10 L)' },
  ];

  // Regional Risk Overview by State
  const regionalRiskOverview = [
    { state: 'Assam', critical: 3, high: 5, moderate: 8, affectedCorridors: 4, primaryHazard: 'Flood Surge & River Embankment', status: 'CRITICAL' },
    { state: 'Meghalaya', critical: 2, high: 4, moderate: 3, affectedCorridors: 2, primaryHazard: 'NH-6 Slope Shear Failure', status: 'CRITICAL' },
    { state: 'Mizoram', critical: 1, high: 3, moderate: 4, affectedCorridors: 2, primaryHazard: 'NH-306 Hill Creep & Mudflow', status: 'HIGH' },
    { state: 'Tripura', critical: 1, high: 2, moderate: 2, affectedCorridors: 1, primaryHazard: 'Isolated Buffer Depletion', status: 'HIGH' },
    { state: 'Arunachal Pradesh', critical: 1, high: 2, moderate: 5, affectedCorridors: 2, primaryHazard: 'Frontier Escarpment Slide', status: 'HIGH' },
    { state: 'Manipur', critical: 0, high: 2, moderate: 4, affectedCorridors: 1, primaryHazard: 'Highway Shoulder Erosion', status: 'MODERATE' },
    { state: 'Nagaland', critical: 0, high: 1, moderate: 3, affectedCorridors: 1, primaryHazard: 'Monsoon Waterlogging', status: 'MODERATE' },
    { state: 'Sikkim', critical: 0, high: 2, moderate: 2, affectedCorridors: 1, primaryHazard: 'High-Altitude Flash Runoff', status: 'MODERATE' },
  ];

  // Filtered Regional Risk based on state selector and hazard filter
  const filteredRegionalRisks = regionalRiskOverview.filter(r => {
    const matchesRegion = selectedRegion === 'ALL' || r.state.toUpperCase() === selectedRegion;
    const matchesHazard = riskFilter === 'ALL' ||
      (riskFilter === 'FLOOD' && r.primaryHazard.toLowerCase().includes('flood')) ||
      (riskFilter === 'LANDSLIDE' && (r.primaryHazard.toLowerCase().includes('slope') || r.primaryHazard.toLowerCase().includes('slide') || r.primaryHazard.toLowerCase().includes('hill'))) ||
      (riskFilter === 'HEAVY RAINFALL' && r.primaryHazard.toLowerCase().includes('runoff')) ||
      (riskFilter === 'ROAD ACCESSIBILITY' && r.primaryHazard.toLowerCase().includes('highway'));
    return matchesRegion && matchesHazard;
  });

  // Action Queue items
  const actionQueue = operationalAlerts.filter(a => {
    const matchesPriority = actionFilter === 'ALL' || a.priority === actionFilter;
    const matchesSearch = !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location_district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.recommended_action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', paddingBottom: 50 }}>
      
      {/* ── END-TO-END DECISION FLOW STEPPER ──────────────────────────────────── */}
      <DecisionFlowStepper />

      {/* ── COMMAND CENTER HEADER ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        padding: '20px 24px',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {/* Left: Brand Identity & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            flexShrink: 0,
          }}>
            <Compass size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
                AROHAN COMMAND CENTER
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                borderRadius: 9999,
                padding: '2px 8px',
              }}>
                SIH26002
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FDE68A',
                borderRadius: 9999,
                padding: '2px 8px',
              }}>
                SIMULATION / PROTOTYPE DATA
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
              Predictive Logistics & Accessibility Intelligence — North Eastern Region of India
            </p>
          </div>
        </div>

        {/* Right: Controls (Region, Search, Refresh, User Department) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Region Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>REGION:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">All NER (8 States)</option>
              <option value="ASSAM">Assam</option>
              <option value="MEGHALAYA">Meghalaya</option>
              <option value="MIZORAM">Mizoram</option>
              <option value="TRIPURA">Tripura</option>
              <option value="ARUNACHAL PRADESH">Arunachal Pradesh</option>
              <option value="MANIPUR">Manipur</option>
              <option value="NAGALAND">Nagaland</option>
              <option value="SIKKIM">Sikkim</option>
            </select>
          </div>

          {/* Department Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 6,
            backgroundColor: '#F1F5F9',
            fontSize: '0.75rem',
            color: '#334155',
            fontWeight: 600,
          }}>
            <Activity size={14} color="#059669" />
            <span>NER Disaster Response Logistics Unit</span>
          </div>

          {/* Live Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Clock & Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 6,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            fontSize: '0.75rem',
            color: '#475569',
            fontWeight: 700,
          }}>
            <Clock size={13} color="#059669" />
            <span>{currentTime} IST</span>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          backgroundColor: '#ECFDF5',
          color: '#065F46',
          border: '1px solid #A7F3D0',
          borderRadius: 8,
          fontSize: '0.85rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ── TOP KPI ROW (8 COMPACT OPERATIONAL CARDS) ─────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: 12,
      }}>
        {[
          {
            title: 'ACTIVE RISKS',
            value: kpis.active_risk_events,
            desc: 'High-priority hazard alerts',
            icon: ShieldAlert,
            color: '#ef4444',
            bg: '#FEE2E2',
            onClick: () => {
              const el = document.getElementById('section-regional-risk');
              el?.scrollIntoView({ behavior: 'smooth' });
            },
          },
          {
            title: 'PREDICTED DISRUPTIONS',
            value: kpis.predicted_disruptions,
            desc: 'Accessibility risk forecasts',
            icon: AlertTriangle,
            color: '#f59e0b',
            bg: '#FEF3C7',
            onClick: () => navigate('/map?focus=corridors'),
          },
          {
            title: 'AFFECTED CORRIDORS',
            value: kpis.affected_corridors,
            desc: 'Routes at elevated risk',
            icon: Navigation,
            color: '#d97706',
            bg: '#FEF3C7',
            onClick: () => navigate('/map'),
          },
          {
            title: 'RESOURCE SHORTAGES',
            value: kpis.resource_shortages,
            desc: 'Districts needing supply',
            icon: Boxes,
            color: '#dc2626',
            bg: '#FEE2E2',
            onClick: () => navigate('/resources'),
          },
          {
            title: 'AI RECOMMENDATIONS',
            value: kpis.ai_recommendations,
            desc: 'Pending decision options',
            icon: Zap,
            color: '#059669',
            bg: '#ECFDF5',
            onClick: () => {
              const el = document.getElementById('section-ai-recommendations');
              el?.scrollIntoView({ behavior: 'smooth' });
            },
          },
          {
            title: 'HIGH PRIORITY ACTIONS',
            value: kpis.high_priority_actions,
            desc: 'Authority review required',
            icon: Flame,
            color: '#b91c1c',
            bg: '#FEE2E2',
            onClick: () => {
              const el = document.getElementById('section-action-queue');
              el?.scrollIntoView({ behavior: 'smooth' });
            },
          },
          {
            title: 'RESOURCE TRANSFERS',
            value: kpis.resource_transfers,
            desc: 'Redistribution movements',
            icon: Truck,
            color: '#2563eb',
            bg: '#DBEAFE',
            onClick: () => navigate('/resources'),
          },
          {
            title: 'FORECAST HORIZON',
            value: kpis.forecast_horizon || '48h',
            desc: 'Predictive planning window',
            icon: Clock,
            color: '#475569',
            bg: '#F1F5F9',
            onClick: () => {},
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              style={{
                backgroundColor: '#ffffff',
                padding: '14px 16px',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
                  {card.title}
                </span>
                <span style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}>
                  <Icon size={13} />
                </span>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 4 }}>
                {card.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUICK ACTIONS BAR ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        backgroundColor: '#ffffff',
        padding: '12px 18px',
        borderRadius: 8,
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
          <Sparkles size={15} color="#059669" />
          <span>OPERATIONAL SHORTCUTS:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'VIEW MAP OVERVIEW', path: '/map', icon: Compass, primary: true },
            { label: 'WHATSAPP DISPATCH', action: () => openWhatsAppModal(), icon: MessageSquare, special: true },
            { label: '5-TIER COORDINATION', path: '/communications', icon: Sparkles },
            { label: 'ANALYZE CORRIDOR RISK', path: '/risk', icon: ShieldAlert },
            { label: 'RUN DISASTER SCENARIO', path: '/demo', icon: Sliders },
            { label: 'FIND ALTERNATIVE ROUTE', path: '/replan', icon: Layers },
            { label: 'CHECK RESOURCE STOCKS', path: '/resources', icon: Boxes },
            { label: 'VIEW ALL ALERTS', path: '/action', icon: Zap },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                onClick={act.action ? act.action : () => navigate(act.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: act.primary ? '#059669' : act.special ? '#ECFDF5' : '#F8FAFC',
                  color: act.primary ? '#ffffff' : act.special ? '#047857' : '#334155',
                  border: `1px solid ${act.primary ? '#059669' : act.special ? '#A7F3D0' : '#CBD5E1'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={13} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN DASHBOARD GRID (LEFT: RISK & ACCESSIBILITY | RIGHT: AI RECOMMENDATIONS) ─ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 20,
      }}>
        
        {/* ── LEFT / LARGE AREA (COLS 1-8): RISK, TRENDS, GRAPHS ─────────────── */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* SECTION A — REGIONAL RISK OVERVIEW */}
          <div id="section-regional-risk" style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={18} color="#ef4444" />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    REGIONAL RISK & ACCESSIBILITY STATUS
                  </h2>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Operational hazard classification across 8 North Eastern Region states
                </span>
              </div>

              {/* Hazard Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                {['ALL', 'FLOOD', 'LANDSLIDE', 'HEAVY RAINFALL', 'ROAD ACCESSIBILITY'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: '0.7rem',
                      fontWeight: riskFilter === f ? 700 : 500,
                      backgroundColor: riskFilter === f ? '#059669' : '#F1F5F9',
                      color: riskFilter === f ? '#ffffff' : '#475569',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* State-by-State Operational Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {filteredRegionalRisks.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 8,
                    border: `1px solid ${st.status === 'CRITICAL' ? '#FECACA' : st.status === 'HIGH' ? '#FDE68A' : '#E2E8F0'}`,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{st.state}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      backgroundColor: st.status === 'CRITICAL' ? '#FEE2E2' : st.status === 'HIGH' ? '#FEF3C7' : '#ECFDF5',
                      color: st.status === 'CRITICAL' ? '#B91C1C' : st.status === 'HIGH' ? '#B45309' : '#047857',
                    }}>
                      {st.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 8, fontWeight: 500 }}>
                    {st.primaryHazard}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', borderTop: '1px solid #E2E8F0', paddingTop: 6 }}>
                    <span style={{ color: '#64748B' }}>Affected Corridors:</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{st.affectedCorridors} Corridors</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B & C: RISK TREND GRAPH + RISK TYPE DISTRIBUTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
            
            {/* Section B: Risk Trend Graph (48h Window) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: 18,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                    PREDICTIVE RISK TREND (48H HORIZON)
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Active risk events & forecasted accessibility disruptions
                  </span>
                </div>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 700 }}>
                  SIMULATION DATA
                </span>
              </div>

              <div style={{ height: 180, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="disruptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: 6, fontSize: 12 }} />
                    <Area type="monotone" dataKey="activeRisks" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="Active Risks" />
                    <Area type="monotone" dataKey="disruptions" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#disruptGrad)" name="Disruptions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Section C: Risk Type Distribution */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: 18,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                  REGIONAL HAZARD DRIVERS
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  Breakdown by dominant hazard classification
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: 6, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {riskTypeData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: '#334155' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: d.color }} />
                    <span>{d.name} ({d.value}%)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SECTION G — SUPPLY / DEMAND GRAPH (SURPLUS VS SHORTAGE) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Boxes size={17} color="#059669" />
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    ESSENTIAL RESOURCE BALANCE — AVAILABILITY VS REQUIREMENT
                  </h3>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Surplus depots vs Deficit relief nodes informing inter-district redistribution
                </span>
              </div>
              <button
                onClick={() => navigate('/resources')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#059669',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Redistribution Center</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ height: 190, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceBalanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="district" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: 6, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
                  <Bar dataKey="available" name="Available Stock" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="required" name="Minimum Required Buffer" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION H — REGIONAL ROAD ACCESSIBILITY STATUS */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                REGIONAL ROAD CORRIDOR ACCESSIBILITY
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Click category to open Map Overview</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'ACCESSIBLE', count: '74%', desc: '18 Corridors Clear', color: '#10b981', bg: '#ECFDF5', border: '#A7F3D0' },
                { label: 'PARTIALLY ACCESSIBLE', count: '14%', desc: '3 High-Clearance Only', color: '#f59e0b', bg: '#FEF3C7', border: '#FDE68A' },
                { label: 'HIGH RISK', count: '8%', desc: '2 Slope Instability Alert', color: '#d97706', bg: '#FEF3C7', border: '#FDE68A' },
                { label: 'BLOCKED / DISRUPTED', count: '4%', desc: '1 NH-6 km 48 Closure', color: '#ef4444', bg: '#FEE2E2', border: '#FECACA' },
              ].map((acc, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/map')}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: acc.bg,
                    border: `1px solid ${acc.border}`,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: acc.color }}>{acc.label}</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '4px 0 2px' }}>{acc.count}</div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>{acc.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT AREA (COLS 9-12): AI RECOMMENDATIONS, RESOURCE STATUS, RECENT EVENTS ─ */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* SECTION D — AI RECOMMENDATIONS PANEL (HERO SECTION) */}
          <div id="section-ai-recommendations" style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '2px solid #059669',
            padding: 18,
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Zap size={16} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#064E3B', margin: 0 }}>
                    AI RECOMMENDATIONS
                  </h3>
                  <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                    Predictive Disaster-Response Action Intelligence
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 9999,
              }}>
                ACTIVE
              </span>
            </div>

            {/* Recommendation Card 1: Landslide Disruption */}
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#B91C1C' }}>
                  HIGH PRIORITY • PREDICTED LANDSLIDE DISRUPTION
                </span>
                <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, backgroundColor: '#EF4444', color: '#fff', fontWeight: 700 }}>
                  NEXT 24H
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                Aizawl Link & NH-6 Jorabat–Umiam Escarpment
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                <strong>Reason:</strong> Heavy rainfall (38 mm/h) + 42° slope shear failure probability (74%).
              </div>
              <div style={{ fontSize: '0.74rem', color: '#B91C1C', fontWeight: 600 }}>
                <strong>Potential Impact:</strong> Blockage of Convoy REL-001 with emergency medical relief.
              </div>
              <div style={{ fontSize: '0.74rem', color: '#065F46', backgroundColor: '#ECFDF5', padding: '4px 8px', borderRadius: 4, border: '1px solid #A7F3D0', fontWeight: 600 }}>
                <strong>Action:</strong> Divert via Sonapur Ridge Bypass (Route B) and pre-position earthmovers.
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button
                  onClick={() => {
                    reviewAlert(1);
                    showNotification('Disruption alert #ALT-NER-0101 marked as under executive review.');
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  REVIEW
                </button>
                <button
                  onClick={() => navigate('/replan')}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#059669',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  VIEW ROUTE
                </button>
              </div>
            </div>

            {/* Recommendation Card 2: Resource Shortage Forecast */}
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1E40AF' }}>
                  RESOURCE SHORTAGE FORECAST
                </span>
                <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, backgroundColor: '#3B82F6', color: '#fff', fontWeight: 700 }}>
                  18–24H
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                Destination: East Khasi Hills (Shillong Central Reserve)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                <strong>Expected Shortage:</strong> 1,200 MT Food Grains below 3-day buffer.
              </div>
              <div style={{ fontSize: '0.74rem', color: '#047857' }}>
                <strong>Suggested Source:</strong> Kamrup Metro (4,500 MT surplus buffer).
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button
                  onClick={() => navigate('/resources')}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  REVIEW TRANSFER
                </button>
                <button
                  onClick={() => {
                    approveTransfer(101);
                    showNotification('Transfer TRF-00101 (1,200 MT Food Grains) approved for dispatch.');
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  AUTHORIZE
                </button>
              </div>
            </div>

            {/* Recommendation Card 3: Flood Accessibility Alert */}
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#92400E' }}>
                  FLOOD ACCESSIBILITY ALERT
                </span>
                <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, backgroundColor: '#F59E0B', color: '#fff', fontWeight: 700 }}>
                  CURRENT
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                Cachar (Silchar Approach) — Accessibility: 42%
              </div>
              <div style={{ fontSize: '0.74rem', color: '#78350F' }}>
                <strong>Action:</strong> Divert freight to Multimodal Rail-Road Corridor via Lumding Junction.
              </div>
              <button
                onClick={() => navigate('/multimodal')}
                style={{
                  marginTop: 4,
                  padding: '5px 8px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#D97706',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                ACTIVATE MULTIMODAL HUB
              </button>
            </div>

          </div>

          {/* SECTION F — RESOURCE AVAILABILITY BY DISTRICT */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                DISTRICT ESSENTIAL RESOURCES
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>5 Key Commodities</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resourceStocks.slice(0, 5).map((stock, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      {stock.district_name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      {stock.resource_type}: {stock.available_qty} {stock.unit}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: stock.status === 'SURPLUS' ? '#ECFDF5' : stock.status === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                    color: stock.status === 'SURPLUS' ? '#047857' : stock.status === 'CRITICAL' ? '#B91C1C' : '#B45309',
                  }}>
                    {stock.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION I — RECENT OPERATIONAL EVENTS */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                RECENT OPERATIONAL EVENTS
              </div>
              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Live Telemetry Feed</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(events || []).slice(-4).reverse().map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    marginTop: 5,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>{ev.title}</span>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{ev.time_label || 'Just now'}</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#475569', margin: '2px 0 0', lineHeight: 1.35 }}>
                      {ev.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── SECTION E — OPERATIONAL ACTION QUEUE (BOTTOM FULL WIDTH) ─────────── */}
      <div id="section-action-queue" style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        padding: 22,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="#dc2626" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                OPERATIONAL ACTION QUEUE
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Actionable disaster-response recommendations requiring institutional review & authorization
            </span>
          </div>

          {/* Priority Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((p) => (
              <button
                key={p}
                onClick={() => setActionFilter(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: actionFilter === p ? 700 : 500,
                  backgroundColor: actionFilter === p ? '#059669' : '#F1F5F9',
                  color: actionFilter === p ? '#ffffff' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Action Queue Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '10px 12px' }}>PRIORITY</th>
                <th style={{ padding: '10px 12px' }}>ISSUE & ADVISORY</th>
                <th style={{ padding: '10px 12px' }}>LOCATION / CORRIDOR</th>
                <th style={{ padding: '10px 12px' }}>POTENTIAL IMPACT</th>
                <th style={{ padding: '10px 12px' }}>RECOMMENDED ACTION</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {actionQueue.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      backgroundColor: item.priority === 'CRITICAL' ? '#FEE2E2' : item.priority === 'HIGH' ? '#FEF3C7' : '#ECFDF5',
                      color: item.priority === 'CRITICAL' ? '#B91C1C' : item.priority === 'HIGH' ? '#B45309' : '#047857',
                    }}>
                      {item.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#0F172A', maxWidth: 220 }}>
                    {item.title}
                  </td>
                  <td style={{ padding: '12px', color: '#475569' }}>
                    <div style={{ fontWeight: 600 }}>{item.location_district}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{item.affected_corridor}</div>
                  </td>
                  <td style={{ padding: '12px', color: '#64748B', maxWidth: 200 }}>
                    {item.affected_resource}
                  </td>
                  <td style={{ padding: '12px', color: '#047857', fontWeight: 600, maxWidth: 240 }}>
                    {item.recommended_action}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: item.status === 'ACTIVE' ? '#FEF3C7' : item.status === 'APPROVED' ? '#ECFDF5' : '#F1F5F9',
                      color: item.status === 'ACTIVE' ? '#B45309' : item.status === 'APPROVED' ? '#047857' : '#475569',
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {item.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => {
                              reviewAlert(item.id);
                              showNotification(`Alert ${item.alert_code} marked as reviewed.`);
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            REVIEW
                          </button>
                          <button
                            onClick={() => {
                              approveAlert(item.id);
                              showNotification(`Alert action ${item.alert_code} approved.`);
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#059669',
                              border: 'none',
                              color: '#ffffff',
                              cursor: 'pointer',
                            }}
                          >
                            APPROVE
                          </button>
                        </>
                      )}
                      {item.status !== 'DISMISSED' && (
                        <button
                          onClick={() => {
                            dismissAlert(item.id, 'Dismissed with operational justification by duty officer');
                            showNotification(`Alert ${item.alert_code} dismissed.`);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#64748B',
                            cursor: 'pointer',
                          }}
                        >
                          DISMISS
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
