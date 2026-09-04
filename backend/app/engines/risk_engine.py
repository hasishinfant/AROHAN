"""
Risk Engine — computes road disruption probability from environmental inputs.

Formula (weighted linear combination, explicitly labelled DERIVED):
  score = W_RAINFALL_INTENSITY * norm(rainfall_intensity)
        + W_CUMULATIVE_RAIN    * norm(cumulative_24h)
        + W_SLOPE              * slope_factor
        + W_HISTORICAL         * historical_disruption_index
        + W_VULNERABILITY      * vulnerability_score

Output: disruption_probability (0–1), confidence (LOW/MEDIUM/HIGH), horizon_h

Data source classification:
  REAL: slope_factor (SRTM-derived), historical_disruption_index (NRSC public records)
  SIMULATED: rainfall inputs (injected by demo scenario)
  DERIVED: disruption_probability, confidence
"""

from dataclasses import dataclass
from app.config import settings


@dataclass
class RiskResult:
    route_id: int
    route_label: str
    rainfall_intensity_mmh: float
    cumulative_24h_mm: float
    disruption_probability: float
    confidence: str  # LOW | MEDIUM | HIGH
    horizon_h: int
    score_breakdown: dict


def compute_disruption_probability(
    route_id: int,
    route_label: str,
    slope_factor: float,
    historical_disruption_index: float,
    vulnerability_score: float,
    rainfall_intensity_mmh: float,
    cumulative_24h_mm: float,
    horizon_h: int = 18,
) -> RiskResult:
    """
    Compute road disruption probability.
    All weights are configurable via settings (displayed in UI as thresholds).
    """
    # Normalize inputs to [0, 1]
    norm_intensity = min(rainfall_intensity_mmh / 50.0, 1.0)
    norm_cumulative = min(cumulative_24h_mm / 150.0, 1.0)

    # Weighted score
    score_breakdown = {
        "rainfall_intensity": round(settings.W_RAINFALL_INTENSITY * norm_intensity, 4),
        "cumulative_rain": round(settings.W_CUMULATIVE_RAIN * norm_cumulative, 4),
        "slope": round(settings.W_SLOPE * slope_factor, 4),
        "historical": round(settings.W_HISTORICAL * historical_disruption_index, 4),
        "vulnerability": round(settings.W_VULNERABILITY * vulnerability_score, 4),
    }

    probability = sum(score_breakdown.values())
    probability = round(min(max(probability, 0.0), 1.0), 3)

    # Confidence: based on data availability and score magnitude
    if rainfall_intensity_mmh > 0 and cumulative_24h_mm > 0:
        if probability >= 0.65:
            confidence = "HIGH"
        elif probability >= 0.35:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"
    else:
        confidence = "LOW"

    return RiskResult(
        route_id=route_id,
        route_label=route_label,
        rainfall_intensity_mmh=rainfall_intensity_mmh,
        cumulative_24h_mm=cumulative_24h_mm,
        disruption_probability=probability,
        confidence=confidence,
        horizon_h=horizon_h,
        score_breakdown=score_breakdown,
    )


def should_trigger_proactive_replan(
    risk: RiskResult,
    current_mission_score: float,
    alternative_mission_score: float,
) -> tuple[bool, str]:
    """
    Determine if proactive replanning should be triggered.
    Returns (should_trigger, reason).

    Thresholds (all configurable via settings):
      - disruption_probability > DISRUPTION_PROB_THRESHOLD (default: 0.60)
      - horizon_h <= HORIZON_HOURS_THRESHOLD (default: 24)
      - confidence >= MIN_CONFIDENCE_FOR_PROACTIVE (default: MEDIUM)
      - mission_score_delta >= MISSION_SCORE_DELTA_THRESHOLD (default: 20)
    """
    confidence_rank = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}
    min_rank = confidence_rank.get(settings.MIN_CONFIDENCE_FOR_PROACTIVE, 1)
    actual_rank = confidence_rank.get(risk.confidence, 0)

    reasons = []

    if risk.disruption_probability <= settings.DISRUPTION_PROB_THRESHOLD:
        reasons.append(
            f"disruption probability {risk.disruption_probability:.0%} ≤ threshold {settings.DISRUPTION_PROB_THRESHOLD:.0%}"
        )
    if risk.horizon_h > settings.HORIZON_HOURS_THRESHOLD:
        reasons.append(f"horizon {risk.horizon_h}h exceeds threshold {settings.HORIZON_HOURS_THRESHOLD}h")
    if actual_rank < min_rank:
        reasons.append(f"confidence {risk.confidence} below minimum {settings.MIN_CONFIDENCE_FOR_PROACTIVE}")

    score_delta = current_mission_score - alternative_mission_score
    if score_delta < settings.MISSION_SCORE_DELTA_THRESHOLD:
        reasons.append(
            f"score improvement {score_delta:.1f} < threshold {settings.MISSION_SCORE_DELTA_THRESHOLD}"
        )

    if reasons:
        return False, "Threshold not met: " + "; ".join(reasons)

    return True, (
        f"Route disruption probability {risk.disruption_probability:.0%} exceeds threshold "
        f"{settings.DISRUPTION_PROB_THRESHOLD:.0%}, horizon {risk.horizon_h}h, "
        f"confidence {risk.confidence}, expected score improvement "
        f"{current_mission_score - alternative_mission_score:.1f} points."
    )
