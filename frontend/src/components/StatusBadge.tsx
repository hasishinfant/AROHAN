import React from 'react';
import { ShipmentStatus, SegmentStatus } from '../types';

export function StatusBadge({ status }: { status: ShipmentStatus | string }) {
  const map: Record<string, { cls: string; label: string; dot: string }> = {
    PLANNED: { cls: 'badge-neutral', label: 'Planned', dot: '#94a3b8' },
    APPROVED: { cls: 'badge-success', label: 'Approved', dot: '#10b981' },
    DISPATCHED: { cls: 'badge-info', label: 'Dispatched', dot: '#3b82f6' },
    DRIVER_ACKNOWLEDGED: { cls: 'badge-info', label: 'Driver Assigned', dot: '#3b82f6' },
    IN_TRANSIT: { cls: 'badge-success', label: 'In Transit', dot: '#10b981' },
    DISRUPTED: { cls: 'badge-critical', label: 'SLA Breached', dot: '#dc2626' },
    REPLANNED: { cls: 'badge-amber', label: 'Rerouted', dot: '#f59e0b' },
    DELIVERED: { cls: 'badge-success', label: 'Delivered', dot: '#10b981' },
    PENDING: { cls: 'badge-amber', label: 'At Risk', dot: '#f59e0b' },
    REJECTED: { cls: 'badge-critical', label: 'Rejected', dot: '#dc2626' },
    MODIFIED: { cls: 'badge-info', label: 'Modified', dot: '#3b82f6' },
    CLEAR: { cls: 'badge-success', label: 'Clear Route', dot: '#10b981' },
    SLOW: { cls: 'badge-amber', label: 'Slow Congestion', dot: '#f59e0b' },
    PARTIAL: { cls: 'badge-amber', label: 'Partial Delay', dot: '#f59e0b' },
    BLOCKED: { cls: 'badge-critical', label: 'Corridor Blocked', dot: '#dc2626' },
    PROACTIVE: { cls: 'badge-success', label: 'Proactive AI', dot: '#10b981' },
    REACTIVE: { cls: 'badge-info', label: 'Standard Route', dot: '#3b82f6' },
    HIGH: { cls: 'badge-critical', label: 'High Risk', dot: '#dc2626' },
    MEDIUM: { cls: 'badge-amber', label: 'At Risk', dot: '#f59e0b' },
    LOW: { cls: 'badge-success', label: 'Normal SLA', dot: '#10b981' },
  };

  const item = map[status] || { cls: 'badge-neutral', label: String(status).replace('_', ' '), dot: '#94a3b8' };

  return (
    <span className={`badge ${item.cls}`}>
      <span className="badge-dot" style={{ backgroundColor: item.dot }} />
      <span>{item.label}</span>
    </span>
  );
}

export function SegmentStatusDot({ status }: { status: SegmentStatus }) {
  const colors: Record<SegmentStatus, string> = {
    CLEAR: '#10b981',
    SLOW: '#f59e0b',
    PARTIAL: '#f59e0b',
    BLOCKED: '#dc2626',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: colors[status] ?? '#94a3b8',
      }}
    />
  );
}
