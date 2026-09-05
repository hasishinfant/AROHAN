"""
Seed Data — creates all static reference data for the AROHAN demo.

Seeded entities:
  - 3 users (admin, dispatcher, driver)
  - 1 vehicle
  - 1 driver
  - 2 routes (A: NH-6 via Umiam, B: Ridge via Sonapur)
  - 2 road segments (one risk zone per route)
  - 1 shipment (SHP-001, Guwahati → Shillong, urgency 4)

All values are clearly marked with their data source in the schema.
"""

import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import (
    User, Vehicle, Driver, Route, RoadSegment, Shipment,
    ResourceStock, ResourceTransfer, OperationalAlert, CorridorRiskForecast
)
from app.config import ROUTE_A_COORDS, ROUTE_B_COORDS


async def seed_database(db: AsyncSession):
    """Idempotent seed — skips existing entities."""

    # ── Check if base entities already seeded ──────────────────────────────────
    existing_user = await db.execute(select(User).limit(1))
    if not existing_user.scalar_one_or_none():
        # ── Users ─────────────────────────────────────────────────────────────────
        admin = User(username="admin", role="ADMIN", full_name="Admin User")
        dispatcher = User(username="arjun.sharma", role="DISPATCHER", full_name="Arjun Sharma")
        driver_user = User(username="rahul.kumar", role="DRIVER", full_name="Rahul Kumar")
        db.add_all([admin, dispatcher, driver_user])
        await db.flush()

        # ── Vehicle ───────────────────────────────────────────────────────────────
        vehicle = Vehicle(
            license_plate="AS-01-A-1234",
            vehicle_type="Medium Truck",
            capacity_kg=5000.0,
        )
        db.add(vehicle)
        await db.flush()

        # ── Driver ────────────────────────────────────────────────────────────────
        driver = Driver(
            user_id=driver_user.id,
            vehicle_id=vehicle.id,
            name="Rahul Kumar",
            phone="+91-9876543210",
            current_lat=26.1445,
            current_lon=91.7362,
            status="AVAILABLE",
        )
        db.add(driver)
        await db.flush()

        # ── Routes ────────────────────────────────────────────────────────────────
        route_a = Route(
            label="A",
            name="Route A — NH-6 via Jorabat–Umiam",
            origin="Guwahati",
            destination="Shillong",
            distance_km=102.0,
            base_duration_h=3.0,         # 3h normal travel
            geometry_geojson=json.dumps({
                "type": "LineString",
                "coordinates": ROUTE_A_COORDS,
            }),
            slope_factor=0.70,            # REAL: SRTM-derived, NH-6 passes low valley
            historical_disruption_index=0.80,  # REAL: high historical monsoon disruption
            vulnerability_score=0.70,     # High — poor drainage near Umiam
            via_description="Via Khanapara → Jorabat → Byrnihat → Umiam → Nongpoh",
        )

        route_b = Route(
            label="B",
            name="Route B — Ridge Road via Sonapur",
            origin="Guwahati",
            destination="Shillong",
            distance_km=128.0,
            base_duration_h=4.2,         # 4.2h, longer but safer
            geometry_geojson=json.dumps({
                "type": "LineString",
                "coordinates": ROUTE_B_COORDS,
            }),
            slope_factor=0.30,            # Higher ridge, less flood risk
            historical_disruption_index=0.20,  # Low historical disruption
            vulnerability_score=0.30,     # Better road quality, drainage
            via_description="Via Sonapur → Ridge road → Upper Shillong approach",
        )

        db.add_all([route_a, route_b])
        await db.flush()

        # ── Road Segments ─────────────────────────────────────────────────────────
        # Route A risk zone: Umiam area
        seg_a_risk = RoadSegment(
            route_id=route_a.id,
            name="NH-6 Umiam River Segment",
            is_risk_zone=True,
            status="CLEAR",
            lat_start=25.9500,
            lon_start=91.9300,
            lat_end=25.8200,
            lon_end=91.9600,
        )
        seg_a_normal = RoadSegment(
            route_id=route_a.id,
            name="NH-6 Jorabat–Byrnihat Segment",
            is_risk_zone=False,
            status="CLEAR",
            lat_start=26.0400,
            lon_start=91.8550,
            lat_end=25.9700,
            lon_end=91.9300,
        )
        # Route B (no high-risk segment)
        seg_b_normal = RoadSegment(
            route_id=route_b.id,
            name="Ridge Road Sonapur–Mawlai",
            is_risk_zone=False,
            status="CLEAR",
            lat_start=26.0600,
            lon_start=91.7650,
            lat_end=25.7700,
            lon_end=91.8600,
        )

        db.add_all([seg_a_risk, seg_a_normal, seg_b_normal])
        await db.flush()

        # ── Shipment ─────────────────────────────────────────────────────────────
        shipment = Shipment(
            shipment_code="SHP-001",
            cargo_type="Medical Supplies (Vaccines & Equipment)",
            weight_kg=850.0,
            urgency=4,           # High urgency (1–5 scale)
            origin="Guwahati Distribution Centre",
            destination="Shillong Civil Hospital",
            status="PLANNED",
            assigned_route_id=route_a.id,
            assigned_driver_id=driver.id,
            planned_departure="09:30",
            planned_eta="13:30",
        )
        db.add(shipment)
        await db.flush()

    # ── Institutional Resource Stocks (District Surplus & Shortage) ───────────
    existing_stock = await db.execute(select(ResourceStock).limit(1))
    if not existing_stock.scalar_one_or_none():
        stocks = [
            # Kamrup Metro (Major Regional Hub - Surplus)
            ResourceStock(
                district_name="Kamrup Metro",
                state_name="Assam",
                resource_type="Rice & Food Grains",
                available_qty=12500.0,
                required_qty=4000.0,
                unit="MT",
                status="SURPLUS",
                priority=2,
                storage_facility="FCI Central Silo & Depot, Guwahati",
            ),
            ResourceStock(
                district_name="Kamrup Metro",
                state_name="Assam",
                resource_type="Emergency Medical Kits",
                available_qty=4200.0,
                required_qty=1500.0,
                unit="Kits",
                status="SURPLUS",
                priority=1,
                storage_facility="Guwahati Medical College Regional Depot",
            ),
            ResourceStock(
                district_name="Kamrup Metro",
                state_name="Assam",
                resource_type="High-Altitude Oxygen Cylinders",
                available_qty=1800.0,
                required_qty=600.0,
                unit="Cylinders",
                status="SURPLUS",
                priority=2,
                storage_facility="Assam State Health Gas Facility, Jalukbari",
            ),
            ResourceStock(
                district_name="Kamrup Metro",
                state_name="Assam",
                resource_type="Disaster Recovery Fuel",
                available_qty=240.0,
                required_qty=100.0,
                unit="KL",
                status="SURPLUS",
                priority=3,
                storage_facility="IOCL Betkuchi Petroleum Terminal",
            ),
            # East Khasi Hills (Highland Consumer - Shortage under risk)
            ResourceStock(
                district_name="East Khasi Hills",
                state_name="Meghalaya",
                resource_type="Rice & Food Grains",
                available_qty=950.0,
                required_qty=3200.0,
                unit="MT",
                status="SHORTAGE",
                priority=5,
                storage_facility="Meghalaya Civil Supplies Godown, Mawlai",
            ),
            ResourceStock(
                district_name="East Khasi Hills",
                state_name="Meghalaya",
                resource_type="Emergency Medical Kits",
                available_qty=280.0,
                required_qty=1200.0,
                unit="Kits",
                status="CRITICAL",
                priority=5,
                storage_facility="NEIGRIHMS Central Medical Stores, Shillong",
            ),
            ResourceStock(
                district_name="East Khasi Hills",
                state_name="Meghalaya",
                resource_type="High-Altitude Oxygen Cylinders",
                available_qty=520.0,
                required_qty=600.0,
                unit="Cylinders",
                status="ADEQUATE",
                priority=3,
                storage_facility="Shillong Civil Hospital Reserve",
            ),
            # Ri-Bhoi (Transit Hill District - Low Medical)
            ResourceStock(
                district_name="Ri-Bhoi",
                state_name="Meghalaya",
                resource_type="Rice & Food Grains",
                available_qty=620.0,
                required_qty=700.0,
                unit="MT",
                status="ADEQUATE",
                priority=3,
                storage_facility="Nongpoh Sub-Divisional Supply Depot",
            ),
            ResourceStock(
                district_name="Ri-Bhoi",
                state_name="Meghalaya",
                resource_type="Emergency Medical Kits",
                available_qty=110.0,
                required_qty=450.0,
                unit="Kits",
                status="LOW",
                priority=4,
                storage_facility="Nongpoh Civil Hospital Store",
            ),
            # Cachar (Barak Valley Hub - Critical Flood Needs)
            ResourceStock(
                district_name="Cachar",
                state_name="Assam",
                resource_type="Rice & Food Grains",
                available_qty=850.0,
                required_qty=2600.0,
                unit="MT",
                status="SHORTAGE",
                priority=5,
                storage_facility="Silchar Freight Terminal Warehouse",
            ),
            ResourceStock(
                district_name="Cachar",
                state_name="Assam",
                resource_type="Potable Drinking Water",
                available_qty=45.0,
                required_qty=350.0,
                unit="KL",
                status="CRITICAL",
                priority=5,
                storage_facility="Barak Valley Disaster Relief Staging Area",
            ),
            # West Tripura (State Capital Depot - Adequate)
            ResourceStock(
                district_name="West Tripura",
                state_name="Tripura",
                resource_type="Rice & Food Grains",
                available_qty=5200.0,
                required_qty=4800.0,
                unit="MT",
                status="ADEQUATE",
                priority=2,
                storage_facility="FCI Central Storage Depot, Agartala",
            ),
            ResourceStock(
                district_name="West Tripura",
                state_name="Tripura",
                resource_type="Emergency Medical Kits",
                available_qty=1900.0,
                required_qty=1500.0,
                unit="Kits",
                status="ADEQUATE",
                priority=2,
                storage_facility="Tripura State Central Pharmacy",
            ),
        ]
        db.add_all(stocks)
        await db.flush()

    # ── Institutional Corridor Risk Forecasts (Current vs 24h Window) ─────────
    existing_forecasts = await db.execute(select(CorridorRiskForecast).limit(1))
    if not existing_forecasts.scalar_one_or_none():
        forecasts = [
            CorridorRiskForecast(
                corridor_name="NH-6 Jorabat → Umiam Highway",
                state_name="Meghalaya",
                risk_type="LANDSLIDE",
                severity="CRITICAL",
                time_window="CURRENT",
                disruption_probability=0.74,
                confidence="HIGH",
                affected_segment="km 68 to 74 (Umiam Dam Bypass Cut)",
                recommended_action="Proactively divert heavy logistics traffic via Sonapur Ridge Bypass (Route B).",
            ),
            CorridorRiskForecast(
                corridor_name="NH-27 / NH-6 Barak Trunk Section",
                state_name="Assam",
                risk_type="FLOOD",
                severity="HIGH",
                time_window="CURRENT",
                disruption_probability=0.58,
                confidence="MEDIUM",
                affected_segment="Silchar Low-lying Approach (Chanderpur area)",
                recommended_action="Deploy SDRF water rescue teams and initiate multimodal rail transfer at Lumding.",
            ),
            CorridorRiskForecast(
                corridor_name="NH-6 Byrnihat-Jorabat Foothill Section",
                state_name="Assam / Meghalaya",
                risk_type="HEAVY_RAINFALL",
                severity="HIGH",
                time_window="FORECAST_6H",
                disruption_probability=0.68,
                confidence="HIGH",
                affected_segment="km 24 to 38 (Byrnihat Drainage Basin)",
                recommended_action="Pre-position emergency clearing bulldozers and enforce single-lane convoy control.",
            ),
            CorridorRiskForecast(
                corridor_name="Lumding-Badarpur Hill Rail Corridor",
                state_name="Assam",
                risk_type="ROAD_ACCESSIBILITY",
                severity="MODERATE",
                time_window="FORECAST_12H",
                disruption_probability=0.44,
                confidence="MEDIUM",
                affected_segment="Tunnel 7-10 Escarpment Cut",
                recommended_action="Restrict heavy bulk freight transit and inspect culverts every 4 hours.",
            ),
            CorridorRiskForecast(
                corridor_name="NH-306 Silchar → Aizawl Mountain Link",
                state_name="Mizoram",
                risk_type="LANDSLIDE",
                severity="HIGH",
                time_window="FORECAST_24H",
                disruption_probability=0.62,
                confidence="MEDIUM",
                affected_segment="Kolasib Mountain Pass (km 45–52)",
                recommended_action="Halt night transit of fuel tankers and stage emergency bridge restoration units.",
            ),
        ]
        db.add_all(forecasts)
        await db.flush()

    # ── Institutional Resource Redistribution Recommendations ─────────────────
    existing_transfers = await db.execute(select(ResourceTransfer).limit(1))
    if not existing_transfers.scalar_one_or_none():
        transfer = ResourceTransfer(
            transfer_code="TR-NER-0104",
            source_district="Kamrup Metro",
            destination_district="East Khasi Hills",
            resource_type="Rice & Food Grains",
            quantity=2250.0,
            unit="MT",
            distance_km=102.0,
            route_risk_level="MODERATE",
            eta_hours=4.2,
            recommended_route_label="Route B (Sonapur Ridge Bypass)",
            transport_mode="ROAD",
            status="PENDING",
            reason="Surplus in Kamrup Metro (12,500 MT) reallocated to East Khasi Hills (Deficit: 2,250 MT). Route routed via Sonapur Ridge Bypass to avoid Umiam corridor landslide blockage.",
        )
        db.add(transfer)
        await db.flush()

    # ── Operational Actionable Alerts (Automated Coordination) ─────────────────
    existing_alerts = await db.execute(select(OperationalAlert).limit(1))
    if not existing_alerts.scalar_one_or_none():
        alerts = [
            OperationalAlert(
                alert_code="ALT-NER-0102",
                priority="CRITICAL",
                title="POTENTIAL SUPPLY DISRUPTION DETECTED — NH-6 CORRIDOR",
                description="Heavy rainfall (38.0 mm/h) and steep cut slope (42°) at Umiam indicate elevated disruption risk (74%) on primary lifeline corridor.",
                location_district="East Khasi Hills (Shillong)",
                affected_corridor="NH-6 Jorabat → Umiam Highway",
                affected_resource="Essential Food Supplies & Medical Kits",
                suggested_source_district="Kamrup Metro (Guwahati Inland Port)",
                recommended_route="Alternative Corridor B (Sonapur Ridge Bypass)",
                estimated_eta="4h 15m (vs 12h+ if stranded on NH-6)",
                recommended_action="Initiate inter-district transfer of 2,250 MT food grains & 4,200 kg emergency medical supplies via Sonapur Ridge Bypass before forecasted blockage.",
                responsible_department="Food, Civil Supplies & Disaster Management Authority (NER)",
                status="ACTIVE",
                confidence="HIGH",
                data_source="SIMULATION_DATA",
            ),
            OperationalAlert(
                alert_code="ALT-NER-0103",
                priority="HIGH",
                title="UPSTREAM FLOOD ADVISORY — BARAK VALLEY ACCESS",
                description="Continuous precipitation upstream increases flash flood probability on Lumding-Badarpur route sections.",
                location_district="Cachar (Silchar)",
                affected_corridor="NH-27 / Lumding Section",
                affected_resource="Potable Drinking Water & Water Purification Tablets",
                suggested_source_district="Kamrup Metro Central Depot",
                recommended_route="Multimodal Rail-Road Transit via Lumding Junction",
                estimated_eta="9h 40m",
                recommended_action="Pre-position water purification units and place emergency logistics response teams on standby.",
                responsible_department="State Disaster Response Force (SDRF) Logistics Wing",
                status="ACTIVE",
                confidence="MEDIUM",
                data_source="SIMULATION_DATA",
            ),
        ]
        db.add_all(alerts)

    await db.commit()

