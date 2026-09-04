"""
Logistics Impact Engine — translates risk probability into mission cost.

Formula (DERIVED, labelled explicitly in UI):

  mission_score = base_time_penalty + delay_penalty + urgency_risk_penalty

  where:
    base_time_penalty    = travel_time_h  × BASE_TIME_MULTIPLIER      (10)
    expected_delay_h     = disruption_prob × MAX_BLOCKAGE_DELAY_H     (12h)
    delay_penalty        = disruption_prob × expected_delay_h × DELAY_MULTIPLIER  (8)
    urgency_factor       = urgency / 5
    urgency_risk_penalty = urgency_factor  × disruption_prob × URGENCY_RISK_MULTIPLIER (15)

The score is NOT a real-world cost in rupees — it is a relative decision metric.
Lower score = better expected outcome.
"""

from dataclasses import dataclass
from app.config import settings


@dataclass
class MissionScore:
    route_id: int
    route_label: str
    travel_time_h: float
    disruption_probability: float
    expected_delay_h: float
    urgency: int
    urgency_factor: float
    base_time_penalty: float
    delay_penalty: float
    urgency_risk_penalty: float
    mission_score: float


def compute_mission_score(
    route_id: int,
    route_label: str,
    base_duration_h: float,
    disruption_probability: float,
    urgency: int,
) -> MissionScore:
    """
    Compute expected mission cost for a single route under a given disruption probability.

    urgency: 1 (low) to 5 (critical)
    """
    urgency_factor = urgency / 5.0
    expected_delay_h = disruption_probability * settings.MAX_BLOCKAGE_DELAY_H

    base_time_penalty = base_duration_h * settings.BASE_TIME_MULTIPLIER
    delay_penalty = disruption_probability * expected_delay_h * settings.DELAY_MULTIPLIER
    urgency_risk_penalty = urgency_factor * disruption_probability * settings.URGENCY_RISK_MULTIPLIER

    total = base_time_penalty + delay_penalty + urgency_risk_penalty

    return MissionScore(
        route_id=route_id,
        route_label=route_label,
        travel_time_h=round(base_duration_h, 2),
        disruption_probability=round(disruption_probability, 3),
        expected_delay_h=round(expected_delay_h, 2),
        urgency=urgency,
        urgency_factor=round(urgency_factor, 2),
        base_time_penalty=round(base_time_penalty, 2),
        delay_penalty=round(delay_penalty, 2),
        urgency_risk_penalty=round(urgency_risk_penalty, 2),
        mission_score=round(total, 2),
    )


def compare_routes(
    scores: list[MissionScore],
) -> tuple[MissionScore, MissionScore]:
    """Return (best_score, worst_score) sorted by mission_score ascending."""
    sorted_scores = sorted(scores, key=lambda s: s.mission_score)
    return sorted_scores[0], sorted_scores[-1]
