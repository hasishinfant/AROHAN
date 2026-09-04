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
from app.models import User, Vehicle, Driver, Route, RoadSegment, Shipment
from app.config import ROUTE_A_COORDS, ROUTE_B_COORDS


async def seed_database(db: AsyncSession):
    """Idempotent seed — skips if data already exists."""

    # ── Check if already seeded ───────────────────────────────────────────────
    existing = await db.execute(select(User).limit(1))
    if existing.scalar_one_or_none():
        return  # Already seeded

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
    await db.commit()
