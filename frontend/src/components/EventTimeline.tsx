import React from 'react';
import { NetworkEvent } from '../types';
import {
  Truck,
  CloudRain,
  AlertTriangle,
  BarChart2,
  Target,
  CheckCircle2,
  XCircle,
  Smartphone,
  CheckSquare,
  Radio,
  RefreshCw,
  GitCompare,
  Activity
} from 'lucide-react';

interface EventTimelineProps {
  events?: NetworkEvent[];
  maxItems?: number;
  compact?: boolean;
}

const getLucideIcon = (type: string) => {
  switch (type) {
    case 'MISSION_INITIALIZED': return Truck;
    case 'RAINFALL_DETECTED': return CloudRain;
    case 'RISK_PREDICTED': return AlertTriangle;
    case 'IMPACT_CALCULATED': return BarChart2;
    case 'RECOMMENDATION_GENERATED': return Target;
    case 'DECISION_APPROVED': return CheckCircle2;
    case 'DECISION_REJECTED': return XCircle;
    case 'DRIVER_NOTIFIED': return Smartphone;
    case 'DRIVER_ACKNOWLEDGED': return CheckSquare;
    case 'FIELD_REPORT': return Radio;
    case 'NETWORK_UPDATED': return RefreshCw;
    case 'REPLANNING': return GitCompare;
    default: return Activity;
  }
};

export function EventTimeline({ events = [], maxItems, compact = false }: EventTimelineProps) {
  const safeEvents = Array.isArray(events) ? events : [];
  const shown = maxItems ? safeEvents.slice(-maxItems) : safeEvents;

  if (!shown.length) {
    return (
      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        No operational log events recorded yet.
      </div>
    );
  }

  return (
    <div className="timeline">
      {shown.map((evt, i) => {
        const IconComponent = getLucideIcon(evt.event_type);

        return (
          <div key={evt.id || i} className="timeline-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconComponent size={14} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="timeline-header">
                  <span className="timeline-title">{evt.title}</span>
                  <span className="timeline-time">{evt.time_label || '--:--'} IST</span>
                </div>
                {!compact && <div className="timeline-desc">{evt.description}</div>}
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>TRIGGER: {evt.triggered_by}</span>
                  <span>·</span>
                  <span>STEP {(evt.scenario_step ?? 0) + 1}/9</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
