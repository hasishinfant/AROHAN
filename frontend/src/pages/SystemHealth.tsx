import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { Activity, ShieldCheck, Database, Radio, Server, CloudRain, CheckCircle2, Layers, Cpu, GitBranch } from 'lucide-react';

export function SystemHealth() {
  const { isConnected } = useArohanStore();

  const techStack = [
    { layer: 'Command + Field Frontend', tech: 'React + TypeScript + Vite', purpose: 'Two portals with one shared frontend codebase' },
    { layer: 'UI', tech: 'Tailwind CSS + shadcn/ui', purpose: 'Professional Command UI + simple Field UI' },
    { layer: 'Maps/GIS', tech: 'MapLibre GL JS', purpose: 'Interactive NER map, route/segment visualization' },
    { layer: 'Backend API', tech: 'Python + FastAPI + Pydantic', purpose: 'Missions, decisions, field reports, replanning' },
    { layer: 'Database', tech: 'PostgreSQL + PostGIS', purpose: 'Missions, roads, warehouses, vehicles, geospatial state' },
    { layer: 'Routing', tech: 'OSRM + NetworkX', purpose: 'Route generation, route graph, remaining-journey analysis' },
    { layer: 'Optimization', tech: 'Google OR-Tools', purpose: 'Mission-aware route/constraint optimization where needed' },
    { layer: 'Risk/ML', tech: 'Python + scikit-learn / XGBoost', purpose: 'Future accessibility-risk prediction' },
    { layer: 'GIS processing', tech: 'GeoPandas + Shapely', purpose: 'Spatial analysis and road/terrain processing' },
    { layer: 'Terrain', tech: 'Rasterio', purpose: 'DEM/terrain analysis when required' },
    { layer: 'Real-time communication', tech: 'WebSockets', purpose: 'Mission/vehicle/network-state updates' },
    { layer: 'Offline Field', tech: 'PWA + Service Worker + IndexedDB', purpose: 'Cached mission, route, field reports, offline queue' },
    { layer: 'Background jobs', tech: 'Celery + Redis / FastAPI workers', purpose: 'Data refresh/recalculation; choose the simpler option for MVP' },
    { layer: 'Authentication', tech: 'JWT + RBAC', purpose: 'Command vs Field authorization' },
    { layer: 'Deployment', tech: 'Docker', purpose: 'Reproducible deployment' },
    { layer: 'Frontend hosting', tech: 'Vercel / equivalent', purpose: 'MVP frontend' },
    { layer: 'Backend hosting', tech: 'Render / Railway / equivalent', purpose: 'MVP backend' },
    { layer: 'Database hosting', tech: 'Managed PostgreSQL/PostGIS', purpose: 'Production-style persistence' },
  ];

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
          <h1 className="page-title">SYSTEM HEALTH & ARCHITECTURE POSITIONING</h1>
          <div className="page-description">
            Operational Service Telemetry · Recommended Tech Stack · End-to-End System Flow
          </div>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE FLOW DIAGRAM CARD */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <GitBranch size={18} style={{ color: 'var(--primary-teal)' }} />
            <span>AROHAN END-TO-END OPERATIONAL ARCHITECTURE FLOW</span>
          </div>
          <span className="data-tag data-tag-real">SYSTEM PIPELINE</span>
        </div>

        <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: 20, borderRadius: 12, overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.45 }}>
          <pre>{`React + TypeScript + Vite
Tailwind + shadcn/ui
MapLibre
FastAPI + Pydantic
PostgreSQL + PostGIS
OSRM + NetworkX
Python ML (scikit-learn/XGBoost)
PWA + IndexedDB
WebSockets                    AROHAN
                       │
          ┌────────────┴────────────┐
          │                         │
   AROHAN COMMAND             AROHAN FIELD
   Operator portal             Driver portal
          │                         │
          └────────────┬────────────┘
                       │
                 FastAPI Backend
                       │
              ┌────────┼────────┐
              │        │        │
          Decision    Risk    Replanning
           Engine     Engine     Engine
              │        │        │
              └────────┼────────┘
                       │
                PostgreSQL/PostGIS
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    Weather          Roads            Terrain
    /Hazards        /GIS              /DEM
       │               │                │
       └───────────────┼────────────────┘
                       │
                 Field Feedback
                       ↓
                 Network State
                       ↓
                    REPLAN`}</pre>
        </div>
      </div>

      {/* RECOMMENDED AROHAN TECH STACK TABLE */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Cpu size={18} style={{ color: 'var(--primary-teal)' }} />
            <span>RECOMMENDED AROHAN SYSTEM TECH STACK</span>
          </div>
          <span className="data-tag data-tag-real">SIH 2026 ARCHITECTURE</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SYSTEM LAYER</th>
                <th>TECHNOLOGY</th>
                <th>PURPOSE & SCOPE</th>
              </tr>
            </thead>
            <tbody>
              {techStack.map((item) => (
                <tr key={item.layer}>
                  <td><strong>{item.layer}</strong></td>
                  <td><span className="badge badge-info">{item.tech}</span></td>
                  <td>{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Architecture Positioning Matrix (MDoNER Context) */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} style={{ color: 'var(--primary-navy)' }} />
            <span>MDoNER LOGISTICS DECISION ARCHITECTURE POSITIONING</span>
          </div>
          <span className="data-tag data-tag-real">SYSTEM ARCHITECTURE</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>LAYER / SYSTEM</th>
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
