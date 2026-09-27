"""
AROHAN — Adaptive Logistics Orchestration Network
Vercel Serverless Function Entry Point

Exposes the FastAPI application as an ASGI entrypoint for Vercel's Python runtime.
"""
import sys
import os

# Ensure backend root and project root are in sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.abspath(os.path.join(_current_dir, ".."))
_backend_dir = os.path.join(_root_dir, "backend")

for _p in (_backend_dir, _root_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Mark environment as Vercel if running serverless
os.environ.setdefault("VERCEL", "1")

from app.main import app

# Vercel looks for the ASGI `app` callable in this module
__all__ = ["app"]
