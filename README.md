# AROHAN — North Eastern Region Logistics Risk Intelligence Platform

> **SIH 2026 Problem Statement SIH26002** | Aligned with **Ministry of Development of North Eastern Region (MDoNER)**, **PM GatiShakti National Master Plan**, and **Unified Logistics Interface Platform (ULIP)**.

---

## 🌟 Executive Overview

**AROHAN** is a specialized, institutional **Logistics Risk Intelligence & Proactive Rerouting MVP** designed specifically for high-vulnerability freight corridors across the 8 states of the **North Eastern Region (NER)** of India (*Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim*).

Mountainous terrain, severe monsoon cloudbursts, steep slope cuts, and single-arterial highway reliance (*e.g., NH-6, NH-27*) make logistics in Northeast India exceptionally fragile. AROHAN converts real-time IMD precipitation telemetry, OpenStreetMap road geometry, SRTM digital elevation slope models, and NASA FIRMS active satellite thermal anomalies into **proactive pre-disruption logistics decisions**.

---

## 🚀 Key System Features

### 1. GIS Map-First Command Center (`/command`)
- **Primary GIS Corridor Monitoring Display**: 520px high MapLibre GL JS map with smooth tile rendering.
- **Layer Controls & Map Themes**: Switch between `OSM Standard`, `Dark Alidade`, and `Voyager` map styles.
- **NASA FIRMS Satellite Integration**: Live active thermal anomaly detection WMS raster layers (Key: `7f7248d933188493e5e6e1d84e9fba97`).
- **Interactive Vehicle Popups**: Tabbed vehicle specs, cargo manifest, route geometry, driver contact, and live telemetry.

### 2. 6-Stage Closed-Loop Decision Pipeline
1. **01 SENSE**: Route-aware ingestion of IMD AWS precipitation radar, SRTM slope gradients, road incident logs, and vehicle telemetry.
2. **02 PREDICT**: Deterministic Risk Decision Engine evaluates 5 weighted inputs (*Intensity 30%, 24h Rain 25%, Slope 20%, Historical 15%, Vulnerability 10%*).
3. **03 ASSESS**: Multi-route mission loss evaluation comparing Route A (Primary NH-6) vs Route B (Sonapur Ridge Bypass).
4. **04 DECIDE**: Action Card #102 presented to logistics dispatchers when disruption probability > 60%.
5. **05 ACT**: Dispatcher approves reroute, pushing real-time advisory to Driver Console via WebSocket.
6. **06 VERIFY**: Driver field reports confirm ground blockages, updating road segment state and locking into Decision History audit trails.

### 3. Real-Time GPS Simulation Engine
- Smooth, finite distance-based movement engine using `requestAnimationFrame` + `performance.now()`.
- Interactive speed multipliers: `1×`, `5×`, `10×`, `20×`, `50×`, and `100×`.
- Dynamic distance-to-hazard tracking, ETA updates, and cardinal heading indicators.

### 4. Risk Intelligence & Reporting MVP (`/reports`)
- Comprehensive 9-section operational report:
  - Section 1: Current Route Conditions & Vehicle Telemetry
  - Section 2: Route-Aware Meteorological Forecast (IMD AWS Network)
  - Section 3: Rainfall Intensity & Accumulation Analytics
  - Section 4: Flood & Hydrometric Risk Source Registry
  - Section 5: Accidents & Road Incident Stream
  - Section 6: Active Hazards Monitor (*Separating Real API vs Simulation Data*)
  - Section 7: Risk Engine Feature Weights & Empirical "Why This Decision?" Reasoning
  - Section 8: Dynamic Rerouting Evaluation (Route A vs Route B Comparison)
  - Section 9: System Health & Provider Registry

### 5. Field Driver Console (`/driver`)
- Mobile-first interface for vehicle operators and drivers.
- Real-time route advisory notifications with one-tap acknowledgment.
- Low-friction ground blockage reporting to feed closed-loop verification.

---

## 🛠️ Data Sources & API Registries

| Data Module | Provider / Source | Status | Integration Details |
| :--- | :--- | :---: | :--- |
| **Weather** | India Meteorological Department (IMD) | **CONNECTED** | Live AWS Telemetry (Nongpoh Station, Ri-Bhoi District) |
| **Rainfall** | IMD Rain Gauge Network | **CONNECTED** | 38.0 mm/h intensity & 98.5 mm 24h accumulation |
| **Thermal Satellite** | NASA FIRMS (VIIRS / MODIS) | **CONNECTED** | Live thermal anomaly detection WMS raster layers |
| **Road Geometry** | OpenStreetMap (OSM) | **CONNECTED** | NH-6 Guwahati → Shillong highway geometry |
| **Elevation & Terrain** | Copernicus DEM 30m | **CONNECTED** | Peak Slope: 42° (Mean Elevation: 840m) |
| **Hydrometric Flood** | Central Water Commission (CWC) | **NOT CONFIGURED** | Real Data Integrity Enforced (Zero synthetic flood alerts) |
| **Vehicle GPS** | AROHAN Distance Engine | **SIMULATION** | Smooth 1×–100× distance-based simulation loop |

---

## 📁 Repository Structure

```
AROHAN/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints
│   │   ├── engines/         # Risk, Decision, Replan & Optimization Engines
│   │   ├── providers/       # IMD, OSM, DEM & Hazard data provider adapters
│   │   ├── scenario/        # Demo scenario state manager
│   │   ├── config.py        # Centralized settings & thresholds
│   │   ├── database.py      # Async SQLAlchemy database setup
│   │   ├── main.py          # FastAPI application entrypoint
│   │   ├── models.py        # Database ORM models
│   │   └── schemas.py       # Pydantic schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # MapView, TopBar, Sidebar, RiskGauge, ActionCard
│   │   ├── pages/           # LandingPage, CommandCenter, ReportPage, DriverInterface, etc.
│   │   ├── services/        # gpsSimulationService, nasaFirmsService
│   │   ├── stores/          # arohanStore (Zustand state store)
│   │   └── styles/          # Institutional CSS variables & design system
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**: Installed and configured

### 1. Clone Repository
```bash
git clone https://github.com/hasishinfant/AROHAN.git
cd AROHAN
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
The backend API server will start at `http://127.0.0.1:8000`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd AROHAN/frontend
npm install
npm run dev
```
The frontend Vite server will launch at `http://localhost:5173`.

---

## ⚙️ Tech Stack & Technologies

- **Frontend**: React 18, TypeScript, Vite, MapLibre GL JS, Zustand, Lucide Icons, React Router v6, CSS Modules.
- **Backend**: Python FastAPI, SQLAlchemy (AsyncIO), Pydantic v2, Uvicorn, SQLite.
- **Geospatial & Mapping**: OpenStreetMap Carto Tiles, Carto Voyager, NASA FIRMS WMS, Turf.js.

---

## 📜 Governance & Alignment

- **MDoNER Aligned**: Tailored for logistics resilience across Northeast India's hill states.
- **PM GatiShakti**: Supports multi-modal infrastructure data integration and corridor planning.
- **Human-in-the-Loop**: Operational decision authority stays strictly with authorized dispatchers.

---

## 📄 License & Attribution

Built for **SIH 2026**. All geospatial tile data credited to OpenStreetMap & CartoDB. Thermal satellite imagery provided courtesy of NASA FIRMS / LANCE. Meteorological telemetry modeled from IMD Public AWS Archives.
