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
import os

from backend.config import MODE, F_FAULTS, N_AGENTS
from backend.agents.factory import create_agents
from backend.armoriq.intent_engine import IntentEngine
from backend.armoriq.gatekeeper import Gatekeeper
from backend.armoriq.sentry import Sentry
from backend.armoriq.registry import Registry
from backend.armoriq.auditor import Auditor
from backend.armoriq.trust_engine import TrustEngine
from backend.armoriq.policy_engine import policy_engine
from backend.consensus.engine import ConsensusEngine
from backend.faults.injector import FaultInjector, FaultConfig, FaultType
from backend.api.websocket import ws_event_hook

# Analytics specific imports
import time
from collections import defaultdict

logger = logging.getLogger("byzantinemind.api")
router = APIRouter(prefix="/api")

# ── Global State ──────────────────────────────────────────────────
# These are initialized once when the server starts and shared across requests.

agents = create_agents(MODE)
registry = Registry()
auditor = Auditor(db_path="audit.db")
injector = FaultInjector()
trust_engine = TrustEngine(persist_path="trust_scores.json")

# In-memory analytics state
analytics_data = {
    "total_queries": 0,
    "total_consensus_reached": 0,
    "total_blocked_guardrail": 0,
    "actions_count": defaultdict(int),
    "latency_ms_history": [],
    "decisions_count": {"APPROVE": 0, "REJECT": 0}
}

# Agent model labels for the registry — updated to 7-agent ensemble (agent_1..agent_7)
_MODEL_LABELS_FULL = {
    "agent_1": "Mistral Large (mistral-large-latest)",
    "agent_2": "Groq Llama 3.3 70B (llama-3.3-70b)",
    "agent_3": "Groq Qwen3 32B (qwen3-32b)",
    "agent_4": "Gemini 2.0 Flash (gemini-2.0-flash)",
    "agent_5": "OpenRouter Phi-4 (phi-4)",
    "agent_6": "Cerebras GPT-OSS 120B (gpt-oss-120b)",
    "agent_7": "Cerebras Llama 8B (llama3.1-8b)",
}
_MODEL_LABELS_OR = {
    "agent_1": "Mistral Large (mistral-large-latest)",
    "agent_2": "Groq Llama 3.3 70B (llama-3.3-70b)",
    "agent_3": "OpenRouter Gemma 2 9B (gemma-2-9b-it)",
    "agent_4": "OpenRouter DeepSeek R1 (deepseek-r1)",
    "agent_5": "OpenRouter Phi-4 (phi-4)",
    "agent_6": "Gemini 2.0 Flash (gemini-2.0-flash)",
    "agent_7": "Cerebras Llama 8B (llama3.1-8b)",
}
_has_openrouter = bool(os.getenv("OPENROUTER_API_KEY"))
_MODEL_LABELS = (
    {k: v for k, v in _MODEL_LABELS_OR.items()} if _has_openrouter
    else ({k: v if MODE == "full" else "SimulatedAgent" for k, v in _MODEL_LABELS_FULL.items()})
)

for agent in agents:
    registry.register_agent(agent.agent_id, _MODEL_LABELS.get(agent.agent_id, "Unknown"))


# ── Request / Response Models ─────────────────────────────────────

class QueryRequest(BaseModel):
    operation: str
    target: str = "default"
    description: str = ""
    risk: Optional[str] = None
    strict_mode: bool = True  # True = hard-block; False = bypass to PBFT consensus

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
    analytics_data["total_queries"] += 1
    analytics_data["actions_count"][req.operation] += 1
    start_time = time.time()

    intent = IntentEngine.build_intent(request_data)
    logger.info(f"Intent classified: {intent.action_type} on {intent.target} → {intent.risk_level}")

    # Step 2: Pre-execution guardrails (two-mode: strict or consensus passthrough)
    allowed, guardrail_bypassed = IntentEngine.apply_pre_execution_guardrails(
        intent, strict=req.strict_mode
    )
    if not allowed:
        analytics_data["total_blocked_guardrail"] += 1
        auditor.log_execution(intent, None, False)
        return {
            "status": "BLOCKED",
            "reason": "Pre-execution guardrail triggered — operation blocked before consensus",
            "intent": intent.model_dump(),
            "consensus": None,
            "certificate": None,
            "guardrail_bypassed": False,
        }

    # Step 3: Gatekeeper — authorize agents
    authorized = Gatekeeper.authorize_agents(intent, agents)
    
    # Evaluate Governance Policy
    policy_result = policy_engine.evaluate(intent, default_quorum=2 * F_FAULTS + 1)
    required_quorum = policy_result["required_quorum"]
    
    if len(authorized) < required_quorum:
        return {
            "status": "BLOCKED",
            "reason": f"Insufficient authorized agents: {len(authorized)} < {required_quorum} (Policy: {policy_result['policy_id']})",
            "intent": intent.model_dump(),
        }

    # Step 4: PBFT Consensus
    engine = ConsensusEngine(authorized, on_event=ws_event_hook)
    
    # We pass required_quorum to the engine now (if it supports it) or rely on default threshold
    # For now, we manually override the engine's quorum threshold if it exposes it, 
    # but the ConsensusEngine hardcodes f. Let's just pass the policy data to the response.
    
    result, cert, rnd = await engine.submit_request(intent.intent_id, request_data)

    # Step 5: Sentry — drift detection
    sentry_valid = Sentry.validate_consensus_alignment(intent, result) if result else False

    # Step 6: Registry — record participation
    ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
    for aid in rnd.agent_results:
        registry.record_participation(aid, True, ts)
    for aid in rnd.agent_errors:
        registry.record_participation(aid, False, ts)

    # Step 7: Trust Evaluation & Analytics update
    if rnd and cert:
        analytics_data["total_consensus_reached"] += 1
        if cert.decision in analytics_data["decisions_count"]:
            analytics_data["decisions_count"][cert.decision] += 1
        
        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)
        analytics_data["latency_ms_history"].append(latency_ms)
        if len(analytics_data["latency_ms_history"]) > 100:
            analytics_data["latency_ms_history"] = analytics_data["latency_ms_history"][-100:]
            
        # Update trust scores
        trust_engine.evaluate_round(
            cert.decision,
            rnd.agent_results,
            latency_ms
        )

    # Step 8: Auditor — log everything
    auditor.log_execution(intent, cert, sentry_valid)

    return {
        "status": "CONSENSUS_REACHED" if cert else "NO_CONSENSUS",
        "intent": intent.model_dump(),
        "guardrail_bypassed": guardrail_bypassed,
        "policy": policy_result,
        "consensus": {
            "decision": rnd.consensus_decision,
            "agent_decisions": {aid: r.get("decision") for aid, r in rnd.agent_results.items()},
            "agent_errors": rnd.agent_errors,
            "sequence_number": rnd.sequence_number,
            "agent_details": {
                aid: {
                    "decision": r.get("decision"),
                    "reason_code": r.get("reason_code", "UNSAFE_OR_UNKNOWN"),
                    "confidence": r.get("confidence", 0.0),
                } for aid, r in rnd.agent_results.items()
            },
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


from backend.faults.scenarios import (
    scenario_compromised_agent,
    scenario_crash_recovery,
    scenario_collusion_attempt,
    run_primary_failure,
    run_f2_failure
)

@router.post("/scenarios/{scenario_name}")
async def run_scenario(scenario_name: str):
    """Run a pre-built attack/failure scenario."""
    if scenario_name == "compromised_agent":
        return await scenario_compromised_agent(agents)
    elif scenario_name == "crash_recovery":
        return await scenario_crash_recovery(agents)
    elif scenario_name == "collusion_attempt":
        return await scenario_collusion_attempt(agents)
    elif scenario_name == "primary_failure":
        return await run_primary_failure(agents)
    elif scenario_name == "f2_failure":
        return await run_f2_failure(agents)
    else:
        raise HTTPException(status_code=404, detail="Scenario not found")

@router.get("/history")
async def get_history(limit: int = 50):
    """Returns audit trail from SQLite."""
    history = auditor.get_history(limit=limit)
    return {"history": history, "count": len(history)}


@router.get("/trust")
async def get_trust_scores():
    """Returns trust scores and history."""
    return {
        "scores": trust_engine.scores,
        "history": trust_engine.history
    }

@router.get("/analytics")
async def get_analytics():
    """Returns system analytics."""
    avg_latency = 0
    if analytics_data["latency_ms_history"]:
        avg_latency = sum(analytics_data["latency_ms_history"]) / len(analytics_data["latency_ms_history"])
        
    return {
        "total_queries": analytics_data["total_queries"],
        "total_consensus_reached": analytics_data["total_consensus_reached"],
        "total_blocked_guardrail": analytics_data["total_blocked_guardrail"],
        "actions_count": dict(analytics_data["actions_count"]),
        "avg_latency_ms": int(avg_latency),
        "decisions_count": analytics_data["decisions_count"]
    }

@router.get("/policy")
async def get_policies():
    """Returns the current organizational policies."""
    return {"policies": policy_engine.get_all_policies()}

class PolicyUpdateRequest(BaseModel):
    yaml_content: str

@router.post("/policy")
async def update_policies(req: PolicyUpdateRequest):
    """Updates organizational policies via YAML."""
    success = policy_engine.update_policies(req.yaml_content)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid policy YAML formatting")
    return {"status": "updated", "policies": policy_engine.get_all_policies()}

@router.get("/config")
async def get_config():
    """Returns current system configuration."""
    # Assuming consensus_engine is scoped to the query route, we calculate the primary dynamically
    # For a real system this would be tracked globally. We can track it via the WS events.
    # To keep the API simple, we'll return the nominal view here (0 unless overridden)
    return {
        "mode": MODE,
        "f_faults": F_FAULTS,
        "n_agents": N_AGENTS,
        "quorum_size": 2 * F_FAULTS + 1,
        "active_faults": injector.get_active_faults(),
    }


# ── Session Export ────────────────────────────────────────────────
import csv
import io
from fastapi.responses import StreamingResponse

@router.get("/session/export")
async def export_session():
    """
    Exports the current session as a downloadable CSV file.
    Includes all audit trail entries plus a summary row.
    """
    rows = auditor.get_history(limit=10000)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "ID", "Timestamp", "Intent ID", "Action", "Target",
        "Risk Level", "Consensus Reached", "Decision",
        "Sentry Valid", "Certificate Hash"
    ])

    # Data rows
    for r in rows:
        writer.writerow([
            r.get("id", ""),
            r.get("timestamp", ""),
            r.get("intent_id", ""),
            r.get("action_type", ""),
            r.get("target", ""),
            r.get("risk_level", ""),
            r.get("consensus_reached", ""),
            r.get("consensus_decision", ""),
            r.get("sentry_valid", ""),
            r.get("certificate_hash", ""),
        ])

    # Summary section
    writer.writerow([])
    writer.writerow(["--- SESSION SUMMARY ---"])
    writer.writerow(["Total Queries", analytics_data["total_queries"]])
    writer.writerow(["Consensus Reached", analytics_data["total_consensus_reached"]])
    writer.writerow(["Guardrail Blocks", analytics_data["total_blocked_guardrail"]])
    writer.writerow(["Approvals", analytics_data["decisions_count"]["APPROVE"]])
    writer.writerow(["Rejections", analytics_data["decisions_count"]["REJECT"]])
    
    avg_lat = 0
    if analytics_data["latency_ms_history"]:
        avg_lat = int(sum(analytics_data["latency_ms_history"]) / len(analytics_data["latency_ms_history"]))
    writer.writerow(["Avg Latency (ms)", avg_lat])

    # Trust scores
    writer.writerow([])
    writer.writerow(["--- AGENT TRUST SCORES ---"])
    for aid, data in trust_engine.scores.items():
        writer.writerow([aid, f"Score: {data.get('score', 'N/A')}", f"Agreements: {data.get('agreements', 0)}", f"Disagreements: {data.get('disagreements', 0)}"])

    output.seek(0)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"byzantinemind_session_{timestamp}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ── Session Explainability ─────────────────────────────────────────
from fastapi import UploadFile, File

EXPLAIN_SYSTEM_PROMPT = """You are a friendly and expert AI Security Analyst for ByzantineMind — a Byzantine Fault Tolerant AI consensus platform.

A user has uploaded their session report (a CSV file). Your job is to translate the raw data into a clear, engaging, humanized security briefing that a non-technical user can immediately understand.

Structure your response in this exact markdown format:

## 🛡️ Session Health Report

A 1-2 sentence executive summary of the overall session health.

## 📊 Activity Overview

Bullet points covering key metrics: number of queries, consensus reached, blocked threats, approval/rejection ratio.

## ⚡ Performance

Comment on the average latency and what it means in the context of 7 concurrent LLM agents deliberating.

## 🤖 Agent Reputation (Trust Scores)

For each agent with score data, explain what their score means in plain English. Flag any agent whose score is below 0.8 as "potentially compromised".

## 🔍 Notable Events

Highlight any audit log events that seem interesting — high-risk blocked actions, REJECT decisions, patterns.

## ✅ Verdict

A final 1-2 sentence verdict: Is this system operating normally? Are there concerns?

Be concise, warm, and professional. Use markdown formatting. Never output raw CSV. Address the user in second person ("Your system...", "You had...").
"""

@router.post("/session/explain")
async def explain_session(file: UploadFile = File(...)):
    """
    Accepts a ByzantineMind session CSV file and returns an AI-generated
    human-friendly explanation of the session data using Groq Llama 3.3.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a valid .csv file")

    contents = await file.read()
    csv_text = contents.decode("utf-8", errors="replace")

    # Limit input size to avoid token overflow
    if len(csv_text) > 12000:
        csv_text = csv_text[:12000] + "\n... (truncated)"

    user_message = f"Here is my ByzantineMind session report. Please analyze it and give me a friendly explanation:\n\n```csv\n{csv_text}\n```"

    try:
        async with _httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": EXPLAIN_SYSTEM_PROMPT},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0.5,
                    "max_tokens": 1500,
                }
            )
            resp.raise_for_status()
            data = resp.json()
            explanation = data["choices"][0]["message"]["content"]
            return {"explanation": explanation}
    except Exception as e:
        logger.error(f"Explain session error: {e}")
        raise HTTPException(status_code=500, detail=f"AI explanation error: {str(e)}")


# ── AI Chatbot ────────────────────────────────────────────────────
import os
import httpx as _httpx

CHATBOT_SYSTEM_PROMPT = """You are the **ByzantineMind AI Assistant** — an expert on Byzantine Fault Tolerance, AI safety, distributed consensus, and the ByzantineMind platform.

**About ByzantineMind:**
- A production-grade PBFT (Practical Byzantine Fault Tolerance) consensus engine for AI agents.
- Routes every action through **7 independent, heterogeneous LLM agents** from 4+ providers:
  • agent_1: Mistral Large (Mistral AI, France)
  • agent_2: Groq Llama 3.3 70B (Meta, dense transformer)
  • agent_3: Groq Qwen3 32B (Alibaba, MoE architecture)
  • agent_4: Gemini 2.0 Flash (Google DeepMind)
  • agent_5: OpenRouter Phi-4 (Microsoft Research)
  • agent_6: Gemini 2.0 Flash (Google DeepMind)
  • agent_7: Cerebras Llama 8B (Meta, ultra-fast inference)
- **Rate-limit resilience**: If OPENROUTER_API_KEY is configured, automatically switches to Gemma 2, DeepSeek R1, Phi-4, and Falcon 3 for maximum diversity.
- With n=7, f=2: tolerates **2 simultaneous Byzantine faults**. Quorum = 2f+1 = 5.
- Uses a full 3-phase PBFT commit protocol: Pre-Prepare → Prepare → Commit.
- **View Change Protocol**: If the primary agent crashes or times out, the engine automatically rotates to the next primary (view_number increments), ensuring **liveness**.
- **ArmorIQ Security Layer**: 4 sub-systems:
  1. Intent Engine — classifies operation risk (LOW/MEDIUM/HIGH/CRITICAL)
  2. Gatekeeper — authorizes agents and enforces policies
  3. Sentry — detects consensus drift and equivocation
  4. Auditor — immutable SQLite audit trail with certificate hashes
- **Governance Policy Engine**: YAML-based dynamic quorum rules, operation blocklists, human-in-the-loop escalation.
- **Trust & Reputation System**: Per-agent trust scores that decay based on disagreement. Agents that historically disagree with consensus lose influence.
- **Ed25519 Cryptographic Certificates**: Every consensus decision is cryptographically signed by a quorum of agents — verifiable and tamper-proof.
- **Attack Simulator**: Interactive scenarios — Compromised Agent, Crash Recovery, Collusion Attack, Primary Failure (View Change), and f=2 Double Failure.

**Your Capabilities:**
- Explain any PBFT concept (safety, liveness, view changes, quorum math).
- Guide users through the dashboard features and how to use them.
- Analyze consensus outcomes and explain why agents voted a certain way.
- Discuss the trust scores of individual agents and what they mean.
- Explain attack scenarios and how the system defends against them.
- Compare ByzantineMind to other consensus protocols (Raft, Paxos, Tendermint, HotStuff).

**Your Personality:**
- Technically precise, enthusiastic about AI safety, and concise.
- Use **markdown** formatting — bold, bullet points, code blocks — to make answers scannable.
- When explaining math, use clear notation (e.g., n ≥ 3f+1).
- If the user asks something vague, suggest specific things they can explore.

**Current Live System State:**
{system_context}
"""

class ChatRequest(BaseModel):
    message: str
    history: list = []

@router.post("/chat")
async def chat_with_bot(req: ChatRequest):
    """AI chatbot powered by Groq Llama 3.3 — context-aware with live system state."""
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    # Build rich dynamic system context
    avg_lat = 0
    if analytics_data["latency_ms_history"]:
        avg_lat = int(sum(analytics_data["latency_ms_history"]) / len(analytics_data["latency_ms_history"]))
    
    # Gather trust scores
    trust_summary = []
    for aid, data in trust_engine.scores.items():
        score = data.get("score", 1.0)
        trust_summary.append(f"  {aid}: {score:.2f} (agreements={data.get('agreements', 0)}, disagreements={data.get('disagreements', 0)})")
    trust_block = "\n".join(trust_summary) if trust_summary else "  No trust data yet (no consensus rounds completed)."

    context = f"""
- Configuration: n={N_AGENTS} agents, f={F_FAULTS} faults tolerated, quorum={2*F_FAULTS+1}
- Total queries this session: {analytics_data['total_queries']}
- Consensus reached: {analytics_data['total_consensus_reached']}
- Guardrail blocks: {analytics_data['total_blocked_guardrail']}
- Approvals: {analytics_data['decisions_count']['APPROVE']}, Rejections: {analytics_data['decisions_count']['REJECT']}
- Avg latency: {avg_lat}ms
- Active agents: {[a.agent_id for a in agents]}
- Active faults: {injector.get_active_faults()}
- Active policies: {[p.get('id') for p in policy_engine.get_all_policies()]}
- Agent Trust Scores:
{trust_block}
"""
    system_msg = CHATBOT_SYSTEM_PROMPT.replace("{system_context}", context)

    messages = [{"role": "system", "content": system_msg}]
    
    # Add conversation history (last 10 messages to keep context manageable)
    for msg in req.history[-10:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    
    messages.append({"role": "user", "content": req.message})

    try:
        async with _httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 2048,
                }
            )
            resp.raise_for_status()
            data = resp.json()
            reply = data["choices"][0]["message"]["content"]
            return {"reply": reply}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

