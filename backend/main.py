"""
ByzantineMind — FastAPI Application Entrypoint

Run with:
    uvicorn backend.main:app --reload --port 8000
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.api.websocket import ws_router

# ── Logging ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-30s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)

# ── FastAPI App ───────────────────────────────────────────────────
app = FastAPI(
    title="ByzantineMind",
    description="Byzantine Fault Tolerant AI Agent Consensus Engine with ArmorIQ Intent Assurance",
    version="1.0.0",
)

# ── CORS (allow Next.js frontend) ────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ─────────────────────────────────────────────────
app.include_router(router)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {
        "name": "ByzantineMind",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }
