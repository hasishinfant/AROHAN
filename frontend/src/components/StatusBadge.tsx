import React from 'react';
import { ShipmentStatus, SegmentStatus } from '../types';

export function StatusBadge({ status }: { status: ShipmentStatus | string }) {
  const map: Record<string, string> = {
    PLANNED: 'badge-neutral',
    APPROVED: 'badge-info',
    DISPATCHED: 'badge-warning',
    DRIVER_ACKNOWLEDGED: 'badge-info',
    IN_TRANSIT: 'badge-info',
    DISRUPTED: 'badge-critical',
    REPLANNED: 'badge-warning',
    DELIVERED: 'badge-success',
    PENDING: 'badge-warning',
    REJECTED: 'badge-critical',
    MODIFIED: 'badge-info',
    CLEAR: 'badge-success',
    SLOW: 'badge-warning',
    PARTIAL: 'badge-warning',
    BLOCKED: 'badge-critical',
    PROACTIVE: 'badge-warning',
    REACTIVE: 'badge-info',
    HIGH: 'badge-critical',
    MEDIUM: 'badge-warning',
    LOW: 'badge-success',
  };

  const cls = map[status] ?? 'badge-neutral';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      <span>{status}</span>
    </span>
  );
}

export function SegmentStatusDot({ status }: { status: SegmentStatus }) {
  const colors: Record<SegmentStatus, string> = {
    CLEAR: '#16a34a',
    SLOW: '#d97706',
    PARTIAL: '#d97706',
    BLOCKED: '#dc2626',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: colors[status] ?? '#64748b',
      }}
    />
  );
}
