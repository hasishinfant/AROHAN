from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


# ── Route ──────────────────────────────────────────────────────────────
class RouteOut(BaseModel):
    id: int
    label: str
    name: str
    origin: str
    destination: str
    distance_km: float
    base_duration_h: float
    geometry_geojson: str
    slope_factor: float
    historical_disruption_index: float
    vulnerability_score: float
    via_description: str

    class Config:
        from_attributes = True


# ── Risk Prediction ─────────────────────────────────────────────────────
class RiskPredictionOut(BaseModel):
    id: int
    route_id: int
    rainfall_intensity_mmh: float
    cumulative_24h_mm: float
    disruption_probability: float
    confidence: str
    horizon_h: int
    data_source: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Mission Score (computed, not persisted) ─────────────────────────────
class MissionScoreDetail(BaseModel):
    route_id: int
    route_label: str
    travel_time_h: float
    disruption_probability: float
    expected_delay_h: float
    base_time_penalty: float
    delay_penalty: float
    urgency_risk_penalty: float
    mission_score: float


# ── Decision ────────────────────────────────────────────────────────────
class DecisionOut(BaseModel):
    id: int
    shipment_id: int
    current_route_id: int
    recommended_route_id: int
    approved_route_id: Optional[int]
    status: str
    dispatcher_id: Optional[int]
    reason: str
    mission_score_current: float
    mission_score_recommended: float
    disruption_probability: float
    expected_delay_h: float
    confidence: str
    horizon_h: int
    decision_type: str
    modifier_notes: Optional[str]
    created_at: datetime
    approved_at: Optional[datetime]

    class Config:
        from_attributes = True


class DecisionApproveRequest(BaseModel):
    dispatcher_id: int = 1
    notes: Optional[str] = None


class DecisionRejectRequest(BaseModel):
    dispatcher_id: int = 1
    reason: str


class DecisionModifyRequest(BaseModel):
    dispatcher_id: int = 1
    notes: str
    new_route_id: Optional[int] = None


# ── Shipment ────────────────────────────────────────────────────────────
class ShipmentOut(BaseModel):
    id: int
    shipment_code: str
    cargo_type: str
    weight_kg: float
    urgency: int
    origin: str
    destination: str
    status: str
    assigned_route_id: Optional[int]
    assigned_driver_id: Optional[int]
    planned_departure: str
    planned_eta: str
    updated_eta: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Driver Report ────────────────────────────────────────────────────────
class DriverReportCreate(BaseModel):
    driver_id: int = 1
    shipment_id: int = 1
    route_id: int = 1
    condition: str  # CLEAR | SLOW | PARTIAL | BLOCKED
    notes: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class DriverReportOut(BaseModel):
    id: int
    driver_id: int
    shipment_id: int
    route_id: int
    condition: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Network Event ────────────────────────────────────────────────────────
class NetworkEventOut(BaseModel):
    id: int
    event_type: str
    title: str
    description: str
    triggered_by: str
    scenario_step: int
    time_label: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Scenario ─────────────────────────────────────────────────────────────
class ScenarioStatusOut(BaseModel):
    current_step: int
    status: str
    total_steps: int
    step_label: Optional[str]
    step_description: Optional[str]


# ── Full App State (broadcast via WebSocket) ─────────────────────────────
class AppState(BaseModel):
    scenario: ScenarioStatusOut
    shipment: Optional[ShipmentOut]
    routes: List[RouteOut]
    risk_predictions: Dict[int, Optional[RiskPredictionOut]]  # route_id → prediction
    mission_scores: Dict[int, Optional[MissionScoreDetail]]   # route_id → score
    current_decision: Optional[DecisionOut]
    network_events: List[NetworkEventOut]
    segment_statuses: Dict[str, str]   # segment_name → status
    kpis: Dict[str, Any]
    driver_status: str  # IDLE | NOTIFIED | ACKNOWLEDGED | REPORTING
    rainfall_data: Optional[Dict[str, float]]


# ── KPI ─────────────────────────────────────────────────────────────────
class KPIOut(BaseModel):
    delay_avoided_h: Optional[float]
    risk_exposure_reduced_pct: Optional[float]
    decision_latency_sec: Optional[float]
    driver_acknowledged: bool
    replan_count: int
    proactive_actions: int
    reactive_actions: int
