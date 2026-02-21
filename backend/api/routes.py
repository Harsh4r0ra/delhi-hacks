"""
REST API routes for ByzantineMind.

Endpoints:
  POST /api/query          — submit a request for PBFT consensus
  GET  /api/agents         — list all agents and their status
  POST /api/faults/inject  — inject a fault on a specific agent
  POST /api/faults/clear   — clear a fault (or all faults)
  GET  /api/history        — retrieve audit trail from Auditor
  GET  /api/config         — current system configuration
"""

import logging
import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from backend.config import MODE, F_FAULTS, N_AGENTS
from backend.agents.simulated_agent import SimulatedAgent
from backend.armoriq.intent_engine import IntentEngine
from backend.armoriq.gatekeeper import Gatekeeper
from backend.armoriq.sentry import Sentry
from backend.armoriq.registry import Registry
from backend.armoriq.auditor import Auditor
from backend.consensus.engine import ConsensusEngine
from backend.faults.injector import FaultInjector, FaultConfig, FaultType
from backend.api.websocket import ws_event_hook

logger = logging.getLogger("byzantinemind.api")
router = APIRouter(prefix="/api")

# ── Global State ──────────────────────────────────────────────────
# These are initialized once when the server starts and shared across requests.

agents = [SimulatedAgent(f"agent_{i+1}") for i in range(N_AGENTS)]
registry = Registry()
auditor = Auditor(db_path="audit.db")
injector = FaultInjector()

for agent in agents:
    model_label = "SimulatedAgent" if MODE == "fast" else "HFAgent"
    registry.register_agent(agent.agent_id, model_label)


# ── Request / Response Models ─────────────────────────────────────

class QueryRequest(BaseModel):
    operation: str
    target: str = "default"
    description: str = ""
    risk: Optional[str] = None

class FaultInjectRequest(BaseModel):
    agent_id: str
    fault_type: str  # CRASH, OMISSION, TIMING, BYZANTINE, COLLUSION
    malicious_decision: str = "APPROVE"
    delay_seconds: float = 30.0

class FaultClearRequest(BaseModel):
    agent_id: Optional[str] = None  # None = clear all


# ── Routes ────────────────────────────────────────────────────────

@router.post("/query")
async def submit_query(req: QueryRequest):
    """
    Full ByzantineMind pipeline:
    Intent Classification → Guardrails → Gatekeeper → PBFT Consensus → Sentry → Audit
    """
    request_data = req.model_dump()

    # Step 1: Intent Engine — classify risk
    intent = IntentEngine.build_intent(request_data)
    logger.info(f"Intent classified: {intent.action_type} on {intent.target} → {intent.risk_level}")

    # Step 2: Pre-execution guardrails
    if not IntentEngine.apply_pre_execution_guardrails(intent):
        auditor.log_execution(intent, None, False)
        return {
            "status": "BLOCKED",
            "reason": "Pre-execution guardrail triggered",
            "intent": intent.model_dump(),
            "consensus": None,
            "certificate": None,
        }

    # Step 3: Gatekeeper — authorize agents
    authorized = Gatekeeper.authorize_agents(intent, agents)
    if len(authorized) < 2 * F_FAULTS + 1:
        return {
            "status": "BLOCKED",
            "reason": f"Insufficient authorized agents: {len(authorized)} < {2 * F_FAULTS + 1}",
            "intent": intent.model_dump(),
        }

    # Step 4: PBFT Consensus
    engine = ConsensusEngine(authorized, on_event=ws_event_hook)
    result, cert, rnd = await engine.submit_request(intent.intent_id, request_data)

    # Step 5: Sentry — drift detection
    sentry_valid = Sentry.validate_consensus_alignment(intent, result) if result else False

    # Step 6: Registry — record participation
    ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
    for aid in rnd.agent_results:
        registry.record_participation(aid, True, ts)
    for aid in rnd.agent_errors:
        registry.record_participation(aid, False, ts)

    # Step 7: Auditor — log everything
    auditor.log_execution(intent, cert, sentry_valid)

    return {
        "status": "CONSENSUS_REACHED" if cert else "NO_CONSENSUS",
        "intent": intent.model_dump(),
        "consensus": {
            "decision": rnd.consensus_decision,
            "agent_decisions": {aid: r.get("decision") for aid, r in rnd.agent_results.items()},
            "agent_errors": rnd.agent_errors,
            "sequence_number": rnd.sequence_number,
        } if rnd else None,
        "certificate": cert.to_dict() if cert else None,
        "sentry_valid": sentry_valid,
        "active_faults": injector.get_active_faults(),
    }


@router.get("/agents")
async def list_agents():
    """Returns all registered agents, their status, and any active faults."""
    catalog = registry.get_agent_catalog()
    active_faults = injector.get_active_faults()
    for entry in catalog:
        entry["fault"] = active_faults.get(entry["agent_id"], None)
    return {"agents": catalog, "mode": MODE, "f": F_FAULTS, "n": N_AGENTS}


@router.post("/faults/inject")
async def inject_fault(req: FaultInjectRequest):
    """Inject a fault on a specific agent for live demo."""
    try:
        ft = FaultType(req.fault_type.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown fault type: {req.fault_type}. Valid: {[e.value for e in FaultType]}")

    config = FaultConfig(
        fault_type=ft,
        malicious_decision=req.malicious_decision,
        delay_seconds=req.delay_seconds,
    )

    success = injector.inject(agents, req.agent_id, config)
    if not success:
        raise HTTPException(status_code=404, detail=f"Agent {req.agent_id} not found")

    registry.update_status(req.agent_id, f"FAULTY ({ft.value})")

    return {
        "status": "injected",
        "agent_id": req.agent_id,
        "fault_type": ft.value,
        "active_faults": injector.get_active_faults(),
    }


@router.post("/faults/clear")
async def clear_fault(req: FaultClearRequest):
    """Clear a fault from a specific agent, or clear all faults."""
    if req.agent_id:
        injector.clear(agents, req.agent_id)
        registry.update_status(req.agent_id, "ONLINE")
    else:
        injector.clear_all(agents)
        for agent in agents:
            registry.update_status(agent.agent_id, "ONLINE")

    return {
        "status": "cleared",
        "agent_id": req.agent_id or "ALL",
        "active_faults": injector.get_active_faults(),
    }


@router.get("/history")
async def get_history(limit: int = 50):
    """Returns audit trail from SQLite."""
    history = auditor.get_history(limit=limit)
    return {"history": history, "count": len(history)}


@router.get("/config")
async def get_config():
    """Returns current system configuration."""
    return {
        "mode": MODE,
        "f_faults": F_FAULTS,
        "n_agents": N_AGENTS,
        "quorum_size": 2 * F_FAULTS + 1,
        "active_faults": injector.get_active_faults(),
    }
