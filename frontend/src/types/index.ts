// All TypeScript types for AROHAN frontend

export type RouteLabel = 'A' | 'B';
export type SegmentStatus = 'CLEAR' | 'SLOW' | 'PARTIAL' | 'BLOCKED';
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
export type ShipmentStatus =
  | 'PLANNED'
  | 'APPROVED'
  | 'DISPATCHED'
  | 'DRIVER_ACKNOWLEDGED'
  | 'IN_TRANSIT'
  | 'DISRUPTED'
  | 'REPLANNED'
  | 'DELIVERED';
export type DriverStatus = 'IDLE' | 'NOTIFIED' | 'ACKNOWLEDGED' | 'REPORTING';
export type ScenarioStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETE';
export type ConditionReport = 'CLEAR' | 'SLOW' | 'PARTIAL' | 'BLOCKED';

export interface RouteData {
  id: number;
  label: RouteLabel;
  name: string;
  origin: string;
  destination: string;
  distance_km: number;
  base_duration_h: number;
  geometry_geojson: string;
  slope_factor: number;
  historical_disruption_index: number;
  vulnerability_score: number;
  via_description: string;
}

export interface RiskResult {
  route_id: number;
  route_label: RouteLabel;
  disruption_probability: number;
  confidence: Confidence;
  horizon_h: number;
  score_breakdown: Record<string, number>;
}

export interface MissionScore {
  route_id: number;
  route_label: RouteLabel;
  travel_time_h: number;
  disruption_probability: number;
  expected_delay_h: number;
  base_time_penalty: number;
  delay_penalty: number;
  urgency_risk_penalty: number;
  mission_score: number;
}

export interface Recommendation {
  recommended_route_id: number;
  recommended_route_label: RouteLabel;
  current_route_id: number;
  reason: string;
  decision_type: 'PROACTIVE' | 'REACTIVE';
  delay_saved_h: number;
  risk_reduced_pct: number;
}

export interface DecisionData {
  id: number;
  shipment_id: number;
  current_route_id: number;
  recommended_route_id: number;
  approved_route_id: number | null;
  status: DecisionStatus;
  dispatcher_id: number | null;
  reason: string;
  mission_score_current: number;
  mission_score_recommended: number;
  disruption_probability: number;
  expected_delay_h: number;
  confidence: Confidence;
  horizon_h: number;
  decision_type: 'PROACTIVE' | 'REACTIVE';
  modifier_notes: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface ShipmentData {
  id: number;
  shipment_code: string;
  cargo_type: string;
  weight_kg: number;
  urgency: number;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  assigned_route_id: number | null;
  assigned_driver_id: number | null;
  planned_departure: string;
  planned_eta: string;
  updated_eta: string | null;
  created_at: string;
}

export interface NetworkEvent {
  id: number;
  event_type: string;
  title: string;
  description: string;
  triggered_by: string;
  scenario_step: number;
  time_label: string;
  created_at: string;
}

export interface KPIs {
  delay_avoided_h: number | null;
  risk_exposure_reduced_pct: number | null;
  decision_latency_sec: number | null;
  driver_acknowledged: boolean;
  replan_count: number;
  proactive_actions: number;
  reactive_actions: number;
}

export interface ScenarioStep {
  index: number;
  label: string;
  time_label: string;
}

export interface AppState {
  scenario_step: number;
  scenario_status: ScenarioStatus;
  total_steps: number;
  step_label: string | null;
  step_description: string | null;
  rainfall_data: { intensity_mmh: number; cumulative_24h_mm: number; source: string } | null;
  risk_results: Record<number, RiskResult>;
  mission_scores: Record<number, MissionScore>;
  current_recommendation: Recommendation | null;
  replan_recommendation: Recommendation | null;
  current_decision_id: number | null;
  driver_status: DriverStatus;
  segment_statuses: Record<number, SegmentStatus>;
  kpis: KPIs;
  all_steps: ScenarioStep[];
  // Enriched by state endpoint
  routes: RouteData[];
  shipment: ShipmentData | null;
  current_decision: DecisionData | null;
  events: NetworkEvent[];
}

export const EVENT_ICONS: Record<string, string> = {
  MISSION_INITIALIZED: 'Truck',
  RAINFALL_DETECTED: 'CloudRain',
  RISK_PREDICTED: 'AlertTriangle',
  IMPACT_CALCULATED: 'BarChart2',
  RECOMMENDATION_GENERATED: 'Target',
  DECISION_APPROVED: 'CheckCircle2',
  DECISION_REJECTED: 'XCircle',
  DRIVER_NOTIFIED: 'Smartphone',
  DRIVER_ACKNOWLEDGED: 'CheckSquare',
  FIELD_REPORT: 'Radio',
  NETWORK_UPDATED: 'RefreshCw',
  REPLANNING: 'GitCompare',
};
