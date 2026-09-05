import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { MissionScoreCard } from '../components/MissionScoreCard';
import { StatusBadge } from '../components/StatusBadge';
import { Package, Route, Truck } from 'lucide-react';
import { JOGIGHOPA_MULTIMODAL_DEMO } from '../config/multimodalRoutes';

export function MissionDetail() {
  const { shipment, shipmentsList, selectedShipmentId, selectShipment, routes, risk_results, mission_scores, current_recommendation, scenario_step } = useArohanStore();
  const step = scenario_step ?? -1;

  const fallbackScoreA = {
    route_id: 1,
    route_label: 'A' as const,
    travel_time_h: 3.0,
    disruption_probability: 0.74,
    expected_delay_h: 9.4,
    base_time_penalty: 30,
    delay_penalty: 45,
    urgency_risk_penalty: 13,
    mission_score: 88,
  };

  const fallbackScoreB = {
    route_id: 2,
    route_label: 'B' as const,
    travel_time_h: 4.2,
    disruption_probability: 0.22,
    expected_delay_h: 1.5,
    base_time_penalty: 21,
    delay_penalty: 8,
    urgency_risk_penalty: 5,
    mission_score: 34,
  };

  const fallbackRiskA = {
    route_id: 1,
    route_label: 'A' as const,
    disruption_probability: 0.74,
    confidence: 'HIGH' as const,
    horizon_h: 18,
    score_breakdown: { rainfall: 0.42, slope: 0.32 },
  };

  const fallbackRiskB = {
    route_id: 2,
    route_label: 'B' as const,
    disruption_probability: 0.22,
    confidence: 'HIGH' as const,
    horizon_h: 18,
    score_breakdown: { rainfall: 0.12, slope: 0.10 },
  };

  const scoreA = (mission_scores ? Object.values(mission_scores).find((s: any) => s.route_label === 'A') : null) || fallbackScoreA;
  const scoreB = (mission_scores ? Object.values(mission_scores).find((s: any) => s.route_label === 'B') : null) || fallbackScoreB;
  const riskA = (risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'A') : null) || fallbackRiskA;
  const riskB = (risk_results ? Object.values(risk_results).find((r: any) => r.route_label === 'B') : null) || fallbackRiskB;
  const routeA = routes?.find((r) => r.label === 'A');
  const routeB = routes?.find((r) => r.label === 'B');

  const winner = current_recommendation?.recommended_route_label || 'B';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">MISSION DOSSIER & ROUTE EVALUATION</h1>
          <div className="page-description">
            Technical Route Risk & Loss Score Analysis · Active Focus: {shipment?.shipment_code} ({shipment?.origin.split(' ')[0]} → {shipment?.destination.split(' ')[0]})
          </div>
        </div>
        {shipment && <StatusBadge status={shipment.status} />}
      </div>

      {/* Interactive Shipment Tabs (CLICK TAB TO VIEW PARTICULAR SHIPMENT ALONE) */}
      <div className="card" style={{ padding: 8 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
          SELECT PARTICULAR MISSION TO INSPECT:
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {shipmentsList?.map((s) => {
            const isSelected = (selectedShipmentId || 1) === s.id;
            return (
              <button
                key={s.id}
                onClick={() => selectShipment(s.id)}
                className={`btn btn-sm ${isSelected ? 'btn-blue' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem' }}
              >
                <Truck size={12} />
                <span>{s.shipment_code}: {s.origin.split(' ')[0]} → {s.destination.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shipment Specification Sheet for Particular Selected Shipment */}
      {shipment && (
        <div className="card" style={{ border: '2px solid #1d4ed8' }}>
          <div className="card-header">
            <div className="card-title">
              <Package size={14} style={{ color: '#1d4ed8' }} />
              <span>SHIPMENT DOSSIER — PARTICULAR FOCUS: {shipment.shipment_code}</span>
            </div>
            <span className="data-tag data-tag-real">PARTICULAR SHIPMENT</span>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>CARGO TYPE</th>
                  <th>TOTAL WEIGHT</th>
                  <th>PRIORITY / URGENCY</th>
                  <th>ORIGIN DEPOT</th>
                  <th>DESTINATION HUB</th>
                  <th>ASSIGNED CORRIDOR ROUTE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 800 }}>{shipment.cargo_type}</td>
                  <td style={{ fontWeight: 700 }}>{shipment.weight_kg} kg</td>
                  <td style={{ fontWeight: 800, color: shipment.urgency >= 4 ? '#dc2626' : '#b45309' }}>
                    Level {shipment.urgency}/5 ({shipment.urgency >= 4 ? 'High Priority' : 'Standard Priority'})
                  </td>
                  <td style={{ fontWeight: 700 }}>{shipment.origin}</td>
                  <td style={{ fontWeight: 700 }}>{shipment.destination}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Route {routes?.find((r) => r.id === shipment.assigned_route_id)?.label ?? 'A'}
                    {step >= 5 && winner && (selectedShipmentId === 1) && ` → Route ${winner} (Updated)`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multimodal Journey Leg Breakdown Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Package size={14} style={{ color: '#1d4ed8' }} />
            <span>MULTIMODAL JOURNEY LEG BREAKDOWN ({shipment?.shipment_code})</span>
          </div>
          <span className="data-tag data-tag-simulated">MULTIMODAL LEG ARCHITECTURE</span>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
          Multimodal journey abstraction breaking down total freight trajectory into mode-specific legs across LAND, WATER, RAIL and AIR corridors.
        </div>

        <div className="grid-3" style={{ gap: 8 }}>
          {JOGIGHOPA_MULTIMODAL_DEMO.legs.map((leg) => (
            <div key={leg.id} className="card" style={{ backgroundColor: 'var(--bg-panel)', padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>LEG {leg.legNumber} · [{leg.mode}]</span>
                <span className="data-tag data-tag-real" style={{ fontSize: '0.6rem' }}>{leg.status}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {leg.origin.split(' ')[0]} → {leg.destination.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Vehicle: <strong>{leg.vehicleName.split(' ')[0]}</strong> ({leg.distance_km} km)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Mission Loss Score Cards */}
      {scoreA && scoreB && (
        <div>
          <div className="section-header">
            <span>LOGISTICS MISSION LOSS SCORE ANALYSIS — {shipment?.shipment_code}</span>
            <span className="data-tag data-tag-derived">DERIVED OPTIMIZATION MODEL</span>
          </div>
          <div className="grid-2">
            <MissionScoreCard
              score={scoreA}
              highlight={winner === 'A' ? 'winner' : winner === 'B' ? 'loser' : 'neutral'}
            />
            <MissionScoreCard
              score={scoreB}
              highlight={winner === 'B' ? 'winner' : winner === 'A' ? 'loser' : 'neutral'}
            />
          </div>
        </div>
      )}

      {/* Technical Comparison Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Route size={14} />
            <span>TECHNICAL ROUTE COMPARISON MATRIX</span>
          </div>
          <span className="data-tag data-tag-real">REAL GIS NETWORK</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ATTRIBUTE / PARAMETER</th>
                <th>ROUTE A — Main Corridor</th>
                <th>ROUTE B — Alternate Ridge Bypass</th>
                <th>CLASSIFICATION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Distance (km)</strong></td>
                <td>{routeA?.distance_km ?? 102} km</td>
                <td>{routeB?.distance_km ?? 128} km</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Base Travel Duration</strong></td>
                <td>{routeA?.base_duration_h ?? 3.0} hrs</td>
                <td>{routeB?.base_duration_h ?? 4.2} hrs</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Corridor Description</strong></td>
                <td>{routeA?.via_description ?? 'Main arterial road'}</td>
                <td>{routeB?.via_description ?? 'Highland ridge bypass route'}</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Terrain Vulnerability Index</strong></td>
                <td style={{ color: '#dc2626', fontWeight: 800 }}>High Exposure (0.85)</td>
                <td style={{ color: '#16a34a', fontWeight: 800 }}>Low Exposure (0.25)</td>
                <td><span className="data-tag data-tag-real">REAL</span></td>
              </tr>
              <tr>
                <td><strong>Disruption Risk Probability</strong></td>
                <td style={{ color: '#dc2626', fontWeight: 800 }}>
                  {riskA ? `${(riskA.disruption_probability * 100).toFixed(0)}%` : 'Baseline Monitoring'}
                </td>
                <td style={{ color: '#16a34a', fontWeight: 800 }}>
                  {riskB ? `${(riskB.disruption_probability * 100).toFixed(0)}%` : 'Baseline Monitoring'}
                </td>
                <td><span className="data-tag data-tag-derived">DERIVED ML</span></td>
              </tr>
              <tr>
                <td><strong>Expected Delay Impact</strong></td>
                <td style={{ color: '#dc2626', fontWeight: 800 }}>
                  {scoreA ? `+${scoreA.expected_delay_h.toFixed(1)} hrs` : '—'}
                </td>
                <td style={{ color: '#16a34a', fontWeight: 800 }}>
                  {scoreB ? `+${scoreB.expected_delay_h.toFixed(1)} hrs` : '—'}
                </td>
                <td><span className="data-tag data-tag-derived">DERIVED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
