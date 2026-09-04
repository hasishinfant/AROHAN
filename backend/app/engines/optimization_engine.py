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
    all_scores: list[MissionScore]
    delay_saved_h: float
    risk_reduced_pct: float


def generate_recommendation(
    current_route_id: int,
    route_scores: list[MissionScore],
    segment_statuses: dict[int, str],  # route_id → status (CLEAR | BLOCKED | ...)
    decision_type: str = "PROACTIVE",
    disruption_probability_current: float = 0.0,
) -> Optional[Recommendation]:
    """
    Select the optimal route given mission scores and segment statuses.
    Returns None if no feasible alternative exists.
    """
    # Filter out fully blocked routes
    feasible = [
        s for s in route_scores
        if segment_statuses.get(s.route_id, "CLEAR") != "BLOCKED"
    ]

    if not feasible:
        return None

    # Minimise mission score
    best = min(feasible, key=lambda s: s.mission_score)
    current = next((s for s in route_scores if s.route_id == current_route_id), None)

    if current is None:
        return None

    delay_saved = max(current.expected_delay_h - best.expected_delay_h, 0)
    risk_reduced = max(
        (current.disruption_probability - best.disruption_probability) * 100, 0
    )

    # Build human-readable reason
    if best.route_id == current_route_id:
        reason = (
            f"Route {current.route_label} remains the best option. "
            f"Mission score {current.mission_score:.0f} is optimal across all evaluated alternatives."
        )
    else:
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
        prefix = "PROACTIVE: " if decision_type == "PROACTIVE" else "REACTIVE: "
        reason = (
            f"{prefix}Although Route {best.route_label} is longer under normal conditions, "
            f"it minimizes expected delivery delay under the predicted disruption. "
            f"{why_not_current} {why_best} "
            f"Score improvement: {current.mission_score - best.mission_score:.0f} points."
        )

    return Recommendation(
        recommended_route_id=best.route_id,
        recommended_route_label=best.route_label,
        current_route_id=current_route_id,
        reason=reason,
        decision_type=decision_type,
        all_scores=route_scores,
        delay_saved_h=round(delay_saved, 2),
        risk_reduced_pct=round(risk_reduced, 1),
    )
