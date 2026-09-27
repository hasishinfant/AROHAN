"""AROHAN Backend — FastAPI Application Entry Point."""

import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, AsyncSessionLocal
from app.data.seed_data import seed_database
from app.api.routes import router
from app.scenario.demo_scenario import get_current_state
from app.config import settings


# ── WebSocket Connection Manager ──────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        disconnected = []
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(data, default=str))
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.disconnect(ws)


manager = ConnectionManager()

import asyncio
import os
from fastapi import Request

# ── Safe Database Readiness for Serverless Cold Starts ───────────────────────

_db_ready = False
_db_lock = asyncio.Lock()


async def ensure_db_ready():
    global _db_ready
    if not _db_ready:
        async with _db_lock:
            if not _db_ready:
                await init_db()
                async with AsyncSessionLocal() as db:
                    await seed_database(db)
                _db_ready = True


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_db_ready()
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AROHAN — Adaptive Logistics Orchestration Network",
    description="SIH 2026 Prototype — NER Proactive Logistics Decision System",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    openapi_url="/openapi.json",
)

@app.middleware("http")
async def ensure_db_middleware(request: Request, call_next):
    # Ensure tables and seed data are ready on serverless cold starts
    await ensure_db_ready()
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount both with and without /api prefix so Vercel rewrites and direct calls resolve cleanly
app.include_router(router, prefix="/api")
app.include_router(router)


# ── WebSocket ─────────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial state on connect
    try:
        await websocket.send_text(json.dumps(get_current_state(), default=str))
    except Exception:
        pass

    try:
        while True:
            # Keep connection alive; state updates are pushed by scenario engine
            data = await websocket.receive_text()
            # Handle ping
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Broadcast helper (called by scenario engine) ──────────────────────────────

async def broadcast_state(state: dict):
    await manager.broadcast({"type": "STATE_UPDATE", **state})


# Attach broadcast to scenario so scenario can push updates
import app.scenario.demo_scenario as ds
ds._broadcast = broadcast_state


@app.get("/")
@app.get("/api")
async def root():
    return {
        "system": "AROHAN",
        "subtitle": "Adaptive Logistics Orchestration Network",
        "version": "1.0.0",
        "status": "operational",
        "environment": "vercel" if os.environ.get("VERCEL") else "standard",
        "docs": "/docs",
    }
