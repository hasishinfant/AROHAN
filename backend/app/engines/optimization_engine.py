"""
Optimization Engine — selects the best route and generates human-readable reasoning.

The optimizer minimizes expected mission_score across all feasible routes.
A route is infeasible if its road segment status is BLOCKED.

Generates:
  - recommended_route
  - reason string (shown verbatim in ACTION CARD)
  - all route scores
  - decision_type (PROACTIVE | REACTIVE)
"""

from dataclasses import dataclass
from typing import Optional
from app.engines.impact_engine import MissionScore


@dataclass
class Recommendation:
    recommended_route_id: int
    recommended_route_label: str
    current_route_id: int
    reason: str
    decision_type: str  # PROACTIVE | REACTIVE
    decision_action: str  # CONTINUE | REROUTE | REVIEW | ESCALATE
    all_scores: list[MissionScore]
    delay_saved_h: float
    risk_reduced_pct: float


def generate_recommendation(
    current_route_id: int,
    route_scores: list[MissionScore],
    segment_statuses: dict[int, str],  # route_id → status (CLEAR | BLOCKED | ...)
    decision_type: str = "PROACTIVE",
    disruption_probability_current: float = 0.0,
    confidence_level: str = "HIGH",
) -> Recommendation:
    """
    Select the optimal route given mission scores and segment statuses.
    Supports decision actions: CONTINUE | REROUTE | REVIEW | ESCALATE
    """
    # Filter out fully blocked routes
    feasible = [
        s for s in route_scores
        if segment_statuses.get(s.route_id, "CLEAR") != "BLOCKED"
    ]

    current = next((s for s in route_scores if s.route_id == current_route_id), None)

    # 1. ESCALATE: No safe feasible route exists
    if not feasible:
        return Recommendation(
            recommended_route_id=current_route_id,
            recommended_route_label=current.route_label if current else "A",
            current_route_id=current_route_id,
            reason="ESCALATE: NO SAFE FEASIBLE ALTERNATIVE. Primary route is BLOCKED and no secondary corridor satisfies mission constraints under predicted network state. Immediate human escalation required.",
            decision_type=decision_type,
            decision_action="ESCALATE",
            all_scores=route_scores,
            delay_saved_h=0.0,
            risk_reduced_pct=0.0,
        )

    # Minimise mission score
    best = min(feasible, key=lambda s: s.mission_score)

    if current is None:
        current = best

    # 2. REVIEW: Low confidence data
    if confidence_level == "LOW":
        return Recommendation(
            recommended_route_id=current_route_id,
            recommended_route_label=current.route_label,
            current_route_id=current_route_id,
            reason="REVIEW REQUIRED: Elevated disruption risk predicted, but environmental data confidence is LOW (limited IMD/historical telemetry). Human dispatcher manual review required before rerouting.",
            decision_type=decision_type,
            decision_action="REVIEW",
            all_scores=route_scores,
            delay_saved_h=0.0,
            risk_reduced_pct=0.0,
        )

    delay_saved = max(current.expected_delay_h - best.expected_delay_h, 0)
    risk_reduced = max(
        (current.disruption_probability - best.disruption_probability) * 100, 0
    )

    # 3. CONTINUE: Current route remains optimal
    if best.route_id == current_route_id:
        reason = (
            f"CONTINUE: Route {current.route_label} remains optimal. "
            f"Mission score {current.mission_score:.0f} is optimal across all evaluated alternatives."
        )
        action = "CONTINUE"
    else:
        # 4. REROUTE: Reroute produces materially lower mission loss
        why_not_current = (
            f"Route {current.route_label} carries a {current.disruption_probability:.0%} "
            f"disruption probability, yielding an expected delay of {current.expected_delay_h:.1f}h "
            f"and a mission score of {current.mission_score:.0f}."
        )
        why_best = (
            f"Route {best.route_label} has only {best.disruption_probability:.0%} disruption probability "
            f"(+{best.travel_time_h - current.travel_time_h:.1f}h travel time under normal conditions), "
            f"expected delay {best.expected_delay_h:.1f}h, mission score {best.mission_score:.0f}."
        )
        prefix = "PROACTIVE REROUTE: " if decision_type == "PROACTIVE" else "REACTIVE REROUTE: "
        reason = (
            f"{prefix}Although Route {best.route_label} is longer under normal conditions, "
            f"it minimizes expected delivery delay under the predicted disruption. "
            f"{why_not_current} {why_best} "
            f"Score improvement: {current.mission_score - best.mission_score:.0f} points."
        )
        action = "REROUTE"

    return Recommendation(
        recommended_route_id=best.route_id,
        recommended_route_label=best.route_label,
        current_route_id=current_route_id,
        reason=reason,
        decision_type=decision_type,
        decision_action=action,
        all_scores=route_scores,
        delay_saved_h=round(delay_saved, 2),
        risk_reduced_pct=round(risk_reduced, 1),
    )
