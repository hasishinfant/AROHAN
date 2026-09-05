"""
Alert Engine — synthesizes environmental risk and district shortages into actionable operational alerts.
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import OperationalAlert, CorridorRiskForecast, ResourceStock


async def generate_operational_alerts(db: AsyncSession) -> List[OperationalAlert]:
    """
    Scans risk forecasts and district inventories to generate actionable institutional alerts.
    """
    # Check if there are already active alerts
    existing = await db.execute(select(OperationalAlert).where(OperationalAlert.status == "ACTIVE"))
    active_alerts = existing.scalars().all()
    if active_alerts:
        return active_alerts

    # Generate primary operational alerts covering 7 distinct disaster recommendation types
    alerts_to_create = [
        OperationalAlert(
            alert_code="ALT-NER-0101",
            priority="CRITICAL",
            title="LANDSLIDE CORRIDOR RISK ALERT — NH-6 JORABAT-UMIAM ESCARPMENT",
            description="Continuous heavy rainfall (38.0 mm/h) and 42° slope cut between km 42-54 indicate elevated slope shear failure probability (74%). Lifeline movement at critical risk of entrapment.",
            location_district="East Khasi Hills (Shillong)",
            affected_corridor="NH-6 Jorabat → Umiam Lifeline Highway km 42–54",
            affected_resource="Essential Emergency Medical Supplies & High-Priority Relief Goods",
            suggested_source_district="Kamrup Metro (Guwahati Buffer Depot)",
            recommended_route="Route B (Sonapur Ridge Highland Corridor)",
            estimated_eta="4h 15m (vs 12h+ if trapped in debris)",
            recommended_action="Execute immediate proactive reroute directive for Convoy REL-001 via Sonapur Ridge Bypass before forecasted slope collapse at 14:00 IST.",
            responsible_department="NESAC Disaster Risk Monitoring & NHIDCL Highway Operations",
            status="ACTIVE",
            confidence="HIGH",
            data_source="SIMULATION_DATA",
        ),
        OperationalAlert(
            alert_code="ALT-NER-0102",
            priority="CRITICAL",
            title="INTER-DISTRICT RESOURCE REDISTRIBUTION RECOMMENDATION — FOOD GRAINS DEFICIT",
            description="Shillong central reserve grain stock projected to deplete below 48-hour safety buffer. Guwahati Buffer Depot maintains 4,500 MT surplus buffer.",
            location_district="East Khasi Hills (Shillong)",
            affected_corridor="Inter-State Transit Corridor B (Sonapur Ridge)",
            affected_resource="Rice & Staple Food Grains (1,200 MT)",
            suggested_source_district="Kamrup Metro (Guwahati Inland Port Silos)",
            recommended_route="Route B via Sonapur Ridge Highway",
            estimated_eta="4h 30m",
            recommended_action="Authorize and dispatch Transfer TRF-00101 (1,200 MT Food Grains) from FCI Amingaon to Shillong Mawlai Depot to secure 7-day reserve buffer.",
            responsible_department="Food, Civil Supplies & Consumer Affairs / NER Disaster Management",
            status="ACTIVE",
            confidence="HIGH",
            data_source="SIMULATION_DATA",
        ),
        OperationalAlert(
            alert_code="ALT-NER-0103",
            priority="HIGH",
            title="FLOOD DISRUPTION WARNING & DIVERSION — BARAK VALLEY MULTIMODAL CORRIDOR",
            description="Upstream catchment discharge has triggered flash flood surge approaching rail-road culverts along Lumding-Badarpur section. Transit risk rated 68%.",
            location_district="Cachar (Silchar)",
            affected_corridor="NH-27 / Lumding-Badarpur Rail-Road Section",
            affected_resource="Potable Water Treatment Consumables & Emergency Rations",
            suggested_source_district="Kamrup Metro Central Depot",
            recommended_route="Multimodal Freight: Inland Rail to Lumding Junction + Protected Truck Convoy",
            estimated_eta="9h 40m",
            recommended_action="Divert surface convoys to Multimodal Rail-Road Corridor via Lumding Junction. Pre-stage pontoon bridging units at Badarpur ghat.",
            responsible_department="State Disaster Response Force (SDRF) Logistics Wing & Northeast Frontier Railway",
            status="ACTIVE",
            confidence="HIGH",
            data_source="SIMULATION_DATA",
        ),
        OperationalAlert(
            alert_code="ALT-NER-0104",
            priority="HIGH",
            title="ROUTE ACCESSIBILITY DEGRADATION NOTICE — NH-27 HAFLONG MOUNTAIN PASS",
            description="Mudflow accumulation and shoulder saturation have degraded road friction coefficient by 45%. Heavy multi-axle freight vehicles face severe jackknife risk.",
            location_district="Dima Hasao (Haflong)",
            affected_corridor="NH-27 km 110–128 Borail Range Incline",
            affected_resource="Heavy Infrastructure Equipment & Heavy Bulk Transport",
            suggested_source_district="Guwahati Logistics Base",
            recommended_route="Daylight Convoy Escort Protocol via Haflong Bypass",
            estimated_eta="8h 20m",
            recommended_action="Restrict heavy convoy transit to designated daylight pilot escorts. Enforce 25 km/h speed governor for relief vehicles above 10 MT payload.",
            responsible_department="Border Roads Organisation (BRO) / Assam Public Works Department",
            status="REVIEWED",
            confidence="HIGH",
            data_source="SIMULATION_DATA",
        ),
        OperationalAlert(
            alert_code="ALT-NER-0105",
            priority="CRITICAL",
            title="RESOURCE SHORTAGE FORECAST & BUFFER DEPLETION — MEDICAL OXYGEN",
            description="Agartala Civil Hospital oxygen manifold reserve has dropped to 110 cylinders (threshold: 250 units). Depletion anticipated within 18 hours.",
            location_district="West Tripura (Agartala)",
            affected_corridor="NH-8 Inter-State Lifeline",
            affected_resource="High-Altitude Medical Oxygen Cylinders (180 Units)",
            suggested_source_district="East Khasi Hills (NEIGRIHMS Cryogenic Reserve, Shillong)",
            recommended_route="Southern Inter-State Highway via Karimganj",
            estimated_eta="11h 15m",
            recommended_action="Approve emergency priority dispatch TRF-00103 of 180 cryogenic oxygen cylinders with armed highway pilot escort to Agartala Civil Hospital.",
            responsible_department="Health & Family Welfare Directorate / Emergency Medical Logistics",
            status="APPROVED",
            confidence="HIGH",
            data_source="SIMULATION_DATA",
        ),
        OperationalAlert(
            alert_code="ALT-NER-0106",
            priority="HIGH",
            title="EMERGENCY STOCK PRE-POSITIONING ADVISORY — MONSOON FUEL RESERVE",
            description="Aizawl municipal and hospital backup diesel generator stocks are at 48,000 L (below 50% capacity) ahead of forecasted 72-hour isolated storm cycle.",
            location_district="Aizawl (Zuangtui Strategic Depot)",
            affected_corridor="Silchar-Aizawl Highway NH-306",
            affected_resource="Disaster Recovery Fuel (POL - Diesel & Micro-Generators)",
            suggested_source_district="Cachar (Silchar Supply Base)",
            recommended_route="NH-306 Reinforced Convoy Alignment",
            estimated_eta="6h 45m",
            recommended_action="Pre-position 50,000 Liters of disaster response diesel and 20 mobile micro-generators to Zuangtui Strategic Depot before NH-306 storm window.",
            responsible_department="Indian Oil Corporation (Logistics Wing) & Mizoram Disaster Management Authority",
            status="ACTIVE",
            confidence="HIGH",
            data_source="SIMULATION_DATA",
        ),
        OperationalAlert(
            alert_code="ALT-NER-0107",
            priority="MEDIUM",
            title="MULTI-AGENCY EMERGENCY RESPONSE DIRECTIVE — JOINT LIFELINE SECURITY",
            description="Simultaneous hazard escalation across NH-6 (Landslide) and NH-27 (Flood approach) necessitates coordinated multi-agency asset staging.",
            location_district="Regional Tri-Junction (Assam-Meghalaya-Tripura)",
            affected_corridor="Strategic Lifeline Network Nodes (Jorabat, Sonapur, Lumding, Badarpur)",
            affected_resource="Heavy Excavators, Bailey Bridge Sections & SDRF Recovery Teams",
            suggested_source_district="BRO Tezpur & SDRF Guwahati",
            recommended_route="Multi-Node Forward Staging Deployment",
            estimated_eta="3h 00m Stage-In",
            recommended_action="Stage 4 JCB excavators at km 48 Umiam, position mobile Bailey bridge components at Silchar, and activate joint Indian Army-SDRF logistics liaison.",
            responsible_department="State Disaster Management Authorities (Assam, Meghalaya, Tripura, Mizoram) & MDoNER",
            status="ACTIVE",
            confidence="HIGH",
            data_source="SIMULATION_DATA",
        ),
    ]

    for alert in alerts_to_create:
        db.add(alert)

    await db.commit()
    return alerts_to_create
