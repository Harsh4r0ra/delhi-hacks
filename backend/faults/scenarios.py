"""
Pre-built demo scenarios for live fault tolerance demonstration.

Each scenario:
1. Sets up a specific fault condition
2. Runs a consensus round
3. Returns structured results showing system behavior under attack
"""

import asyncio
import logging
from typing import List, Dict, Any

from backend.agents.base import BaseAgent
from backend.consensus.engine import ConsensusEngine
from backend.faults.injector import FaultInjector, FaultConfig, FaultType

logger = logging.getLogger("byzantinemind.demo")


async def scenario_compromised_agent(
    agents: List[BaseAgent], target_agent_id: str = "agent_2"
) -> Dict[str, Any]:
    """
    Scenario: 1 agent is compromised and sends a malicious APPROVE for a dangerous request.
    Expected: Other 3 agents REJECT, consensus is REJECT, system is safe.
    """
    injector = FaultInjector()

    # Inject Byzantine fault: agent sends APPROVE for everything
    injector.inject(agents, target_agent_id, FaultConfig(
        fault_type=FaultType.BYZANTINE,
        malicious_decision="APPROVE",
    ))

    engine = ConsensusEngine(agents)
    request = {
        "type": "EXECUTION",
        "operation": "DELETE_ALL_DATA",
        "target": "production_database",
        "risk": "CRITICAL",
    }

    result, cert, rnd = await engine.submit_request("demo-compromised-001", request)

    # Clean up
    injector.clear_all(agents)

    return {
        "scenario": "compromised_agent",
        "compromised_agent": target_agent_id,
        "fault_type": "BYZANTINE",
        "agent_decisions": {aid: r.get("decision") for aid, r in rnd.agent_results.items()},
        "agent_errors": rnd.agent_errors,
        "consensus_decision": rnd.consensus_decision,
        "system_safe": rnd.consensus_decision == "REJECT",
        "certificate": cert.to_dict() if cert else None,
        "explanation": (
            f"Agent {target_agent_id} was compromised and voted APPROVE for a dangerous DELETE. "
            f"The remaining 3 honest agents voted REJECT. "
            f"BFT consensus (2f+1=3 required) reached REJECT. System remained safe."
        ),
    }


async def scenario_crash_recovery(
    agents: List[BaseAgent], target_agent_id: str = "agent_3"
) -> Dict[str, Any]:
    """
    Scenario: 1 agent crashes mid-consensus (process dies).
    Expected: Remaining 3 agents still reach consensus (3 >= 2f+1=3).
    """
    injector = FaultInjector()

    injector.inject(agents, target_agent_id, FaultConfig(
        fault_type=FaultType.CRASH,
    ))

    engine = ConsensusEngine(agents)
    request = {
        "type": "HEALTHCHECK",
        "operation": "PING",
        "target": "internal_service",
        "risk": "LOW",
    }

    result, cert, rnd = await engine.submit_request("demo-crash-001", request)

    injector.clear_all(agents)

    return {
        "scenario": "crash_recovery",
        "crashed_agent": target_agent_id,
        "fault_type": "CRASH",
        "responding_agents": list(rnd.agent_results.keys()),
        "crashed_agents": list(rnd.agent_errors.keys()),
        "consensus_decision": rnd.consensus_decision,
        "consensus_reached": cert is not None,
        "certificate": cert.to_dict() if cert else None,
        "explanation": (
            f"Agent {target_agent_id} crashed during consensus. "
            f"The remaining {len(rnd.agent_results)} agents still formed a quorum (>= 2f+1=3). "
            f"Consensus reached: {rnd.consensus_decision}. System continued operating."
        ),
    }


async def scenario_collusion_attempt(
    agents: List[BaseAgent],
    colluding_agents: List[str] = None
) -> Dict[str, Any]:
    """
    Scenario: 2 agents collude to send identical malicious APPROVE.
    Expected: With n=4, f=1, 2 colluders EXCEEDS fault tolerance.
              This demonstrates the mathematical LIMIT of BFT.
    """
    colluding_agents = colluding_agents or ["agent_2", "agent_4"]
    injector = FaultInjector()

    for aid in colluding_agents:
        injector.inject(agents, aid, FaultConfig(
            fault_type=FaultType.COLLUSION,
            malicious_decision="APPROVE",
            collusion_group="evil_coalition",
        ))

    engine = ConsensusEngine(agents)
    request = {
        "type": "EXECUTION",
        "operation": "TRANSFER_FUNDS",
        "target": "attacker_wallet",
        "risk": "CRITICAL",
    }

    result, cert, rnd = await engine.submit_request("demo-collusion-001", request)

    injector.clear_all(agents)

    # With f=1, 2 colluders means we've exceeded tolerance
    honest_count = len([
        r for aid, r in rnd.agent_results.items()
        if aid not in colluding_agents and r.get("decision") == "REJECT"
    ])

    return {
        "scenario": "collusion_attempt",
        "colluding_agents": colluding_agents,
        "fault_type": "COLLUSION",
        "agent_decisions": {aid: r.get("decision") for aid, r in rnd.agent_results.items()},
        "consensus_decision": rnd.consensus_decision,
        "honest_agents_count": honest_count,
        "tolerance_exceeded": len(colluding_agents) > 1,  # f=1
        "explanation": (
            f"Agents {colluding_agents} colluded to APPROVE a malicious TRANSFER_FUNDS. "
            f"With n=4 and f=1, BFT tolerates at most 1 fault. "
            f"2 colluders exceed the mathematical limit. "
            f"This demonstrates WHY n=3f+1 matters. To tolerate 2 faults, you need n=7 agents."
        ),
    }

async def run_primary_failure(agents: List[BaseAgent]) -> Dict[str, Any]:
    """
    Simulates the Primary Agent crashing or timing out, forcing a View Change.
    """
    # The primary for view 0 is agents[0], which is 'agent_1' (1-indexed)
    target_primary = "agent_1"
    injector = FaultInjector()
    
    logger.info(f"Injecting CRASH fault on primary {target_primary}")
    injector.inject(agents, target_primary, FaultConfig(
        fault_type=FaultType.CRASH,
        delay_seconds=10.0, # simulates timeout
    ))

    engine = ConsensusEngine(agents)
    request = {
        "type": "EXECUTION",
        "operation": "PING",
        "target": "system",
        "risk": "LOW",
    }

    # The engine will attempt view 0, timeout on agent 1, and trigger a view change
    result, cert, rnd = await engine.submit_request("demo-view-change", request)

    injector.clear(agents, target_primary)

    return {
        "scenario": "primary_failure",
        "primary_agent": target_primary,
        "fault_type": "CRASH",
        "new_view": engine.view_number,
        "new_primary": agents[engine.view_number % len(agents)].agent_id,
        "consensus_decision": rnd.consensus_decision,
        "explanation": (
            f"The primary agent '{target_primary}' crashed and failed to respond. "
            f"The ConsensusEngine detected the timeout, executed a VIEW CHANGE to view {engine.view_number}, "
            f"elected '{agents[engine.view_number % len(agents)].agent_id}' as the new primary, and successfully reached consensus. "
            f"This demonstrates PBFT Liveness."
        ),
    }


async def run_f2_failure(agents: List[BaseAgent]) -> Dict[str, Any]:
    """
    Simulates TWO agents failing simultaneously — the maximum BFT threshold with f=2 (n=7).
    The system must still reach consensus with the remaining 5 agents (quorum = 2f+1 = 5).
    """
    # Crash 2 agents: agent_1 (Mistral) and agent_2 (Groq Llama)
    targets = ["agent_1", "agent_2"]
    injector = FaultInjector()

    for t in targets:
        logger.info(f"Injecting CRASH fault on {t}")
        injector.inject(agents, t, FaultConfig(fault_type=FaultType.CRASH))

    engine = ConsensusEngine(agents)
    request = {
        "type": "EXECUTION",
        "operation": "DATA_READ",
        "target": "secure_database",
        "risk": "MEDIUM",
    }

    result, cert, rnd = await engine.submit_request("demo-f2-failure", request)

    for t in targets:
        injector.clear(agents, t)

    surviving_count = len(rnd.agent_results)
    return {
        "scenario": "f2_double_failure",
        "crashed_agents": targets,
        "fault_type": "CRASH",
        "surviving_agents": surviving_count,
        "consensus_decision": rnd.consensus_decision,
        "certificate_generated": cert is not None,
        "explanation": (
            f"Two agents ({', '.join(targets)}) crashed simultaneously. "
            f"With n=7 and f=2, BFT guarantees are only valid up to 2 failures. "
            f"The remaining {surviving_count} agents still formed a quorum of 5/7 (2f+1) "
            f"and reached consensus: '{rnd.consensus_decision}'. "
            f"This demonstrates the mathematical guarantee of n ≥ 3f+1."
        ),
    }
