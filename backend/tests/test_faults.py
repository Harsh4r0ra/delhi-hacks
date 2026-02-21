"""
Test suite for the fault injection system.

Covers:
- Byzantine fault: 1 malicious agent overruled by 3 honest agents
- Crash fault: 1 crashed agent, remaining 3 still form quorum
- Fault clear: agent restored to original behavior after clearing
- Demo scenarios end-to-end
"""

import pytest
from backend.agents.simulated_agent import SimulatedAgent
from backend.consensus.engine import ConsensusEngine
from backend.faults.injector import FaultInjector, FaultConfig, FaultType
from backend.faults.scenarios import (
    scenario_compromised_agent,
    scenario_crash_recovery,
    scenario_collusion_attempt,
)


@pytest.fixture
def agents():
    return [
        SimulatedAgent("agent_1"),
        SimulatedAgent("agent_2"),
        SimulatedAgent("agent_3"),
        SimulatedAgent("agent_4"),
    ]


@pytest.mark.asyncio
async def test_byzantine_fault_tolerated(agents):
    """1 Byzantine agent sends APPROVE for a CRITICAL request. 3 honest agents REJECT. Consensus = REJECT."""
    injector = FaultInjector()
    injector.inject(agents, "agent_2", FaultConfig(
        fault_type=FaultType.BYZANTINE,
        malicious_decision="APPROVE",
    ))

    engine = ConsensusEngine(agents)
    request = {"type": "EXECUTION", "operation": "DELETE", "risk": "CRITICAL"}
    result, cert, rnd = await engine.submit_request("test_byz_001", request)

    assert result is not None
    assert result["decision"] == "REJECT", "System should REJECT despite 1 malicious APPROVE"
    assert cert is not None
    assert cert.decision == "REJECT"

    injector.clear_all(agents)


@pytest.mark.asyncio
async def test_crash_fault_tolerated(agents):
    """1 agent crashes. Remaining 3 >= 2f+1=3, so consensus still works."""
    injector = FaultInjector()
    injector.inject(agents, "agent_3", FaultConfig(fault_type=FaultType.CRASH))

    engine = ConsensusEngine(agents)
    request = {"type": "HEALTHCHECK", "operation": "PING", "risk": "LOW"}
    result, cert, rnd = await engine.submit_request("test_crash_001", request)

    assert result is not None, "Consensus should still be reached with 3 agents"
    assert result["decision"] == "APPROVE"
    assert "agent_3" in rnd.agent_errors, "Crashed agent should be in errors"
    assert len(rnd.agent_results) == 3, "Only 3 agents should have responded"

    injector.clear_all(agents)


@pytest.mark.asyncio
async def test_fault_clear_restores_agent(agents):
    """After clearing a fault, the agent should behave normally again."""
    injector = FaultInjector()
    injector.inject(agents, "agent_1", FaultConfig(
        fault_type=FaultType.BYZANTINE,
        malicious_decision="APPROVE",
    ))

    assert injector.get_active_faults() == {"agent_1": "BYZANTINE"}

    injector.clear(agents, "agent_1")

    assert injector.get_active_faults() == {}

    # Agent should now behave normally
    engine = ConsensusEngine(agents)
    request = {"type": "EXECUTION", "operation": "DELETE", "risk": "CRITICAL"}
    result, cert, rnd = await engine.submit_request("test_clear_001", request)

    # All 4 agents should REJECT a CRITICAL request
    assert all(r.get("decision") == "REJECT" for r in rnd.agent_results.values())


@pytest.mark.asyncio
async def test_scenario_compromised_agent(agents):
    """End-to-end demo scenario: compromised agent."""
    report = await scenario_compromised_agent(agents)
    assert report["system_safe"] is True
    assert report["consensus_decision"] == "REJECT"


@pytest.mark.asyncio
async def test_scenario_crash_recovery(agents):
    """End-to-end demo scenario: crash recovery."""
    report = await scenario_crash_recovery(agents)
    assert report["consensus_reached"] is True
    assert report["consensus_decision"] is not None
