import React from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { MapView } from '../components/Map/MapView';
import { StatusBadge } from '../components/StatusBadge';
import { UserCheck, Shield, AlertTriangle, Truck } from 'lucide-react';

export function SupervisorDashboard() {
  const { shipment, shipmentsList, selectedShipmentId, selectShipment, current_decision, approveDecision, rejectDecision } = useArohanStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page Header Banner */}
      <div className="card" style={{ backgroundColor: 'var(--primary-navy)', color: '#ffffff', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserCheck size={20} />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SUPERVISOR CONTROL ROOM — CORRIDOR OVERSIGHT
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Operational oversight for active shipments across NER. Click any shipment row below to view that particular shipment alone.
            </div>
          </div>
        </div>
      </div>

      <div className="grid-command-center">
        <div className="card" style={{ padding: 10 }}>
          <div className="card-header" style={{ marginBottom: 6, paddingBottom: 6 }}>
            <div className="card-title">
              <Shield size={14} />
              <span>SUPERVISOR GIS CORRIDOR MONITOR — {shipment?.shipment_code}</span>
            </div>
            <span className="data-tag data-tag-real">REAL OSM GIS</span>
          </div>
          <MapView />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current_decision && current_decision.status === 'PENDING' ? (
            <div className="card" style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5' }}>
              <div className="card-title" style={{ color: '#7c2d12', fontSize: '0.8rem' }}>
                <AlertTriangle size={14} />
                <span>REROUTE APPROVAL REQUIRED</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#0f172a', marginTop: 4 }}>
                Proactive Reroute to <strong>Route B (Ridge Bypass)</strong> recommended for {shipment?.shipment_code}. Avoids ~7.9h delay.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-success btn-sm" onClick={() => approveDecision(current_decision.id)} style={{ flex: 1 }}>
                  APPROVE
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => rejectDecision(current_decision.id, 'Supervisor override')} style={{ flex: 1 }}>
                  REJECT
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ backgroundColor: 'var(--bg-panel)' }}>
              <div className="card-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                SUPERVISOR APPROVAL QUEUE
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                No pending reroute approvals in queue for {shipment?.shipment_code}. All active journeys running on approved routes.
              </div>
            </div>
          )}

          {/* Interactive Multi-Shipment Table (CLICK ROW TO VIEW THAT PARTICULAR SHIPMENT ALONE) */}
          <div className="card" style={{ border: '2px solid #1d4ed8' }}>
            <div className="card-header" style={{ marginBottom: 6, paddingBottom: 6 }}>
              <div className="card-title">
                <Truck size={14} style={{ color: '#1d4ed8' }} />
                <span>ALL NER SHIPMENTS (CLICK ROW TO SELECT PARTICULAR SHIPMENT)</span>
              </div>
              <span className="data-tag data-tag-real">SELECT SHIPMENT</span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>CARGO TYPE</th>
                    <th>CORRIDOR</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentsList?.map((s) => {
                    const isSelected = (selectedShipmentId || 1) === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => selectShipment(s.id)}
                        style={{
                          backgroundColor: isSelected ? '#eff6ff' : undefined,
                          cursor: 'pointer',
                          fontWeight: isSelected ? 800 : 500,
                        }}
                      >
                        <td style={{ fontWeight: 900, color: isSelected ? '#1e40af' : '#0f172a' }}>
                          {isSelected && '► '}{s.shipment_code}
                        </td>
                        <td style={{ fontSize: '0.72rem' }}>{s.cargo_type.split(' ')[0]}</td>
                        <td style={{ fontSize: '0.72rem' }}>{s.origin.split(' ')[0]} → {s.destination.split(' ')[0]}</td>
                        <td><StatusBadge status={s.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
