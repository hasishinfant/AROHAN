from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./arohan.db"
    SECRET_KEY: str = "arohan-sih-2026-demo-secret"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Proactive trigger thresholds (configurable, displayed in UI) ──
    DISRUPTION_PROB_THRESHOLD: float = 0.60
    HORIZON_HOURS_THRESHOLD: int = 24
    MISSION_SCORE_DELTA_THRESHOLD: float = 20.0
    MIN_CONFIDENCE_FOR_PROACTIVE: str = "MEDIUM"  # LOW | MEDIUM | HIGH

    # ── Risk model weights ──
    W_RAINFALL_INTENSITY: float = 0.30
    W_CUMULATIVE_RAIN: float = 0.25
    W_SLOPE: float = 0.20
    W_HISTORICAL: float = 0.15
    W_VULNERABILITY: float = 0.10

    # ── Mission score weights ──
    BASE_TIME_MULTIPLIER: float = 10.0
    DELAY_MULTIPLIER: float = 8.0
    URGENCY_RISK_MULTIPLIER: float = 15.0
    MAX_BLOCKAGE_DELAY_H: float = 12.0  # assumed delay if route is blocked

    class Config:
        env_file = ".env"


settings = Settings()

# ── Scenario corridor (Guwahati → Shillong) ──
CORRIDOR = {
    "origin": "Guwahati",
    "origin_lat": 26.1445,
    "origin_lon": 91.7362,
    "destination": "Shillong",
    "destination_lat": 25.5788,
    "destination_lon": 91.8933,
}

# ── Route definitions (geographically accurate for NER corridor) ──
ROUTE_A_COORDS = [
    [91.7362, 26.1445],  # Guwahati
    [91.7900, 26.0850],  # Khanapara
    [91.8550, 26.0400],  # Jorabat
    [91.9300, 25.9700],  # Byrnihat
    [91.9650, 25.8900],  # Umiam (RISK ZONE)
    [91.9550, 25.8200],  # Near dam
    [91.9200, 25.7400],  # Nongpoh approach
    [91.9000, 25.6700],  # Nongpoh
    [91.8933, 25.5788],  # Shillong
]

ROUTE_B_COORDS = [
    [91.7362, 26.1445],  # Guwahati
    [91.7650, 26.0600],  # Sonapur
    [91.8150, 25.9600],  # Ridge fork
    [91.8400, 25.8600],  # Higher ground
    [91.8600, 25.7700],  # Mawlai approach
    [91.8750, 25.6700],  # Upper Shillong road
    [91.8933, 25.5788],  # Shillong
]

DISRUPTION_ZONE_COORDS = [
    [91.9300, 25.8500],
    [91.9800, 25.8500],
    [91.9900, 25.9200],
    [91.9400, 25.9300],
    [91.9300, 25.8500],
]

# ── Demo scenario timing labels ──
SCENARIO_TIMELINE = [
    "09:00", "09:05", "09:06", "09:07",
    "09:08", "09:09", "09:15", "10:30", "10:32"
]
