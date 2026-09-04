"""
Replan Engine — triggered by driver field reports.

When driver reports a road condition, this engine:
1. Updates road segment status in DB
2. Recomputes feasible routes
3. Calls risk + impact + optimization engines
4. Creates a new REACTIVE decision (if needed)
5. Emits network events

This is the CLOSED LOOP proof — driver feedback changes the system state.
"""

from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models import RoadSegment, Shipment, Route, NetworkEvent, Decision, DriverReport
from app.engines.risk_engine import RiskResult
from app.engines.impact_engine import compute_mission_score, MissionScore
from app.engines.optimization_engine import generate_recommendation, Recommendation


async def process_driver_report(
    db: AsyncSession,
    driver_id: int,
    shipment_id: int,
    reported_route_id: int,
    condition: str,  # CLEAR | SLOW | PARTIAL | BLOCKED
    risk_results: dict[int, RiskResult],  # route_id → latest risk
    notes: str = None,
) -> dict:
    """
    Core replanning handler. Returns updated state dict.
    """
    # 1. Update road segment status
    result = await db.execute(
        select(RoadSegment)
        .where(RoadSegment.route_id == reported_route_id, RoadSegment.is_risk_zone == True)
        .limit(1)
    )
    segment = result.scalar_one_or_none()

    # Map condition to segment status
    status_map = {
        "CLEAR": "CLEAR",
        "SLOW": "SLOW",
        "PARTIAL": "PARTIAL",
        "BLOCKED": "BLOCKED",
    }
    segment_status = status_map.get(condition, "SLOW")

    if segment:
        segment.status = segment_status
        segment.updated_at = datetime.utcnow()

    # 2. Get shipment
    ship_result = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = ship_result.scalar_one_or_none()

    # 3. Get all routes
    routes_result = await db.execute(select(Route))
    routes = routes_result.scalars().all()

    # 4. Build segment status map per route
    seg_result = await db.execute(select(RoadSegment))
    segments = seg_result.scalars().all()
    segment_statuses_by_route = {}
    for seg in segments:
        # Use worst status per route
        current = segment_statuses_by_route.get(seg.route_id, "CLEAR")
        severity = {"CLEAR": 0, "SLOW": 1, "PARTIAL": 2, "BLOCKED": 3}
        if severity.get(seg.status, 0) > severity.get(current, 0):
            segment_statuses_by_route[seg.route_id] = seg.status

    # Override for the reported route
    segment_statuses_by_route[reported_route_id] = segment_status

    # 5. Recompute mission scores
    urgency = shipment.urgency if shipment else 3
    new_scores: list[MissionScore] = []
    for route in routes:
        risk = risk_results.get(route.id)
        prob = risk.disruption_probability if risk else 0.1
        # If segment is blocked, force probability to 1.0
        if segment_statuses_by_route.get(route.id) == "BLOCKED":
            prob = 1.0
        score = compute_mission_score(
            route_id=route.id,
            route_label=route.label,
            base_duration_h=route.base_duration_h,
            disruption_probability=prob,
            urgency=urgency,
        )
        new_scores.append(score)

    # 6. Generate new recommendation (REACTIVE)
    current_route_id = shipment.assigned_route_id if shipment else routes[0].id
    recommendation = generate_recommendation(
        current_route_id=current_route_id,
        route_scores=new_scores,
        segment_statuses=segment_statuses_by_route,
        decision_type="REACTIVE",
    )

    # 7. Update shipment status
    if shipment:
        if condition == "BLOCKED":
            shipment.status = "DISRUPTED"
        else:
            shipment.status = "REPLANNED"
        shipment.updated_at = datetime.utcnow()

        # Update ETA if we have a new route
        if recommendation and recommendation.recommended_route_id != current_route_id:
            new_route = next((r for r in routes if r.id == recommendation.recommended_route_id), None)
            if new_route:
                # Compute updated ETA (simplified: add remaining travel time)
                hrs = int(new_route.base_duration_h)
                mins = int((new_route.base_duration_h - hrs) * 60)
                shipment.updated_eta = f"{14 + hrs:02d}:{mins:02d}"
                shipment.assigned_route_id = recommendation.recommended_route_id

    await db.commit()

    return {
        "segment_statuses": segment_statuses_by_route,
        "new_scores": new_scores,
        "recommendation": recommendation,
    }
