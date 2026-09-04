"""
Demo Scenario Engine — deterministic 9-step event sequencer.

Each step:
  1. Performs a specific action (inserts records, updates state)
  2. Broadcasts the full AppState via WebSocket to all connected clients

The scenario can be: START / PAUSE / NEXT EVENT / RESET

This is self-contained — no external APIs required.
"""

import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models import (
    RiskPrediction, Decision, DriverReport, NetworkEvent,
    ScenarioState, Shipment, RoadSegment, Route
)
from app.engines.risk_engine import compute_disruption_probability, should_trigger_proactive_replan
from app.engines.impact_engine import compute_mission_score
from app.engines.optimization_engine import generate_recommendation
from app.engines.decision_engine import create_decision, approve_decision
from app.engines.replan_engine import process_driver_report
from app.config import SCENARIO_TIMELINE


# ── In-memory shared state ────────────────────────────────────────────────────
# This state is authoritative during a demo session.
# It is broadcast via WebSocket on each step advance.

class ScenarioMemoryState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.current_step = -1
        self.status = "IDLE"  # IDLE | RUNNING | PAUSED | COMPLETE
        self.rainfall_data: dict | None = None
        self.risk_results: dict = {}       # route_id → RiskResult
        self.mission_scores: dict = {}     # route_id → MissionScore
        self.current_recommendation = None
        self.current_decision_id: int | None = None
        self.driver_status: str = "IDLE"   # IDLE | NOTIFIED | ACKNOWLEDGED | REPORTING
        self.segment_statuses: dict = {}   # route_id → status string
        self.replan_recommendation = None
        self.kpis: dict = {
            "delay_avoided_h": None,
            "risk_exposure_reduced_pct": None,
            "decision_latency_sec": None,
            "driver_acknowledged": False,
            "replan_count": 0,
            "proactive_actions": 0,
            "reactive_actions": 0,
        }
        self.decision_created_at: datetime | None = None


# Global singleton
memory = ScenarioMemoryState()

# ── Step definitions ──────────────────────────────────────────────────────────

STEPS = [
    {
        "index": 0,
        "label": "Mission Active",
        "time_label": "09:00",
        "event_type": "MISSION_INITIALIZED",
        "title": "Shipment SHP-001 Initialized",
        "description": (
            "Shipment SHP-001 planned from Guwahati to Shillong via Route A (NH-6). "
            "All systems nominal. Route A: 102 km, base ETA 13:30."
        ),
        "triggered_by": "SYSTEM",
    },
    {
        "index": 1,
        "label": "Rainfall Detected",
        "time_label": "09:05",
        "event_type": "RAINFALL_DETECTED",
        "title": "Rainfall Input Received",
        "description": (
            "Environmental input received: rainfall intensity 38 mm/h, "
            "cumulative 24h: 95 mm. Source: IMD forecast model [SIMULATED]."
        ),
        "triggered_by": "SYSTEM",
    },
    {
        "index": 2,
        "label": "Risk Predicted",
        "time_label": "09:06",
        "event_type": "RISK_PREDICTED",
        "title": "Accessibility Risk Predicted",
        "description": (
            "Risk Engine computed: Route A disruption probability 78%, HIGH confidence, 18h horizon. "
            "Route B disruption probability 21%, MEDIUM confidence. "
            "Proactive trigger threshold exceeded."
        ),
        "triggered_by": "SYSTEM",
    },
    {
        "index": 3,
        "label": "Impact Calculated",
        "time_label": "09:07",
        "event_type": "IMPACT_CALCULATED",
        "title": "Logistics Impact Calculated",
        "description": (
            "Route A mission score: 82.1 (travel 5.0h, expected delay 9.4h). "
            "Route B mission score: 34.2 (travel 6.2h, expected delay 1.5h). "
            "Score delta: 47.9 — replanning beneficial."
        ),
        "triggered_by": "SYSTEM",
    },
    {
        "index": 4,
        "label": "Reroute Recommended",
        "time_label": "09:08",
        "event_type": "RECOMMENDATION_GENERATED",
        "title": "Proactive Reroute Recommended",
        "description": (
            "AROHAN recommends: REROUTE NOW to Route B. "
            "Route B minimizes expected mission loss under predicted disruption. "
            "Decision awaiting dispatcher approval."
        ),
        "triggered_by": "SYSTEM",
    },
    {
        "index": 5,
        "label": "Dispatcher Approved",
        "time_label": "09:09",
        "event_type": "DECISION_APPROVED",
        "title": "Dispatcher Approved Reroute",
        "description": (
            "Dispatcher Arjun Sharma approved reroute to Route B. "
            "Decision logged. Driver Rahul Kumar notified via mobile interface."
        ),
        "triggered_by": "DISPATCHER",
    },
    {
        "index": 6,
        "label": "Driver Acknowledged",
        "time_label": "09:15",
        "event_type": "DRIVER_ACKNOWLEDGED",
        "title": "Driver Acknowledged Updated Route",
        "description": (
            "Driver Rahul Kumar acknowledged new route (Route B via Sonapur ridge). "
            "Vehicle departed Guwahati. Shipment status: IN_TRANSIT."
        ),
        "triggered_by": "DRIVER",
    },
    {
        "index": 7,
        "label": "Field Report: Route A Blocked",
        "time_label": "10:30",
        "event_type": "FIELD_REPORT",
        "title": "Driver Field Report: Route A BLOCKED",
        "description": (
            "Driver reports: Route A (NH-6, Umiam segment) is BLOCKED. "
            "Landslide debris on road near Umiam lake. Road impassable. "
            "Network state updating..."
        ),
        "triggered_by": "DRIVER",
    },
    {
        "index": 8,
        "label": "Replanning Complete",
        "time_label": "10:32",
        "event_type": "REPLANNING",
        "title": "Network Updated — Reactive Replan Complete",
        "description": (
            "Route A segment status updated to BLOCKED. Replanning triggered. "
            "Route B confirmed as optimal. Forecast validated: prediction matched reality. "
            "Expected delay avoided: 7.5h. Risk exposure reduced: 57%. "
            "Mission continues on approved route."
        ),
        "triggered_by": "SYSTEM",
    },
]


async def _log_event(db: AsyncSession, step: dict, step_index: int) -> NetworkEvent:
    event = NetworkEvent(
        event_type=step["event_type"],
        title=step["title"],
        description=step["description"],
        triggered_by=step["triggered_by"],
        scenario_step=step_index,
        time_label=step["time_label"],
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def advance_step(db: AsyncSession) -> dict:
    """Advance the scenario by one step. Returns updated in-memory state."""
    next_step = memory.current_step + 1

    if next_step >= len(STEPS):
        memory.status = "COMPLETE"
        return _build_state_dict()

    step_def = STEPS[next_step]
    memory.current_step = next_step

    # ── Execute step actions ──────────────────────────────────────────────────

    if next_step == 0:
        # Step 0: Initialize — just load shipment baseline
        memory.status = "RUNNING"

        # Get all routes and set initial segment statuses
        routes_result = await db.execute(select(Route))
        routes = routes_result.scalars().all()
        segs_result = await db.execute(select(RoadSegment))
        segments = segs_result.scalars().all()
        for seg in segments:
            if seg.status == "CLEAR":
                pass  # already clear
        memory.segment_statuses = {r.id: "CLEAR" for r in routes}

    elif next_step == 1:
        # Step 1: Inject rainfall data
        memory.rainfall_data = {
            "intensity_mmh": 38.0,
            "cumulative_24h_mm": 95.0,
            "source": "SIMULATED",
        }

    elif next_step == 2:
        # Step 2: Compute risk for all routes
        routes_result = await db.execute(select(Route))
        routes = routes_result.scalars().all()

        for route in routes:
            risk = compute_disruption_probability(
                route_id=route.id,
                route_label=route.label,
                slope_factor=route.slope_factor,
                historical_disruption_index=route.historical_disruption_index,
                vulnerability_score=route.vulnerability_score,
                rainfall_intensity_mmh=memory.rainfall_data["intensity_mmh"],
                cumulative_24h_mm=memory.rainfall_data["cumulative_24h_mm"],
                horizon_h=18,
            )
            memory.risk_results[route.id] = risk

            # Persist to DB
            pred = RiskPrediction(
                route_id=route.id,
                rainfall_intensity_mmh=memory.rainfall_data["intensity_mmh"],
                cumulative_24h_mm=memory.rainfall_data["cumulative_24h_mm"],
                disruption_probability=risk.disruption_probability,
                confidence=risk.confidence,
                horizon_h=risk.horizon_h,
                data_source="SIMULATED",
            )
            db.add(pred)
        await db.commit()

    elif next_step == 3:
        # Step 3: Compute mission scores
        ship_result = await db.execute(select(Shipment).limit(1))
        shipment = ship_result.scalar_one_or_none()
        urgency = shipment.urgency if shipment else 4

        routes_result = await db.execute(select(Route))
        routes = routes_result.scalars().all()

        for route in routes:
            risk = memory.risk_results.get(route.id)
            prob = risk.disruption_probability if risk else 0.1
            score = compute_mission_score(
                route_id=route.id,
                route_label=route.label,
                base_duration_h=route.base_duration_h,
                disruption_probability=prob,
                urgency=urgency,
            )
            memory.mission_scores[route.id] = score

    elif next_step == 4:
        # Step 4: Generate proactive recommendation
        routes_result = await db.execute(select(Route))
        routes = routes_result.scalars().all()
        current_route = next((r for r in routes if r.label == "A"), routes[0])

        recommendation = generate_recommendation(
            current_route_id=current_route.id,
            route_scores=list(memory.mission_scores.values()),
            segment_statuses=memory.segment_statuses,
            decision_type="PROACTIVE",
            disruption_probability_current=memory.risk_results.get(current_route.id, {}).disruption_probability
            if hasattr(memory.risk_results.get(current_route.id, None), "disruption_probability") else 0.78,
        )
        memory.current_recommendation = recommendation

        # Create decision record
        ship_result = await db.execute(select(Shipment).limit(1))
        shipment = ship_result.scalar_one_or_none()

        risk_a = next(
            (r for r in memory.risk_results.values() if r.route_label == "A"), None
        )
        score_a = next(
            (s for s in memory.mission_scores.values() if s.route_label == "A"), None
        )

        decision = await create_decision(
            db=db,
            shipment_id=shipment.id,
            current_route_id=current_route.id,
            recommendation=recommendation,
            risk_probability=risk_a.disruption_probability if risk_a else 0.78,
            confidence=risk_a.confidence if risk_a else "HIGH",
            horizon_h=risk_a.horizon_h if risk_a else 18,
            expected_delay_h=risk_a.disruption_probability * 12 if risk_a else 9.4,
            mission_score_current=score_a.mission_score if score_a else 82.1,
        )
        memory.current_decision_id = decision.id
        memory.kpis["proactive_actions"] += 1
        memory.decision_created_at = datetime.utcnow()

    elif next_step == 5:
        # Step 5: Dispatcher approves
        if memory.current_decision_id:
            approved = await approve_decision(
                db=db,
                decision_id=memory.current_decision_id,
                dispatcher_id=1,
            )
            # Update shipment
            ship_result = await db.execute(select(Shipment).limit(1))
            shipment = ship_result.scalar_one_or_none()
            if shipment:
                shipment.status = "DISPATCHED"
                shipment.updated_at = datetime.utcnow()
            await db.commit()

        memory.driver_status = "NOTIFIED"

        # Compute decision latency
        if memory.decision_created_at:
            delta = (datetime.utcnow() - memory.decision_created_at).total_seconds()
            memory.kpis["decision_latency_sec"] = round(delta, 1)

    elif next_step == 6:
        # Step 6: Driver acknowledges
        memory.driver_status = "ACKNOWLEDGED"
        memory.kpis["driver_acknowledged"] = True

        ship_result = await db.execute(select(Shipment).limit(1))
        shipment = ship_result.scalar_one_or_none()
        if shipment:
            shipment.status = "DRIVER_ACKNOWLEDGED"
            shipment.updated_at = datetime.utcnow()
        await db.commit()

    elif next_step == 7:
        # Step 7: Driver reports Route A blocked
        memory.driver_status = "REPORTING"

        routes_result = await db.execute(select(Route))
        routes = routes_result.scalars().all()
        route_a = next((r for r in routes if r.label == "A"), None)

        # Create driver report
        report = DriverReport(
            driver_id=1,
            shipment_id=1,
            route_id=route_a.id if route_a else 1,
            condition="BLOCKED",
            notes="Landslide debris near Umiam lake. Road completely impassable.",
            lat=25.8900,
            lon=91.9650,
        )
        db.add(report)
        await db.commit()

        # Update segment status
        memory.segment_statuses[route_a.id if route_a else 1] = "BLOCKED"

        # Update the risk zone segment in DB
        seg_result = await db.execute(
            select(RoadSegment).where(
                RoadSegment.route_id == (route_a.id if route_a else 1),
                RoadSegment.is_risk_zone == True
            ).limit(1)
        )
        seg = seg_result.scalar_one_or_none()
        if seg:
            seg.status = "BLOCKED"
            seg.updated_at = datetime.utcnow()
        await db.commit()

    elif next_step == 8:
        # Step 8: Replan
        routes_result = await db.execute(select(Route))
        routes = routes_result.scalars().all()

        ship_result = await db.execute(select(Shipment).limit(1))
        shipment = ship_result.scalar_one_or_none()

        replan_result = await process_driver_report(
            db=db,
            driver_id=1,
            shipment_id=1,
            reported_route_id=next((r.id for r in routes if r.label == "A"), 1),
            condition="BLOCKED",
            risk_results=memory.risk_results,
        )

        memory.replan_recommendation = replan_result.get("recommendation")
        new_seg_statuses = replan_result.get("segment_statuses", {})
        memory.segment_statuses.update(new_seg_statuses)
        new_scores = replan_result.get("new_scores", [])
        for s in new_scores:
            memory.mission_scores[s.route_id] = s

        memory.kpis["replan_count"] += 1
        memory.kpis["reactive_actions"] += 1

        # Compute KPIs
        score_a = next((s for s in memory.mission_scores.values() if s.route_label == "A"), None)
        score_b = next((s for s in memory.mission_scores.values() if s.route_label == "B"), None)
        if score_a and score_b:
            memory.kpis["delay_avoided_h"] = round(
                max(score_a.expected_delay_h - score_b.expected_delay_h, 0), 1
            )
            risk_a = memory.risk_results.get(next((r for r in routes), Route()).id)
            if memory.risk_results:
                risk_vals = list(memory.risk_results.values())
                risk_a_val = next((r for r in risk_vals if r.route_label == "A"), None)
                risk_b_val = next((r for r in risk_vals if r.route_label == "B"), None)
                if risk_a_val and risk_b_val:
                    memory.kpis["risk_exposure_reduced_pct"] = round(
                        (risk_a_val.disruption_probability - risk_b_val.disruption_probability) * 100, 1
                    )

        # Update shipment ETA
        if shipment and score_b:
            hours = int(score_b.travel_time_h)
            mins = int((score_b.travel_time_h - hours) * 60)
            shipment.updated_eta = f"{9 + hours:02d}:{mins:02d}"
            await db.commit()

        memory.status = "COMPLETE"

    # Log the event
    await _log_event(db, step_def, next_step)

    return _build_state_dict()


def _build_state_dict() -> dict:
    """Build serializable snapshot of current memory state."""
    step_def = STEPS[memory.current_step] if 0 <= memory.current_step < len(STEPS) else None

    risk_out = {}
    for route_id, risk in memory.risk_results.items():
        risk_out[route_id] = {
            "route_id": risk.route_id,
            "route_label": risk.route_label,
            "disruption_probability": risk.disruption_probability,
            "confidence": risk.confidence,
            "horizon_h": risk.horizon_h,
            "score_breakdown": risk.score_breakdown,
        }

    score_out = {}
    for route_id, score in memory.mission_scores.items():
        score_out[route_id] = {
            "route_id": score.route_id,
            "route_label": score.route_label,
            "travel_time_h": score.travel_time_h,
            "disruption_probability": score.disruption_probability,
            "expected_delay_h": score.expected_delay_h,
            "base_time_penalty": score.base_time_penalty,
            "delay_penalty": score.delay_penalty,
            "urgency_risk_penalty": score.urgency_risk_penalty,
            "mission_score": score.mission_score,
        }

    rec = None
    if memory.current_recommendation:
        r = memory.current_recommendation
        rec = {
            "recommended_route_id": r.recommended_route_id,
            "recommended_route_label": r.recommended_route_label,
            "current_route_id": r.current_route_id,
            "reason": r.reason,
            "decision_type": r.decision_type,
            "delay_saved_h": r.delay_saved_h,
            "risk_reduced_pct": r.risk_reduced_pct,
        }

    replan_rec = None
    if memory.replan_recommendation:
        r = memory.replan_recommendation
        replan_rec = {
            "recommended_route_id": r.recommended_route_id,
            "recommended_route_label": r.recommended_route_label,
            "current_route_id": r.current_route_id,
            "reason": r.reason,
            "decision_type": r.decision_type,
            "delay_saved_h": r.delay_saved_h,
            "risk_reduced_pct": r.risk_reduced_pct,
        }

    return {
        "scenario_step": memory.current_step,
        "scenario_status": memory.status,
        "total_steps": len(STEPS),
        "step_label": step_def["label"] if step_def else None,
        "step_description": step_def["description"] if step_def else None,
        "rainfall_data": memory.rainfall_data,
        "risk_results": risk_out,
        "mission_scores": score_out,
        "current_recommendation": rec,
        "replan_recommendation": replan_rec,
        "current_decision_id": memory.current_decision_id,
        "driver_status": memory.driver_status,
        "segment_statuses": memory.segment_statuses,
        "kpis": memory.kpis,
        "all_steps": [
            {"index": s["index"], "label": s["label"], "time_label": s["time_label"]}
            for s in STEPS
        ],
    }


async def reset_scenario(db: AsyncSession):
    """Full reset — clears DB records and memory state."""
    # Clear dynamic records (keep routes, segments base data, users, vehicles, drivers, shipments)
    await db.execute(delete(RiskPrediction))
    await db.execute(delete(Decision))
    await db.execute(delete(DriverReport))
    await db.execute(delete(NetworkEvent))
    await db.execute(delete(ScenarioState))

    # Reset segment statuses to CLEAR
    segs_result = await db.execute(select(RoadSegment))
    segments = segs_result.scalars().all()
    for seg in segments:
        seg.status = "CLEAR"
        seg.updated_at = datetime.utcnow()

    # Reset shipment
    ship_result = await db.execute(select(Shipment).limit(1))
    shipment = ship_result.scalar_one_or_none()
    if shipment:
        shipment.status = "PLANNED"
        routes_result = await db.execute(select(Route).where(Route.label == "A"))
        route_a = routes_result.scalar_one_or_none()
        if route_a:
            shipment.assigned_route_id = route_a.id
        shipment.updated_eta = None
        shipment.updated_at = datetime.utcnow()

    await db.commit()

    # Reset memory
    memory.reset()
    return _build_state_dict()


def get_current_state() -> dict:
    return _build_state_dict()


def pause_scenario():
    if memory.status == "RUNNING":
        memory.status = "PAUSED"


def resume_scenario():
    if memory.status == "PAUSED":
        memory.status = "RUNNING"
