# Deploying AROHAN to Vercel

This repository is fully configured for **100% seamless full-stack deployment on Vercel**. Both the React + TypeScript frontend and the FastAPI backend run together within a single unified Vercel project.

---

## 🏗 Architecture Overview

| Component | Vercel Service | Path / Config |
| :--- | :--- | :--- |
| **Frontend** | Static SPA (Vite + React + TS) | Built from `frontend/` to `frontend/dist` |
| **Backend API** | Serverless Python Function | Handled via [api/index.py](file:///c:/Users/SRIRAM/Downloads/AROHAN-main/AROHAN-main/api/index.py) |
| **Routing** | Zero-Config Rewrites | Handled via [vercel.json](file:///c:/Users/SRIRAM/Downloads/AROHAN-main/AROHAN-main/vercel.json) |
| **Database** | Serverless SQLite or Postgres | Auto-configured (`/tmp/arohan.db` or managed PostgreSQL) |
| **Telemetry** | Adaptive Sync | WebSocket on local dev; adaptive polling on Vercel |

---

## 🚀 Quick Deployment Options

### Option 1: Import via Vercel Dashboard (Recommended)

1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. **Project Settings**:
   - **Framework Preset**: Vite (detected automatically).
   - **Root Directory**: `./` (Leave as repository root — do NOT select `frontend`).
   - **Build Command**: `cd frontend && npm install && npm run build` (or leave default, picked up from `vercel.json`).
   - **Output Directory**: `frontend/dist` (picked up from `vercel.json`).
5. Click **Deploy**.

---

### Option 2: Deploy using Vercel CLI

Install the Vercel CLI and deploy directly from your terminal:

```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy preview
vercel

# 4. Deploy to production
vercel --prod
```

---

## 🗄 Database Configuration

### 1. Zero-Config Mode (Default SQLite)
- **No external database required!**
- In Vercel's serverless environment, local project roots are read-only. AROHAN automatically detects Vercel (`VERCEL=1`) and routes the SQLite database to `/tmp/arohan.db`.
- On cold start, the database and demo reference seed data (vehicles, routes, NH-6 coordinates, telemetry parameters) are automatically seeded.

### 2. Production Managed Database (Vercel Postgres / Neon / Supabase)
For persistent, multi-instance storage across regions, connect a PostgreSQL database:
1. In your Vercel Project Dashboard, navigate to **Storage** → create a **Vercel Postgres** database (or copy connection string from Neon / Supabase).
2. Set the `DATABASE_URL` environment variable:
   ```env
   DATABASE_URL=postgresql+asyncpg://<username>:<password>@<host>/<database>
   ```
   *(Standard `postgres://` URLs are automatically converted to `postgresql+asyncpg://` for SQLAlchemy).*

---

## 📡 Live Telemetry & Real-Time Sync on Vercel

- **Local Development**: Connects directly to the backend WebSocket stream (`ws://localhost:8000/ws`).
- **Vercel Serverless**: Since serverless functions are ephemeral, the frontend automatically switches to **Adaptive Polling** against `/api/state` every 2.5–5 seconds. All scenario steps, GPS telemetry updates, driver reports, and AI decision replans work smoothly and in real time.
