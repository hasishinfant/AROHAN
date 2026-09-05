import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileSpreadsheet,
  MessageSquare,
  Compass
} from 'lucide-react';

export function ResourceDashboard() {
  const navigate = useNavigate();
  const {
    resourceStocks,
    resourceTransfers,
    fetchResources,
    matchResources,
    approveTransfer,
    openWhatsAppModal
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
      <div className="page-header" style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              DISTRICT RESOURCE REDISTRIBUTION CONSOLE
            </h1>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 3 }}>
            District-Level Inventory Monitoring · Surplus-to-Shortage Matching · Inter-District Reallocation
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => fetchResources()}
            title="Refresh district inventory"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} />
            <span>REFRESH STOCK</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleRunMatch}
            disabled={isMatching}
            style={{ backgroundColor: '#059669', borderColor: '#047857', fontSize: '0.75rem', padding: '6px 12px' }}
          >
            <Boxes size={14} />
            <span>{isMatching ? 'CALCULATING MATCHES...' : 'EXECUTE REDISTRIBUTION'}</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 14, border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
            MANAGED DISTRICT STOCKS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginTop: 4 }}>
            {resourceStocks.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
            Across 5 Core NER Districts
          </div>
        </div>

        <div className="card" style={{ padding: 14, border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
            SURPLUS DISTRICT BASES
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', marginTop: 4 }}>
            {resourceStocks.filter((s) => s.status === 'SURPLUS').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
            Kamrup Metro (Guwahati Inland Depots)
          </div>
        </div>

        <div className="card" style={{ padding: 14, borderColor: '#FECDD3', backgroundColor: '#FFFDFD', borderRadius: 8 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>
            CRITICAL / SHORTAGE DEFICITS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#DC2626', marginTop: 4 }}>
            {resourceStocks.filter((s) => s.status === 'CRITICAL' || s.status === 'SHORTAGE').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 600, marginTop: 2 }}>
            East Khasi Hills & Cachar (Floods/Blockage)
          </div>
        </div>

        <div className="card" style={{ padding: 14, borderColor: '#A7F3D0', backgroundColor: '#F0FDF4', borderRadius: 8 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>
            PENDING REALLOCATIONS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857', marginTop: 4 }}>
            {resourceTransfers.filter((t) => t.status === 'PENDING').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, marginTop: 2 }}>
            Awaiting Executive Dispatch Approval
          </div>
        </div>
      </div>

      {/* SECTION 1: RECOMMENDED INTER-DISTRICT TRANSFERS */}
      <div className="card" style={{ padding: 16, border: '1px solid #A7F3D0', backgroundColor: '#FFFFFF', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                RECOMMENDED INTER-DISTRICT RESOURCE REDISTRIBUTION
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Automated matching: Nearest Feasible Surplus + Low-Risk Route + Sufficient Inventory
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
              borderRadius: 4,
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
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 600 }}>
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
                          borderRadius: 4,
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>ESTIMATED TRANSIT</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                        {transfer.eta_hours}h · {transfer.distance_km} km
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                        Corridor Risk: {transfer.route_risk_level}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => navigate('/map?focus=nh6')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '6px 10px',
                          borderRadius: 6,
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1D4ED8',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="View Reallocation Route on GIS Map"
                      >
                        <Compass size={13} />
                        <span>VIEW ON MAP</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openWhatsAppModal({
                          driverName: 'Relief Convoy Lead',
                          driverPhone: '+91 94350 12345',
                          cargo: `${transfer.quantity} ${transfer.unit} ${transfer.resource_type}`,
                          source: transfer.source_district,
                          destination: transfer.destination_district,
                          route: transfer.recommended_route_label
                        })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '6px 10px',
                          borderRadius: 6,
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#047857',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Dispatch Driver via Multilingual WhatsApp"
                      >
                        <MessageSquare size={13} />
                        <span>SEND WHATSAPP</span>
                      </button>

                      {isPending ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApproveTransfer(transfer.id)}
                          disabled={approvingId === transfer.id}
                          style={{ backgroundColor: '#059669', borderColor: '#047857', fontSize: '0.74rem', padding: '6px 12px' }}
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
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            padding: '6px 10px',
                            borderRadius: 6,
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>APPROVED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: DISTRICT INVENTORY REGISTRY */}
      <div className="card" style={{ padding: 16, border: '1px solid #E2E8F0', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
              DISTRICT RESOURCE INVENTORY MATRIX
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Civil supplies, medical stockpiles, and essential relief reserves across districts
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
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: '0.75rem',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#0F172A',
                outline: 'none',
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
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: '0.75rem',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#0F172A',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SURPLUS">Surplus Only</option>
              <option value="ADEQUATE">Adequate Only</option>
              <option value="LOW">Low Stock</option>
              <option value="SHORTAGE">Shortage</option>
              <option value="CRITICAL">Critical Deficit</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569' }}>DISTRICT & STATE</th>
                <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569' }}>RESOURCE COMMODITY</th>
                <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>AVAILABLE</th>
                <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>REQUIRED</th>
                <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>NET BALANCE</th>
                <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569' }}>STORAGE FACILITY</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock, idx) => {
                const available = stock.available_qty ?? 0;
                const required = stock.required_qty ?? 0;
                const balance = available - required;
                const badge = getStatusBadge(stock.status);
                return (
                  <tr
                    key={stock.id || idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFDFB',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={14} style={{ color: '#64748B' }} />
                        <span>{stock.district_name}, {stock.state_name || 'Assam'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 600 }}>
                      {stock.resource_type}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                      {available.toLocaleString()} {stock.unit}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>
                      {required.toLocaleString()} {stock.unit}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: balance >= 0 ? '#059669' : '#DC2626',
                      }}
                    >
                      {balance > 0 ? `+${balance.toLocaleString()}` : balance.toLocaleString()} {stock.unit}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          padding: '2px 8px',
                          borderRadius: 4,
                          display: 'inline-block',
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '0.72rem' }}>
                      {stock.storage_facility || 'District Relief Buffer Depot'}
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
