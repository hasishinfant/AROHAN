"""
Decision Engine — manages the decision lifecycle and audit trail.
PENDING → APPROVED | REJECTED | MODIFIED
"""

from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models import Decision, Shipment, NetworkEvent
from app.engines.optimization_engine import Recommendation


async def create_decision(
    db: AsyncSession,
    shipment_id: int,
    current_route_id: int,
    recommendation: Recommendation,
    risk_probability: float,
    confidence: str,
    horizon_h: int,
    expected_delay_h: float,
    mission_score_current: float,
) -> Decision:
    """Create a new PENDING decision from a recommendation."""
    decision = Decision(
        shipment_id=shipment_id,
        current_route_id=current_route_id,
        recommended_route_id=recommendation.recommended_route_id,
        status="PENDING",
        reason=recommendation.reason,
        mission_score_current=mission_score_current,
        mission_score_recommended=min(s.mission_score for s in recommendation.all_scores),
        disruption_probability=risk_probability,
        expected_delay_h=expected_delay_h,
        confidence=confidence,
        horizon_h=horizon_h,
        decision_type=recommendation.decision_type,
    )
    db.add(decision)
    await db.commit()
    await db.refresh(decision)
    return decision


async def approve_decision(
    db: AsyncSession,
    decision_id: int,
    dispatcher_id: int,
    notes: str = None,
) -> Decision:
    """Approve a decision — update status and log event."""
    result = await db.execute(select(Decision).where(Decision.id == decision_id))
    decision = result.scalar_one_or_none()
    if not decision:
        raise ValueError(f"Decision {decision_id} not found")

    decision.status = "APPROVED"
    decision.approved_route_id = decision.recommended_route_id
    decision.dispatcher_id = dispatcher_id
    decision.approved_at = datetime.utcnow()
    decision.modifier_notes = notes

    # Update shipment assigned route
    result2 = await db.execute(select(Shipment).where(Shipment.id == decision.shipment_id))
    shipment = result2.scalar_one_or_none()
    if shipment:
        shipment.assigned_route_id = decision.recommended_route_id
        shipment.status = "APPROVED"
        shipment.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(decision)
    return decision


async def reject_decision(
    db: AsyncSession,
    decision_id: int,
    dispatcher_id: int,
    reason: str,
) -> Decision:
    result = await db.execute(select(Decision).where(Decision.id == decision_id))
    decision = result.scalar_one_or_none()
    if not decision:
        raise ValueError(f"Decision {decision_id} not found")

    decision.status = "REJECTED"
    decision.dispatcher_id = dispatcher_id
    decision.modifier_notes = reason
    decision.approved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(decision)
    return decision


async def get_latest_decision(db: AsyncSession, shipment_id: int) -> Decision | None:
    result = await db.execute(
        select(Decision)
        .where(Decision.shipment_id == shipment_id)
        .order_by(Decision.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()
