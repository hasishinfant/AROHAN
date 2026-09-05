"""
Pre-Departure Briefing Engine — generates driver pre-departure brief before vehicle leaves warehouse.
"""

def generate_pre_departure_briefing(
    shipment,
    origin_warehouse_name: str,
    destination_warehouse_name: str,
    recommendation,
    recommended_route,
    overall_risk_label: str = "LOW"
) -> dict:
    expected_issues = []
    if recommendation and recommendation.risk_reduced_pct > 20:
        expected_issues.append("Predicted heavy rainfall & flood hazard along primary NH-6 corridor.")
    if recommendation and recommendation.delay_saved_h > 3:
        expected_issues.append(f"Primary corridor blockage could cause ~{recommendation.delay_saved_h:.1f}h delay.")

    recommended_action = (
        f"Proceed via Recommended Route {recommended_route.label} ({recommended_route.via_description})."
        if recommendation else "Proceed on planned route as scheduled."
    )

    return {
        "container": shipment.shipment_code,
        "origin": origin_warehouse_name,
        "destination": destination_warehouse_name,
        "departure": getattr(shipment, "planned_departure", "20:00"),
        "expected_arrival": shipment.updated_eta or shipment.planned_eta,
        "recommended_route": f"Route {recommended_route.label} — {recommended_route.name}",
        "overall_risk": overall_risk_label,
        "route_stability": "HIGH" if overall_risk_label == "LOW" else "MEDIUM",
        "expected_issues": expected_issues if expected_issues else ["Nominal weather & road conditions predicted."],
        "recommended_action": recommended_action,
        "reason": recommendation.reason if recommendation else "System optimal."
    }
