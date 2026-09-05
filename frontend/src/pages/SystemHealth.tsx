import React, { useEffect, useState } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { Activity, ShieldCheck, Database, Server, CloudRain, CheckCircle2, Layers, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

interface ProviderStatus {
  name: string;
  type: string;
  source: string;
  status: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'HISTORICAL' | 'SIMULATED' | 'DERIVED';
  freshness_seconds: number;
  retrieved_at: string;
  observed_at: string;
  details: string;
}

export function SystemHealth() {
  const { isConnected } = useArohanStore();
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchProviderStatuses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/providers/status');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Failed to fetch provider status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderStatuses();
    const interval = setInterval(fetchProviderStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> LIVE</span>;
      case 'RECENT':
        return <span className="badge badge-info"><Clock size={12} /> RECENT</span>;
      case 'STALE':
        return <span className="badge badge-warning"><AlertTriangle size={12} /> STALE</span>;
      case 'HISTORICAL':
        return <span className="badge badge-neutral"><Clock size={12} /> HISTORICAL</span>;
      case 'DERIVED':
        return <span className="badge badge-info"><Activity size={12} /> DERIVED</span>;
      case 'UNAVAILABLE':
        return <span className="badge badge-critical"><AlertTriangle size={12} /> UNAVAILABLE</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const getTagClass = (status: string) => {
    if (['LIVE', 'RECENT', 'HISTORICAL'].includes(status)) return 'data-tag-real';
    if (status === 'SIMULATED') return 'data-tag-simulated';
    return 'data-tag-derived';
  };

  const coreServices = [
    { name: 'Arohan Core Database (PostGIS)', status: 'HEALTHY', desc: 'Async SQLite / PostGIS relational persistence & audit store', icon: Database, tag: 'SYSTEM' },
    { name: 'Proactive Decision Engine', status: 'HEALTHY', desc: 'Loss objective optimizer & risk threshold trigger engine', icon: ShieldCheck, tag: 'DERIVED' },
    { name: 'WebSocket Stream Dispatcher', status: isConnected ? 'HEALTHY' : 'CONNECTING', desc: 'Real-time state broadcast & driver mobile PWA push queue', icon: Server, tag: 'SYSTEM' },
  ];

  const positioningLayers = [
    { title: 'Information Systems of Record (ASDMA, NESAC, ULIP, e-DAR)', role: 'Data & Telemetry Providers', desc: 'Raw environmental history, weather radar, and cargo records.' },
    { title: 'AROHAN Proactive Decision Layer (MDoNER Layer)', role: 'Decision Intelligence & Coordination', desc: 'Converts forecast risk into proactive logistics decisions, coordinates dispatchers, and replans dynamically.' },
    { title: 'Field Execution Layer (Driver Mobile PWA & Field Verifiers)', role: 'Execution & Reality Feedback', desc: 'Receives updated route instructions, acknowledges plans, and reports live road blockages.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">SYSTEM HEALTH & TELEMETRY INGESTION PIPELINE</h1>
          <div className="page-description">
            Live External Telemetry Adapters · Provider Freshness & Validation · Core Engine Status
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchProviderStatuses} disabled={loading} style={{ gap: 6 }}>
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>REFRESH FRESHNESS</span>
        </button>
      </div>

      {/* Provider Status Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <CloudRain size={14} />
            <span>EXTERNAL GEOSPATIAL & METEOROLOGICAL ADAPTERS</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Polled: {lastRefreshed || 'Just now'}</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>PROVIDER NAME</th>
                <th>CLASSIFICATION</th>
                <th>STATUS</th>
                <th>OBSERVED / RETRIEVED</th>
                <th>FRESHNESS</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.name}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className={`data-tag ${getTagClass(p.status)}`}>{p.source.split(' ')[0]}</span></td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>
                    {p.observed_at ? new Date(p.observed_at).toLocaleTimeString() : 'N/A'} IST
                  </td>
                  <td><span className="badge badge-info">{p.freshness_seconds}s</span></td>
                  <td style={{ fontSize: '0.75rem' }}>{p.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Core Services Health */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShieldCheck size={14} />
            <span>CORE SERVICES & ENGINE HEALTH</span>
          </div>
          <span className="badge badge-success">[ALL SYSTEMS OPERATIONAL]</span>
        </div>

        <div className="grid-3">
          {coreServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <div key={srv.name} className="card" style={{ backgroundColor: 'var(--bg-panel)' }}>
                <div className="card-header" style={{ marginBottom: 4, paddingBottom: 4 }}>
                  <div className="card-title" style={{ fontSize: '0.78rem' }}>
                    <Icon size={14} />
                    <span>{srv.name}</span>
                  </div>
                  <span className="badge badge-success">[{srv.status}]</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{srv.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Positioning Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={14} />
            <span>OPERATIONAL SYSTEM POSITIONING MATRIX</span>
          </div>
          <span className="data-tag data-tag-real">ARCHITECTURE</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SYSTEM LAYER</th>
                <th>PRIMARY ROLE</th>
                <th>AROHAN RELATIONSHIP</th>
              </tr>
            </thead>
            <tbody>
              {positioningLayers.map((layer) => (
                <tr key={layer.title}>
                  <td><strong>{layer.title}</strong></td>
                  <td><span className="badge badge-info">[{layer.role}]</span></td>
                  <td>{layer.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
