import json
from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    role: Mapped[str] = mapped_column(String(20))  # DISPATCHER | DRIVER | ADMIN
    full_name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    license_plate: Mapped[str] = mapped_column(String(20), unique=True)
    vehicle_type: Mapped[str] = mapped_column(String(50))
    capacity_kg: Mapped[float] = mapped_column(Float)


class Driver(Base):
    __tablename__ = "drivers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.id"))
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(20))
    current_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    current_lon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="AVAILABLE")


class Route(Base):
    __tablename__ = "routes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    label: Mapped[str] = mapped_column(String(5))  # A or B
    name: Mapped[str] = mapped_column(String(200))
    origin: Mapped[str] = mapped_column(String(100))
    destination: Mapped[str] = mapped_column(String(100))
    distance_km: Mapped[float] = mapped_column(Float)
    base_duration_h: Mapped[float] = mapped_column(Float)
    geometry_geojson: Mapped[str] = mapped_column(Text)  # JSON string
    slope_factor: Mapped[float] = mapped_column(Float)
    historical_disruption_index: Mapped[float] = mapped_column(Float)
    vulnerability_score: Mapped[float] = mapped_column(Float)
    via_description: Mapped[str] = mapped_column(String(300))


class RoadSegment(Base):
    __tablename__ = "road_segments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    route_id: Mapped[int] = mapped_column(Integer, ForeignKey("routes.id"))
    name: Mapped[str] = mapped_column(String(200))
    is_risk_zone: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="CLEAR")  # CLEAR | SLOW | PARTIAL | BLOCKED
    lat_start: Mapped[float] = mapped_column(Float)
    lon_start: Mapped[float] = mapped_column(Float)
    lat_end: Mapped[float] = mapped_column(Float)
    lon_end: Mapped[float] = mapped_column(Float)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Shipment(Base):
    __tablename__ = "shipments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    shipment_code: Mapped[str] = mapped_column(String(20), unique=True)
    cargo_type: Mapped[str] = mapped_column(String(100))
    weight_kg: Mapped[float] = mapped_column(Float)
    urgency: Mapped[int] = mapped_column(Integer)  # 1–5
    origin: Mapped[str] = mapped_column(String(100))
    destination: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), default="PLANNED")
    # PLANNED | APPROVED | DISPATCHED | DRIVER_ACKNOWLEDGED | IN_TRANSIT | DISRUPTED | REPLANNED | DELIVERED
    assigned_route_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("routes.id"), nullable=True)
    assigned_driver_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("drivers.id"), nullable=True)
    planned_departure: Mapped[str] = mapped_column(String(30))
    planned_eta: Mapped[str] = mapped_column(String(30))
    updated_eta: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    route_id: Mapped[int] = mapped_column(Integer, ForeignKey("routes.id"))
    rainfall_intensity_mmh: Mapped[float] = mapped_column(Float)
    cumulative_24h_mm: Mapped[float] = mapped_column(Float)
    disruption_probability: Mapped[float] = mapped_column(Float)
    confidence: Mapped[str] = mapped_column(String(10))  # LOW | MEDIUM | HIGH
    horizon_h: Mapped[int] = mapped_column(Integer)
    data_source: Mapped[str] = mapped_column(String(50), default="SIMULATED")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Decision(Base):
    __tablename__ = "decisions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    shipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("shipments.id"))
    current_route_id: Mapped[int] = mapped_column(Integer, ForeignKey("routes.id"))
    recommended_route_id: Mapped[int] = mapped_column(Integer, ForeignKey("routes.id"))
    approved_route_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("routes.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    # PENDING | APPROVED | REJECTED | MODIFIED
    dispatcher_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    reason: Mapped[str] = mapped_column(Text)
    mission_score_current: Mapped[float] = mapped_column(Float)
    mission_score_recommended: Mapped[float] = mapped_column(Float)
    disruption_probability: Mapped[float] = mapped_column(Float)
    expected_delay_h: Mapped[float] = mapped_column(Float)
    confidence: Mapped[str] = mapped_column(String(10))
    horizon_h: Mapped[int] = mapped_column(Integer)
    decision_type: Mapped[str] = mapped_column(String(20), default="PROACTIVE")  # PROACTIVE | REACTIVE
    modifier_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class DriverReport(Base):
    __tablename__ = "driver_reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    driver_id: Mapped[int] = mapped_column(Integer, ForeignKey("drivers.id"))
    shipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("shipments.id"))
    route_id: Mapped[int] = mapped_column(Integer, ForeignKey("routes.id"))
    segment_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("road_segments.id"), nullable=True)
    condition: Mapped[str] = mapped_column(String(20))  # CLEAR | SLOW | PARTIAL | BLOCKED
    verification_status: Mapped[str] = mapped_column(String(30), default="UNVERIFIED")
    # UNVERIFIED | CORROBORATED | VERIFIED | CONFLICTING | REJECTED | EXPIRED
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class NetworkEvent(Base):
    __tablename__ = "network_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(50))
    # RAINFALL_DETECTED | RISK_PREDICTED | IMPACT_CALCULATED | ROUTE_EVALUATED
    # RECOMMENDATION_GENERATED | DECISION_APPROVED | DECISION_REJECTED
    # DRIVER_NOTIFIED | DRIVER_ACKNOWLEDGED | FIELD_REPORT | NETWORK_UPDATED | REPLANNING
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    triggered_by: Mapped[str] = mapped_column(String(50))  # SYSTEM | DISPATCHER | DRIVER
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scenario_step: Mapped[int] = mapped_column(Integer, default=0)
    time_label: Mapped[str] = mapped_column(String(10), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ScenarioState(Base):
    __tablename__ = "scenario_state"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    current_step: Mapped[int] = mapped_column(Integer, default=-1)
    status: Mapped[str] = mapped_column(String(20), default="IDLE")  # IDLE | RUNNING | PAUSED | COMPLETE
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ResourceStock(Base):
    """District-level logistics resource inventory."""
    __tablename__ = "resource_stocks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    district_name: Mapped[str] = mapped_column(String(100))
    state_name: Mapped[str] = mapped_column(String(50))
    resource_type: Mapped[str] = mapped_column(String(100))
    available_qty: Mapped[float] = mapped_column(Float)
    required_qty: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(30))  # MT | Kits | Cylinders | KL
    status: Mapped[str] = mapped_column(String(30))  # SURPLUS | ADEQUATE | LOW | SHORTAGE | CRITICAL
    priority: Mapped[int] = mapped_column(Integer, default=3)  # 1 (low) - 5 (critical)
    storage_facility: Mapped[str] = mapped_column(String(150))
    data_source: Mapped[str] = mapped_column(String(50), default="PROTOTYPE_DATA")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ResourceTransfer(Base):
    """Inter-district resource redistribution recommendations and approved movements."""
    __tablename__ = "resource_transfers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    transfer_code: Mapped[str] = mapped_column(String(30), unique=True)
    source_district: Mapped[str] = mapped_column(String(100))
    destination_district: Mapped[str] = mapped_column(String(100))
    resource_type: Mapped[str] = mapped_column(String(100))
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(30))
    distance_km: Mapped[float] = mapped_column(Float)
    route_risk_level: Mapped[str] = mapped_column(String(20), default="LOW")  # LOW | MODERATE | HIGH
    eta_hours: Mapped[float] = mapped_column(Float)
    recommended_route_label: Mapped[str] = mapped_column(String(150))
    transport_mode: Mapped[str] = mapped_column(String(30), default="ROAD")  # ROAD | RAIL | WATER | MULTIMODAL
    status: Mapped[str] = mapped_column(String(30), default="PENDING")  # PENDING | APPROVED | DISPATCHED | COMPLETED | REJECTED
    reason: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class OperationalAlert(Base):
    """Institutional actionable alert for automated coordination."""
    __tablename__ = "operational_alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    alert_code: Mapped[str] = mapped_column(String(30), unique=True)
    priority: Mapped[str] = mapped_column(String(20))  # CRITICAL | HIGH | MEDIUM | LOW
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    location_district: Mapped[str] = mapped_column(String(100))
    affected_corridor: Mapped[str] = mapped_column(String(150))
    affected_resource: Mapped[str] = mapped_column(String(150))
    suggested_source_district: Mapped[str] = mapped_column(String(100))
    recommended_route: Mapped[str] = mapped_column(String(150))
    estimated_eta: Mapped[str] = mapped_column(String(50))
    recommended_action: Mapped[str] = mapped_column(Text)
    responsible_department: Mapped[str] = mapped_column(String(150))
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")  # ACTIVE | REVIEWED | APPROVED | DISMISSED
    confidence: Mapped[str] = mapped_column(String(10), default="HIGH")  # HIGH | MEDIUM | LOW
    data_source: Mapped[str] = mapped_column(String(50), default="SIMULATION_DATA")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CorridorRiskForecast(Base):
    """Predictive terrain risk forecasting across NER corridors."""
    __tablename__ = "corridor_risk_forecasts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    corridor_name: Mapped[str] = mapped_column(String(150))
    state_name: Mapped[str] = mapped_column(String(50))
    risk_type: Mapped[str] = mapped_column(String(50))  # LANDSLIDE | FLOOD | HEAVY_RAINFALL | ROAD_ACCESSIBILITY | OVERALL_CORRIDOR
    severity: Mapped[str] = mapped_column(String(20))  # CRITICAL | HIGH | MODERATE | LOW
    time_window: Mapped[str] = mapped_column(String(30))  # CURRENT | FORECAST_6H | FORECAST_12H | FORECAST_24H
    disruption_probability: Mapped[float] = mapped_column(Float)
    confidence: Mapped[str] = mapped_column(String(10), default="HIGH")  # HIGH | MEDIUM | LOW
    affected_segment: Mapped[str] = mapped_column(String(200))
    recommended_action: Mapped[str] = mapped_column(Text)
    data_source: Mapped[str] = mapped_column(String(50), default="SIMULATION_DATA")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CommunicationLog(Base):
    """WhatsApp and multi-level emergency coordination dispatch audit log."""
    __tablename__ = "communication_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dispatch_id: Mapped[str] = mapped_column(String(50), unique=True)
    movement_code: Mapped[str] = mapped_column(String(50))
    recipient_name: Mapped[str] = mapped_column(String(100))
    recipient_role: Mapped[str] = mapped_column(String(50), default="DRIVER")
    phone_masked: Mapped[str] = mapped_column(String(50))
    message_type: Mapped[str] = mapped_column(String(50))
    language_code: Mapped[str] = mapped_column(String(20))
    language_name: Mapped[str] = mapped_column(String(50))
    message_body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="DELIVERED_SIMULATED")
    dispatched_by: Mapped[str] = mapped_column(String(100), default="REGIONAL_COMMAND")
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    delivery_channel: Mapped[str] = mapped_column(String(50), default="WHATSAPP_BUSINESS_SIMULATION")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

