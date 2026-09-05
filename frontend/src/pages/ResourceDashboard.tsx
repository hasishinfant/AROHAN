import React, { useState, useEffect } from 'react';
import { useArohanStore } from '../stores/arohanStore';
import { DecisionFlowStepper } from '../components/DecisionFlowStepper';
import {
  Boxes,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Building2,
  Truck,
  CheckCircle2,
  Filter,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export function ResourceDashboard() {
  const {
    resourceStocks,
    resourceTransfers,
    fetchResources,
    matchResources,
    approveTransfer
  } = useArohanStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const categories = ['ALL', 'Rice & Food Grains', 'Emergency Medical Kits', 'High-Altitude Oxygen Cylinders', 'Potable Drinking Water', 'Disaster Recovery Fuel'];

  const filteredStocks = resourceStocks.filter((s) => {
    const matchCat = selectedCategory === 'ALL' || s.resource_type === selectedCategory;
    const matchStat = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchCat && matchStat;
  });

  const handleApproveTransfer = async (id: number) => {
    setApprovingId(id);
    try {
      await approveTransfer(id);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRunMatch = async () => {
    setIsMatching(true);
    try {
      await matchResources();
    } finally {
      setIsMatching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SURPLUS':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'SURPLUS' };
      case 'ADEQUATE':
        return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'ADEQUATE' };
      case 'LOW':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'LOW STOCK' };
      case 'SHORTAGE':
        return { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA', label: 'SHORTAGE' };
      case 'CRITICAL':
        return { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3', label: 'CRITICAL DEFICIT' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* End-to-End Decision Flow Stepper */}
      <DecisionFlowStepper />

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="page-title">DISTRICT RESOURCE REDISTRIBUTION CONSOLE</h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FCD34D',
                padding: '2px 8px',
                borderRadius: 9999,
                letterSpacing: '0.04em',
              }}
            >
              PROTOTYPE DATA
            </span>
          </div>
          <div className="page-description">
            District-Level Inventory Monitoring · Surplus-to-Shortage Matching · Inter-District Reallocation
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchResources()}
            title="Refresh district inventory"
          >
            <RefreshCw size={13} />
            <span>REFRESH STOCK</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleRunMatch}
            disabled={isMatching}
            style={{ backgroundColor: '#059669', borderColor: '#047857' }}
          >
            <Boxes size={14} />
            <span>{isMatching ? 'CALCULATING MATCHES...' : 'RUN SMART REDISTRIBUTION'}</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            MANAGED DISTRICT STOCKS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {resourceStocks.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
            Across 5 Core NER Districts
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            SURPLUS DISTRICT BASES
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
            {resourceStocks.filter((s) => s.status === 'SURPLUS').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
            Kamrup Metro (Guwahati Inland Depots)
          </div>
        </div>

        <div className="card" style={{ padding: 16, borderColor: '#FED7AA', backgroundColor: '#FFFDF9' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase' }}>
            CRITICAL / SHORTAGE DEFICITS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626', marginTop: 4 }}>
            {resourceStocks.filter((s) => s.status === 'CRITICAL' || s.status === 'SHORTAGE').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 600, marginTop: 4 }}>
            East Khasi Hills & Cachar (Floods/Blockage)
          </div>
        </div>

        <div className="card" style={{ padding: 16, borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>
            PENDING REALLOCATIONS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#047857', marginTop: 4 }}>
            {resourceTransfers.filter((t) => t.status === 'PENDING').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, marginTop: 4 }}>
            Awaiting Executive Dispatch Approval
          </div>
        </div>
      </div>

      {/* SECTION 1: RECOMMENDED INTER-DISTRICT TRANSFERS */}
      <div className="card" style={{ padding: 18, border: '1px solid #059669', backgroundColor: '#FAFAF9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#059669',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                RECOMMENDED INTER-DISTRICT RESOURCE REDISTRIBUTION
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Algorithmic matching: Nearest Feasible Surplus + Low-Risk Route + Sufficient Inventory
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              padding: '3px 8px',
              borderRadius: 9999,
            }}
          >
            {resourceTransfers.length} ACTIVE TRANSFERS
          </span>
        </div>

        {resourceTransfers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#64748B', fontSize: '0.8rem' }}>
            No inter-district transfers required. All monitored districts maintain adequate stock reserves.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resourceTransfers.map((transfer) => {
              const isPending = transfer.status === 'PENDING';
              return (
                <div
                  key={transfer.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 620 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>
                        {transfer.transfer_code}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: transfer.status === 'APPROVED' ? '#ECFDF5' : '#FEF3C7',
                          color: transfer.status === 'APPROVED' ? '#047857' : '#92400E',
                          padding: '2px 6px',
                          borderRadius: 9999,
                        }}
                      >
                        {transfer.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Mode: <strong>{transfer.transport_mode}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                      <span>{transfer.source_district} (Surplus)</span>
                      <ArrowRight size={14} style={{ color: '#059669' }} />
                      <span>{transfer.destination_district} (Shortage)</span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      Reallocating <strong>{transfer.quantity.toLocaleString()} {transfer.unit}</strong> of{' '}
                      <strong>{transfer.resource_type}</strong> via{' '}
                      <span style={{ color: '#059669', fontWeight: 600 }}>{transfer.recommended_route_label}</span>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.4 }}>
                      {transfer.reason}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>ESTIMATED TRANSIT</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                        {transfer.eta_hours}h · {transfer.distance_km} km
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                        Corridor Risk: {transfer.route_risk_level}
                      </div>
                    </div>

                    {isPending ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApproveTransfer(transfer.id)}
                        disabled={approvingId === transfer.id}
                        style={{ backgroundColor: '#059669', borderColor: '#047857', whiteSpace: 'nowrap' }}
                      >
                        <CheckCircle2 size={13} />
                        <span>{approvingId === transfer.id ? 'APPROVING...' : 'APPROVE TRANSFER'}</span>
                      </button>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#047857',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#ECFDF5',
                          padding: '6px 12px',
                          borderRadius: 8,
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>APPROVED FOR DISPATCH</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: DISTRICT INVENTORY REGISTRY */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
              DISTRICT RESOURCE INVENTORY MATRIX
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Civil supplies, medical stockpiles, and essential relief reserves
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B' }}>
              <Filter size={13} />
              <span>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SURPLUS">Surplus</option>
              <option value="ADEQUATE">Adequate</option>
              <option value="LOW">Low Stock</option>
              <option value="SHORTAGE">Shortage</option>
              <option value="CRITICAL">Critical Deficit</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '10px 12px', color: '#475569' }}>DISTRICT & STATE</th>
                <th style={{ padding: '10px 12px', color: '#475569' }}>RESOURCE COMMODITY</th>
                <th style={{ padding: '10px 12px', color: '#475569' }}>AVAILABLE</th>
                <th style={{ padding: '10px 12px', color: '#475569' }}>REQUIRED</th>
                <th style={{ padding: '10px 12px', color: '#475569' }}>NET BALANCE</th>
                <th style={{ padding: '10px 12px', color: '#475569' }}>STATUS</th>
                <th style={{ padding: '10px 12px', color: '#475569' }}>STORAGE FACILITY</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => {
                const badge = getStatusBadge(stock.status);
                const net = stock.available_qty - stock.required_qty;
                return (
                  <tr key={stock.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{stock.district_name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{stock.state_name}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1E293B' }}>
                      {stock.resource_type}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>
                      {stock.available_qty.toLocaleString()} {stock.unit}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>
                      {stock.required_qty.toLocaleString()} {stock.unit}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: net >= 0 ? '#059669' : '#DC2626' }}>
                      {net >= 0 ? `+${net.toLocaleString()}` : net.toLocaleString()} {stock.unit}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '0.72rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} style={{ color: '#94A3B8' }} />
                        <span>{stock.storage_facility}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
