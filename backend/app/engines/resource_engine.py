"""
Resource Redistribution Engine — calculates optimal inter-district supply transfers.

Flow:
1. Identifies districts in SHORTAGE or CRITICAL state.
2. Identifies nearest districts with SURPLUS in the matching resource.
3. Evaluates corridor risk, distance, and travel ETA.
4. Generates actionable ResourceTransfer recommendations.
"""

from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ResourceStock, ResourceTransfer


# NER Road Network Matrix (Distances in km and baseline transit time in hours)
NER_DISTRICT_DISTANCES = {
    ("Kamrup Metro", "East Khasi Hills"): {"distance_km": 102.0, "base_hours": 3.2, "corridor": "NH-6 via Sonapur Ridge"},
    ("Kamrup Metro", "Ri-Bhoi"): {"distance_km": 52.0, "base_hours": 1.6, "corridor": "NH-6 Byrnihat Corridor"},
    ("Kamrup Metro", "Cachar"): {"distance_km": 320.0, "base_hours": 9.5, "corridor": "NH-27 / NH-6 Barak Trunk"},
    ("Kamrup Metro", "West Tripura"): {"distance_km": 550.0, "base_hours": 16.0, "corridor": "NH-8 Southern Link"},
    ("East Khasi Hills", "Ri-Bhoi"): {"distance_km": 50.0, "base_hours": 1.5, "corridor": "NH-6 Highland Section"},
    ("East Khasi Hills", "Cachar"): {"distance_km": 218.0, "base_hours": 7.0, "corridor": "NH-6 Jowai-Ratacherra Cut"},
}


def get_district_corridor(source: str, dest: str) -> dict:
    """Lookup network route between two NER districts."""
    pair = (source, dest)
    reverse_pair = (dest, source)
    if pair in NER_DISTRICT_DISTANCES:
        return NER_DISTRICT_DISTANCES[pair]
    elif reverse_pair in NER_DISTRICT_DISTANCES:
        return NER_DISTRICT_DISTANCES[reverse_pair]
    # Default fallback approximation
    return {"distance_km": 180.0, "base_hours": 5.5, "corridor": "Regional Inter-District Highway"}


async def calculate_redistribution_recommendations(
    db: AsyncSession,
    primary_corridor_risk: float = 0.74,
) -> List[ResourceTransfer]:
    """
    Evaluates district inventory levels and generates transfer recommendations.
    Prioritizes: Nearest Feasible Surplus + Low-Risk Route + Sufficient Stock.
    """
    # Find all stocks
    stocks_result = await db.execute(select(ResourceStock))
    all_stocks = stocks_result.scalars().all()

    shortages = [s for s in all_stocks if s.status in ("SHORTAGE", "CRITICAL")]
    surpluses = [s for s in all_stocks if s.status == "SURPLUS"]

    recommendations = []

    for shortage in shortages:
        # Look for matching surplus in same resource category
        candidates = [
            s for s in surpluses
            if s.resource_type == shortage.resource_type and s.district_name != shortage.district_name
        ]

        if not candidates:
            # Check broad commodity matches
            candidates = [
                s for s in surpluses
                if s.district_name != shortage.district_name
            ]

        if not candidates:
            continue

        # Sort candidates by distance to shortage
        def candidate_distance(c: ResourceStock) -> float:
            corridor_info = get_district_corridor(c.district_name, shortage.district_name)
            return corridor_info["distance_km"]

        candidates.sort(key=candidate_distance)
        best_source = candidates[0]
        corridor_info = get_district_corridor(best_source.district_name, shortage.district_name)

        deficit = max(shortage.required_qty - shortage.available_qty, 50.0)
        transfer_qty = min(deficit, best_source.available_qty * 0.6)  # Don't exhaust source

        # Check existing pending transfer for this pair
        existing = await db.execute(
            select(ResourceTransfer).where(
                ResourceTransfer.source_district == best_source.district_name,
                ResourceTransfer.destination_district == shortage.district_name,
                ResourceTransfer.resource_type == shortage.resource_type,
                ResourceTransfer.status == "PENDING"
            )
        )
        if existing.scalar_one_or_none():
            continue

        # Route risk determination: if NH-6 is high risk, recommend alternate corridor
        route_risk = "HIGH" if primary_corridor_risk > 0.60 and "NH-6" in corridor_info["corridor"] else "LOW"
        recommended_route = (
            f"{corridor_info['corridor']} (Sonapur Ridge Bypass)"
            if route_risk == "HIGH"
            else corridor_info["corridor"]
        )
        adjusted_eta = corridor_info["base_hours"] * (1.25 if route_risk == "HIGH" else 1.0)

        transfer = ResourceTransfer(
            transfer_code=f"TR-NER-{int(datetime.utcnow().timestamp()) % 10000:04d}",
            source_district=best_source.district_name,
            destination_district=shortage.district_name,
            resource_type=shortage.resource_type,
            quantity=round(transfer_qty, 1),
            unit=shortage.unit,
            distance_km=corridor_info["distance_km"],
            route_risk_level="MODERATE" if route_risk == "HIGH" else "LOW",
            eta_hours=round(adjusted_eta, 1),
            recommended_route_label=recommended_route,
            transport_mode="ROAD",
            status="PENDING",
            reason=(
                f"Surplus in {best_source.district_name} ({best_source.available_qty:.0f} {best_source.unit}) "
                f"reallocated to alleviate {shortage.status} in {shortage.district_name} "
                f"(Deficit: {deficit:.0f} {shortage.unit}). Route adjusted via {recommended_route} to mitigate corridor disruption."
            )
        )
        db.add(transfer)
        recommendations.append(transfer)

    if recommendations:
        await db.commit()

    return recommendations
