"""
All API routes for AROHAN.

Endpoints:
  GET  /api/state                 → full app state snapshot
  GET  /api/routes                → all routes
  GET  /api/shipments/{id}        → shipment detail
  GET  /api/events                → event timeline
  GET  /api/decisions             → decision list
  GET  /api/risk                  → latest risk predictions
  GET  /api/kpis                  → KPI summary
  GET  /api/config/thresholds     → show configurable thresholds
  POST /api/scenario/start        → start demo scenario
  POST /api/scenario/next         → advance one step
  POST /api/scenario/pause        → pause scenario
  POST /api/scenario/resume       → resume scenario
  POST /api/scenario/reset        → full reset
  POST /api/decisions/{id}/approve
  POST /api/decisions/{id}/reject
  POST /api/decisions/{id}/modify
  POST /api/driver/acknowledge
  POST /api/driver/report
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Any

from app.database import get_db
from app.models import (
    Route, Shipment, NetworkEvent, Decision, RiskPrediction, RoadSegment,
    ResourceStock, ResourceTransfer, OperationalAlert, CorridorRiskForecast
)
from app.schemas import (
    RouteOut, ShipmentOut, NetworkEventOut, DecisionOut,
    RiskPredictionOut, DecisionApproveRequest, DecisionRejectRequest,
    DecisionModifyRequest, DriverReportCreate,
    ResourceStockOut, ResourceTransferOut, ResourceTransferApproveRequest,
    OperationalAlertOut, AlertReviewRequest, AlertApproveRequest, AlertDismissRequest,
    CorridorRiskForecastOut
)
from app.engines.decision_engine import approve_decision, reject_decision
from app.engines.resource_engine import calculate_redistribution_recommendations
from app.engines.alert_engine import generate_operational_alerts
from app.scenario.demo_scenario import (
    advance_step, reset_scenario, pause_scenario, resume_scenario,
    get_current_state, memory, STEPS
)
from app.config import settings

router = APIRouter()


# ── State ─────────────────────────────────────────────────────────────────────

@router.get("/state")
async def get_state(db: AsyncSession = Depends(get_db)) -> dict:
    """Full app state — used on initial load and polling fallback."""
    base = get_current_state()

    # Enrich with DB data
    routes = (await db.execute(select(Route))).scalars().all()
    routes_out = [RouteOut.model_validate(r) for r in routes]

    shipment = (await db.execute(select(Shipment).limit(1))).scalar_one_or_none()
    shipment_out = ShipmentOut.model_validate(shipment) if shipment else None

    events = (
        await db.execute(
            select(NetworkEvent).order_by(NetworkEvent.created_at.asc())
        )
    ).scalars().all()
    events_out = [NetworkEventOut.model_validate(e) for e in events]

    decision = None
    if memory.current_decision_id:
        d = (
            await db.execute(select(Decision).where(Decision.id == memory.current_decision_id))
        ).scalar_one_or_none()
        if d:
            decision = DecisionOut.model_validate(d)

    base["routes"] = [r.model_dump() for r in routes_out]
    base["shipment"] = shipment_out.model_dump() if shipment_out else None
    base["events"] = [e.model_dump() for e in events_out]
    base["current_decision"] = decision.model_dump() if decision else None

    return base


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/routes")
async def get_routes(db: AsyncSession = Depends(get_db)) -> list[dict]:
    routes = (await db.execute(select(Route))).scalars().all()
    return [RouteOut.model_validate(r).model_dump() for r in routes]


# ── Shipments ─────────────────────────────────────────────────────────────────

@router.get("/shipments/{shipment_id}")
async def get_shipment(shipment_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    s = (await db.execute(select(Shipment).where(Shipment.id == shipment_id))).scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return ShipmentOut.model_validate(s).model_dump()


# ── Events ────────────────────────────────────────────────────────────────────

@router.get("/events")
async def get_events(db: AsyncSession = Depends(get_db)) -> list[dict]:
    events = (
        await db.execute(select(NetworkEvent).order_by(NetworkEvent.created_at.asc()))
    ).scalars().all()
    return [NetworkEventOut.model_validate(e).model_dump() for e in events]


# ── Decisions ─────────────────────────────────────────────────────────────────

@router.get("/decisions")
async def get_decisions(db: AsyncSession = Depends(get_db)) -> list[dict]:
    decisions = (
        await db.execute(select(Decision).order_by(desc(Decision.created_at)))
    ).scalars().all()
    return [DecisionOut.model_validate(d).model_dump() for d in decisions]


@router.post("/decisions/{decision_id}/approve")
async def approve(
    decision_id: int,
    body: DecisionApproveRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
        decision = await approve_decision(db, decision_id, body.dispatcher_id, body.notes)
        return {"status": "approved", "decision": DecisionOut.model_validate(decision).model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/decisions/{decision_id}/reject")
async def reject(
    decision_id: int,
    body: DecisionRejectRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
        decision = await reject_decision(db, decision_id, body.dispatcher_id, body.reason)
        return {"status": "rejected", "decision": DecisionOut.model_validate(decision).model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Risk ──────────────────────────────────────────────────────────────────────

@router.get("/risk")
async def get_risk(db: AsyncSession = Depends(get_db)) -> list[dict]:
    preds = (
        await db.execute(
            select(RiskPrediction).order_by(desc(RiskPrediction.created_at))
        )
    ).scalars().all()
    return [RiskPredictionOut.model_validate(p).model_dump() for p in preds]


# ── KPIs ──────────────────────────────────────────────────────────────────────

@router.get("/kpis")
async def get_kpis() -> dict:
    return memory.kpis


# ── Config / Thresholds ───────────────────────────────────────────────────────

@router.get("/config/thresholds")
async def get_thresholds() -> dict:
    return {
        "disruption_probability_threshold": settings.DISRUPTION_PROB_THRESHOLD,
        "horizon_hours_threshold": settings.HORIZON_HOURS_THRESHOLD,
        "mission_score_delta_threshold": settings.MISSION_SCORE_DELTA_THRESHOLD,
        "min_confidence_for_proactive": settings.MIN_CONFIDENCE_FOR_PROACTIVE,
        "risk_model_weights": {
            "rainfall_intensity": settings.W_RAINFALL_INTENSITY,
            "cumulative_rain": settings.W_CUMULATIVE_RAIN,
            "slope": settings.W_SLOPE,
            "historical": settings.W_HISTORICAL,
            "vulnerability": settings.W_VULNERABILITY,
        },
        "mission_score_weights": {
            "base_time_multiplier": settings.BASE_TIME_MULTIPLIER,
            "delay_multiplier": settings.DELAY_MULTIPLIER,
            "urgency_risk_multiplier": settings.URGENCY_RISK_MULTIPLIER,
            "max_blockage_delay_h": settings.MAX_BLOCKAGE_DELAY_H,
        },
    }


# ── Providers (External Real-Data Ingestion) ──────────────────────────────────

@router.get("/providers/imd")
async def get_imd_telemetry(district: str = "Ri-Bhoi") -> dict:
    from app.providers.imd_provider import imd_provider
    pkg = await imd_provider.fetch_district_telemetry(district)
    return pkg.model_dump()


@router.get("/providers/osm")
async def get_osm_geometry(route_label: str = "A") -> dict:
    from app.providers.osm_provider import osm_provider
    pkg = await osm_provider.fetch_route_geometry(route_label)
    return pkg.model_dump()


@router.get("/providers/dem")
async def get_dem_terrain(route_label: str = "A") -> dict:
    from app.providers.dem_provider import dem_provider
    pkg = await dem_provider.derive_route_terrain(route_label)
    return pkg.model_dump()


@router.get("/providers/hazard")
async def get_hazard_catalog(corridor_ref: str = "NH-6") -> dict:
    from app.providers.hazard_provider import hazard_provider
    pkg = await hazard_provider.fetch_corridor_hazard_history(corridor_ref)
    return pkg.model_dump()


@router.get("/providers/nerdrr")
async def get_nerdrr_intelligence() -> dict:
    from app.providers.nerdrr_provider import nerdrr_provider
    pkg = nerdrr_provider.fetch_nerdrr_intelligence()
    return pkg.model_dump()


@router.get("/providers/status")
async def get_all_provider_statuses() -> dict:
    from app.providers.imd_provider import imd_provider
    from app.providers.osm_provider import osm_provider
    from app.providers.dem_provider import dem_provider
    from app.providers.hazard_provider import hazard_provider
    from app.providers.nerdrr_provider import nerdrr_provider

    imd_data = await imd_provider.fetch_district_telemetry("Ri-Bhoi")
    osm_data = await osm_provider.fetch_route_geometry("A")
    dem_data = await dem_provider.derive_route_terrain("A")
    hazard_data = await hazard_provider.fetch_corridor_hazard_history("NH-6")
    nerdrr_data = nerdrr_provider.fetch_nerdrr_intelligence()

    return {
        "providers": [
            {
                "name": "NESAC NER-DRR Portal (nerdrr.gov.in)",
                "type": "REGIONAL_DISASTER_RISK_NODE",
                "source": nerdrr_data.node_name,
                "status": nerdrr_data.status,
                "freshness_seconds": nerdrr_data.freshness_seconds,
                "retrieved_at": nerdrr_data.retrieved_at.isoformat(),
                "observed_at": nerdrr_data.retrieved_at.isoformat(),
                "details": f"Active NER Bulletins: {nerdrr_data.active_advisories_count} (Ri-Bhoi NH-6, Meghalaya Flood, Guwahati Inundation)"
            },
            {
                "name": "India Meteorological Department (IMD)",
                "type": "METEOROLOGICAL_TELEMETRY",
                "source": imd_data.source,
                "status": imd_data.status,
                "freshness_seconds": imd_data.freshness_seconds,
                "retrieved_at": imd_data.retrieved_at.isoformat(),
                "observed_at": imd_data.observed_at.isoformat(),
                "details": f"AWS Rainfall: {imd_data.current_observation.rainfall_intensity_mmh} mm/h ({imd_data.current_observation.district})"
            },
            {
                "name": "OpenStreetMap (OSM) Road Network",
                "type": "GEOSPATIAL_ROAD_GEOMETRY",
                "source": osm_data.source,
                "status": osm_data.status,
                "freshness_seconds": osm_data.freshness_seconds,
                "retrieved_at": osm_data.retrieved_at.isoformat(),
                "observed_at": osm_data.observed_at.isoformat(),
                "details": f"Road Way: {osm_data.road_geometry.name} ({osm_data.road_geometry.total_length_km} km)"
            },
            {
                "name": "Copernicus DEM 30m Terrain Model",
                "type": "RASTER_ELEVATION_SLOPE",
                "source": dem_data.source,
                "status": dem_data.status,
                "freshness_seconds": dem_data.freshness_seconds,
                "retrieved_at": dem_data.retrieved_at.isoformat(),
                "observed_at": dem_data.observed_at.isoformat(),
                "details": f"Peak Slope: {dem_data.peak_slope_degrees}° (Mean Elev: {dem_data.mean_elevation_m}m)"
            },
            {
                "name": "GSI & NDMA Historical Hazard Archive",
                "type": "AUTHORITATIVE_HAZARD_CATALOG",
                "source": hazard_data.source,
                "status": hazard_data.status,
                "freshness_seconds": hazard_data.freshness_seconds,
                "retrieved_at": hazard_data.retrieved_at.isoformat(),
                "observed_at": hazard_data.observed_at.isoformat(),
                "details": f"Disruption Index: {hazard_data.zonation.historical_disruption_index} ({hazard_data.zonation.total_archived_incidents} incidents)"
            }
        ]
    }


# ── Driver ────────────────────────────────────────────────────────────────────


# ── Driver ────────────────────────────────────────────────────────────────────

@router.post("/driver/acknowledge")
async def driver_acknowledge(db: AsyncSession = Depends(get_db)) -> dict:
    from app.models import Shipment
    ship = (await db.execute(select(Shipment).limit(1))).scalar_one_or_none()
    if ship:
        ship.status = "DRIVER_ACKNOWLEDGED"
        await db.commit()
    memory.driver_status = "ACKNOWLEDGED"
    memory.kpis["driver_acknowledged"] = True
    return {"status": "acknowledged"}


@router.post("/driver/report")
async def driver_report(
    body: DriverReportCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    from app.models import DriverReport
    report = DriverReport(
        driver_id=body.driver_id,
        shipment_id=body.shipment_id,
        route_id=body.route_id,
        condition=body.condition,
        verification_status="UNVERIFIED",
        notes=body.notes,
        lat=body.lat or 25.82,
        lon=body.lon or 91.95,
    )
    db.add(report)

    # Update segment status
    seg_result = await db.execute(
        select(RoadSegment)
        .where(RoadSegment.route_id == body.route_id, RoadSegment.is_risk_zone == True)
        .limit(1)
    )
    seg = seg_result.scalar_one_or_none()
    if seg:
        seg.status = body.condition if body.condition in ("CLEAR", "SLOW", "PARTIAL", "BLOCKED") else "SLOW"

    await db.commit()
    memory.segment_statuses[body.route_id] = body.condition
    memory.driver_status = "REPORTING"

    return {"status": "report_received", "condition": body.condition}


# ── Scenario ──────────────────────────────────────────────────────────────────

@router.post("/scenario/start")
async def scenario_start(db: AsyncSession = Depends(get_db)) -> dict:
    if memory.status not in ("IDLE", "PAUSED"):
        return {"status": memory.status, "message": "Scenario already running"}
    if memory.status == "IDLE":
        # Start from step 0
        state = await advance_step(db)
    else:
        resume_scenario()
        state = get_current_state()
    return state


@router.post("/scenario/next")
async def scenario_next(db: AsyncSession = Depends(get_db)) -> dict:
    if memory.status == "COMPLETE":
        return {"status": "COMPLETE", "message": "Scenario complete. Reset to restart."}
    state = await advance_step(db)
    return state


@router.post("/scenario/pause")
async def scenario_pause() -> dict:
    pause_scenario()
    return {"status": memory.status}


@router.post("/scenario/resume")
async def scenario_resume() -> dict:
    resume_scenario()
    return {"status": memory.status}


@router.post("/scenario/reset")
async def scenario_reset(db: AsyncSession = Depends(get_db)) -> dict:
    state = await reset_scenario(db)
    return state


@router.post("/scenario/low-confidence")
async def scenario_low_confidence(db: AsyncSession = Depends(get_db)) -> dict:
    from app.scenario.demo_scenario import run_low_confidence_scenario
    state = await run_low_confidence_scenario(db)
    return state


@router.get("/scenario/status")
async def scenario_status() -> dict:
    step_def = STEPS[memory.current_step] if 0 <= memory.current_step < len(STEPS) else None
    return {
        "current_step": memory.current_step,
        "status": memory.status,
        "total_steps": len(STEPS),
        "step_label": step_def["label"] if step_def else None,
        "all_steps": [
            {"index": s["index"], "label": s["label"], "time_label": s["time_label"]}
            for s in STEPS
        ],
    }


# ── Multimodal Transport Extensions ───────────────────────────────────────────

@router.get("/multimodal/corridors")
async def get_multimodal_corridors() -> dict:
    return {
        "modes": ["LAND", "RAIL", "WATER", "AIR"],
        "networks": {
          "LAND": {"mode": "LAND", "status": "CONNECTED", "primary_corridor": "NH-6 Guwahati → Shillong → Silchar Highway"},
          "RAIL": {"mode": "RAIL", "status": "STATIC_DATA", "primary_corridor": "Lumding → Badarpur Hill Freight Section"},
          "WATER": {"mode": "WATER", "status": "SIMULATION", "primary_corridor": "IWAI NW-2 Brahmaputra Pandu ↔ Jogighopa MMLP"},
          "AIR": {"mode": "AIR", "status": "NOT_CONFIGURED", "primary_corridor": "Guwahati LGBI ↔ Shillong Umroi Air Cargo"}
        }
    }


@router.get("/multimodal/status")
async def get_multimodal_status() -> dict:
    return {
        "active_modes": ["LAND", "RAIL", "WATER", "AIR"],
        "candidate_demo": "Jogighopa Multimodal Logistics Park (MMLP) Transfer",
        "system_layer": "AROHAN Multimodal Transport Intelligence Extension",
        "compliance": "PM GatiShakti & ULIP Framework Aligned"
    }


# ── Feature 1: Predictive Terrain Risk (Current vs Forecast) ─────────────────

@router.get("/risks/terrain")
async def get_terrain_risks(db: AsyncSession = Depends(get_db)) -> dict:
    """Returns predictive terrain risks separated into Current Risks vs Forecast Risks."""
    result = await db.execute(
        select(CorridorRiskForecast).order_by(desc(CorridorRiskForecast.disruption_probability))
    )
    all_risks = result.scalars().all()
    all_out = [CorridorRiskForecastOut.model_validate(r).model_dump() for r in all_risks]

    current_risks = [r for r in all_out if r["time_window"] == "CURRENT"]
    forecast_risks = [r for r in all_out if r["time_window"] != "CURRENT"]

    return {
        "current_risks": current_risks,
        "forecast_risks": forecast_risks,
        "total_active_hazards": len(current_risks),
        "total_forecast_windows": len(forecast_risks),
        "data_notice": "Simulation / Prototype Data — Aligned with IMD AWS & Copernicus DEM telemetry"
    }


# ── Feature 3: Government Resource Management & Redistribution ────────────────

@router.get("/resources")
async def get_resources(db: AsyncSession = Depends(get_db)) -> dict:
    """Returns district inventory with government statuses (SURPLUS, SHORTAGE, CRITICAL)."""
    result = await db.execute(select(ResourceStock).order_by(ResourceStock.priority.desc()))
    stocks = result.scalars().all()
    stocks_out = [ResourceStockOut.model_validate(s).model_dump() for s in stocks]

    surplus_count = sum(1 for s in stocks_out if s["status"] == "SURPLUS")
    shortage_count = sum(1 for s in stocks_out if s["status"] in ("SHORTAGE", "CRITICAL"))
    critical_count = sum(1 for s in stocks_out if s["status"] == "CRITICAL")

    return {
        "stocks": stocks_out,
        "summary": {
            "total_commodities": len(stocks_out),
            "surplus_count": surplus_count,
            "shortage_count": shortage_count,
            "critical_count": critical_count,
            "managed_districts": list(set(s["district_name"] for s in stocks_out)),
        },
        "data_notice": "Institutional Resource Inventory — Prototype Data (FCI & MDoNER Aligned)"
    }


@router.post("/resources/match")
async def match_resources(db: AsyncSession = Depends(get_db)) -> dict:
    """Triggers the redistribution engine to calculate surplus-to-shortage transfer recommendations."""
    new_transfers = await calculate_redistribution_recommendations(db)
    return {
        "status": "success",
        "generated_count": len(new_transfers),
        "transfers": [ResourceTransferOut.model_validate(t).model_dump() for t in new_transfers]
    }


@router.get("/resources/transfers")
async def get_resource_transfers(db: AsyncSession = Depends(get_db)) -> list[dict]:
    """Returns inter-district transfer recommendations and history."""
    result = await db.execute(
        select(ResourceTransfer).order_by(desc(ResourceTransfer.created_at))
    )
    transfers = result.scalars().all()
    return [ResourceTransferOut.model_validate(t).model_dump() for t in transfers]


@router.post("/resources/transfers/{transfer_id}/approve")
async def approve_resource_transfer(
    transfer_id: int,
    body: ResourceTransferApproveRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Dispatcher approves inter-district resource reallocation transfer."""
    result = await db.execute(select(ResourceTransfer).where(ResourceTransfer.id == transfer_id))
    transfer = result.scalar_one_or_none()
    if not transfer:
        raise HTTPException(status_code=404, detail="Resource transfer recommendation not found")

    transfer.status = "APPROVED"
    transfer.approved_at = datetime.utcnow()

    # Log event
    event = NetworkEvent(
        event_type="RESOURCE_TRANSFER_APPROVED",
        title=f"TRANSFER APPROVED — {transfer.transfer_code}",
        description=f"Approved transfer of {transfer.quantity} {transfer.unit} of {transfer.resource_type} from {transfer.source_district} to {transfer.destination_district} via {transfer.recommended_route_label}.",
        triggered_by="DISPATCHER",
        time_label=datetime.utcnow().strftime("%H:%M"),
    )
    db.add(event)
    await db.commit()

    return {
        "status": "approved",
        "transfer": ResourceTransferOut.model_validate(transfer).model_dump()
    }


# ── Feature 4: Automated Coordination & Actionable Alerts ────────────────────

@router.get("/alerts")
async def get_alerts(db: AsyncSession = Depends(get_db)) -> list[dict]:
    """Returns actionable operational alerts."""
    result = await db.execute(
        select(OperationalAlert).order_by(desc(OperationalAlert.created_at))
    )
    alerts = result.scalars().all()
    if not alerts:
        alerts = await generate_operational_alerts(db)
    return [OperationalAlertOut.model_validate(a).model_dump() for a in alerts]


@router.post("/alerts/{alert_id}/review")
async def review_alert(
    alert_id: int,
    body: AlertReviewRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Marks operational alert as under formal administrative review."""
    result = await db.execute(select(OperationalAlert).where(OperationalAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "REVIEWED"
    await db.commit()
    return {"status": "reviewed", "alert": OperationalAlertOut.model_validate(alert).model_dump()}


@router.post("/alerts/{alert_id}/approve")
async def approve_alert(
    alert_id: int,
    body: AlertApproveRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Executive officer approves recommended alert action."""
    result = await db.execute(select(OperationalAlert).where(OperationalAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "APPROVED"

    # Log to institutional audit timeline
    event = NetworkEvent(
        event_type="COORDINATION_ALERT_APPROVED",
        title=f"ALERT ACTION APPROVED — {alert.alert_code}",
        description=f"Action initiated by {body.department}: {alert.recommended_action}",
        triggered_by="DISPATCHER",
        time_label=datetime.utcnow().strftime("%H:%M"),
    )
    db.add(event)
    await db.commit()

    return {"status": "approved", "alert": OperationalAlertOut.model_validate(alert).model_dump()}


@router.post("/alerts/{alert_id}/dismiss")
async def dismiss_alert(
    alert_id: int,
    body: AlertDismissRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Dismisses alert with recorded operational justification."""
    result = await db.execute(select(OperationalAlert).where(OperationalAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "DISMISSED"
    await db.commit()
    return {"status": "dismissed", "reason": body.reason, "alert": OperationalAlertOut.model_validate(alert).model_dump()}


