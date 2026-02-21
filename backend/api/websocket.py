"""
WebSocket manager for real-time PBFT consensus event streaming.

Broadcasts structured JSON events to all connected frontend clients:
- round_started, agent_response, phase_update, consensus_reached
"""

import asyncio
import json
import logging
from typing import List
from fastapi import WebSocket

logger = logging.getLogger("byzantinemind.ws")


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts events."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: dict):
        """Send a structured event to all connected clients."""
        message = json.dumps({"event": event_type, "data": data})
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


def ws_event_hook(event_type: str, data: dict):
    """
    Synchronous hook that schedules a broadcast on the running event loop.
    Passed as on_event callback to ConsensusEngine.
    """
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.broadcast(event_type, data))
    except RuntimeError:
        pass  # No event loop running (e.g. during tests)


# --- FastAPI WebSocket route ---

from fastapi import APIRouter

ws_router = APIRouter()


@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; client can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "pong"}))
    except Exception:
        manager.disconnect(websocket)
