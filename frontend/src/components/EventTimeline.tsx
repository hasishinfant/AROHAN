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
      <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No events recorded yet. Start scenario controller to generate events.
      </div>
    );
  }

  return (
    <div className="timeline">
      {shown.map((evt, i) => {
        const isLast = i === shown.length - 1;
        const IconComponent = getLucideIcon(evt.event_type);

        return (
          <div key={evt.id || i} className="timeline-item">
            <div className={`timeline-icon-box ${isLast ? 'active' : ''}`}>
              <IconComponent size={14} />
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-title">{evt.title}</span>
                <span className="timeline-time">{evt.time_label || '--:--'}</span>
              </div>
              {!compact && <div className="timeline-desc">{evt.description}</div>}
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span>Source: {evt.triggered_by}</span>
                <span>·</span>
                <span>Step {(evt.scenario_step ?? 0) + 1}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
