import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { Activity, ShieldCheck, Database, Radio, Server, CloudRain, CheckCircle2, Layers } from 'lucide-react';

export function SystemHealth() {
  const { isConnected } = useArohanStore();

  const services = [
    { name: 'IMD Weather Data Provider', status: 'CONNECTED', desc: 'Real-time rainfall intensity & 24h cumulative precipitation grid', icon: CloudRain, tag: 'REAL' },
    { name: 'OSM Road Network Provider', status: 'AVAILABLE', desc: 'North Eastern Region GIS geometry & topological road graph', icon: Layers, tag: 'REAL' },
    { name: 'Terrain Hazard Telemetry', status: 'AVAILABLE', desc: 'Slope vulnerability & historical landslide susceptibility index', icon: Radio, tag: 'REAL' },
    { name: 'Arohan Core Database (PostGIS)', status: 'HEALTHY', desc: 'Async SQLite / PostGIS relational persistence & audit store', icon: Database, tag: 'SYSTEM' },
    { name: 'Proactive Decision Engine', status: 'HEALTHY', desc: 'Loss objective optimizer & risk threshold trigger engine', icon: ShieldCheck, tag: 'DERIVED' },
    { name: 'WebSocket & PWA Dispatcher', status: isConnected ? 'HEALTHY' : 'CONNECTING', desc: 'Real-time state broadcast & driver mobile PWA push queue', icon: Server, tag: 'SYSTEM' },
  ];

  const positioningLayers = [
    { title: 'Information Systems of Record (ASDMA, NESAC, ULIP, e-DAR)', role: 'Data & Telemetry Providers', desc: 'Provides raw environmental history, weather radar, and cargo records.' },
    { title: 'AROHAN Proactive Decision Layer (MDoNER Layer)', role: 'Decision Intelligence & Coordination', desc: 'Converts forecast risk into proactive logistics decisions, coordinates dispatchers, and replans dynamically.' },
    { title: 'Field Execution Layer (Driver Mobile PWA & Field Verifiers)', role: 'Execution & Reality Feedback', desc: 'Receives updated route instructions, acknowledges plans, and reports live road blockages.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">SYSTEM HEALTH</h1>
          <div className="page-description">
            Operational Service Telemetry · Live Core Integration Health · Data Classification & Provenance
          </div>
        </div>
      </div>

      {/* System Health Status Grid */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>CORE INTEGRATION & ENGINE HEALTH STATUS</span>
          <span className="badge badge-success">ALL SYSTEMS OPERATIONAL</span>
        </div>

        <div className="grid-3">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div key={srv.name} className="card">
                <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
                  <div className="card-title" style={{ fontSize: '0.88rem' }}>
                    <Icon size={16} style={{ color: 'var(--primary-navy)' }} />
                    <span>{srv.name}</span>
                  </div>
                  <span className="data-tag data-tag-real">{srv.tag}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{srv.desc}</div>
                  <span className="badge badge-success" style={{ flexShrink: 0, marginLeft: 8 }}>
                    <CheckCircle2 size={12} />
                    <span>{srv.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Layer Positioning Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} style={{ color: 'var(--primary-navy)' }} />
            <span>OPERATIONAL SYSTEM POSITIONING</span>
          </div>
          <span className="data-tag data-tag-real">TELEMETRY SCOPE</span>
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
                  <td><span className="badge badge-info">{layer.role}</span></td>
                  <td>{layer.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Provenance Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} />
            <span>DATA PROVENANCE & CLASSIFICATION DISCLOSURE</span>
          </div>
          <span className="data-tag data-tag-real">TRANSPARENCY</span>
        </div>

        <div className="grid-3">
          <div className="card" style={{ backgroundColor: 'var(--bg-panel)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>REAL DATA</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: 4 }}>
              • OpenStreetMap GIS road geometry & distance<br />
              • IMD rainfall intensity & 24h cumulative grid<br />
              • Terrain elevation slope factor & historical risk index
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--bg-panel)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>SIMULATED DATA</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: 4 }}>
              • Vehicle GPS real-time location (AS-01-A-1234)<br />
              • Shipment cargo manifest & priority level (SHP-001)<br />
              • Dispatcher operational response latency
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--bg-panel)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>DERIVED DATA</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: 4 }}>
              • ML Disruption Risk Probability (78% Route A)<br />
              • Expected Mission Loss Score & Delay Impact<br />
              • Proactive Reroute Recommendation & Delay Avoided KPI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
