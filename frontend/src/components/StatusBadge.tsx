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
    REPLANNED: 'badge-amber',
    DELIVERED: 'badge-success',
    PENDING: 'badge-amber',
    REJECTED: 'badge-critical',
    MODIFIED: 'badge-info',
    CLEAR: 'badge-success',
    SLOW: 'badge-amber',
    PARTIAL: 'badge-amber',
    BLOCKED: 'badge-critical',
    PROACTIVE: 'badge-amber',
    REACTIVE: 'badge-info',
    HIGH: 'badge-critical',
    MEDIUM: 'badge-amber',
    LOW: 'badge-success',
  };

  const cls = map[status] ?? 'badge-neutral';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      <span>[{status}]</span>
    </span>
  );
}

export function SegmentStatusDot({ status }: { status: SegmentStatus }) {
  const colors: Record<SegmentStatus, string> = {
    CLEAR: '#16a34a',
    SLOW: '#ca8a04',
    PARTIAL: '#ca8a04',
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
