"""
Test suite for the production-grade PBFT consensus engine.

Covers:
- 4 honest agents reaching APPROVE consensus
- 4 honest agents reaching REJECT consensus on dangerous request
- Certificate cryptographic verification
- Quorum math validation
"""

import pytest
import asyncio
from backend.agents.simulated_agent import SimulatedAgent
from backend.consensus.engine import ConsensusEngine


@pytest.fixture
def agents():
    """Returns 4 simulated agents for testing (n=4, f=1)."""
    return [
        SimulatedAgent("agent_1"),
        SimulatedAgent("agent_2"),
        SimulatedAgent("agent_3"),
        SimulatedAgent("agent_4"),
    ]


@pytest.mark.asyncio
async def test_approve_consensus(agents):
    """All 4 agents should APPROVE a safe LOW-risk request and produce a valid certificate."""
    engine = ConsensusEngine(agents)

    request = {"type": "HEALTHCHECK", "operation": "PING", "risk": "LOW"}
    result, cert, rnd = await engine.submit_request("action_001", request)

    assert result is not None, "Expected a consensus result for a safe request"
    assert cert is not None, "Expected a certificate for a successful consensus"
    assert result["decision"] == "APPROVE"
    assert cert.decision == "APPROVE"
    assert len(cert.prepare_quorum) >= 3, "Need at least 2f+1=3 prepare signatures"
    assert len(cert.commit_quorum) >= 3, "Need at least 2f+1=3 commit signatures"
    assert len(rnd.agent_results) == 4, "All 4 agents should have responded"
    assert len(rnd.agent_errors) == 0, "No agents should have errored"


@pytest.mark.asyncio
async def test_reject_consensus(agents):
    """All 4 agents should REJECT a CRITICAL-risk request and produce a certificate."""
    engine = ConsensusEngine(agents)

    request = {"type": "EXECUTION", "operation": "DELETE", "risk": "CRITICAL"}
    result, cert, rnd = await engine.submit_request("action_002", request)

    assert result is not None, "Expected a consensus result even for REJECT"
    assert cert is not None, "Expected a certificate even for REJECT consensus"
    assert result["decision"] == "REJECT"
    assert cert.decision == "REJECT"
    assert rnd.consensus_decision == "REJECT"


@pytest.mark.asyncio
async def test_certificate_verification(agents):
    """The certificate's Ed25519 signatures should be independently verifiable."""
    engine = ConsensusEngine(agents)

    request = {"type": "HEALTHCHECK", "operation": "PING", "risk": "LOW"}
    result, cert, rnd = await engine.submit_request("action_003", request)

    assert cert is not None

    # Build verify_key map from agents
    verify_keys = {agent.agent_id: agent.identity.verify_key for agent in agents}
    verification = cert.verify(verify_keys, f=1)

    assert verification["valid"], f"Certificate verification failed: {verification['errors']}"
    assert verification["valid_prepares"] >= 3
    assert verification["valid_commits"] >= 3


@pytest.mark.asyncio
async def test_insufficient_agents():
    """Engine should raise ValueError if not enough agents for f tolerance."""
    agents = [SimulatedAgent("agent_1"), SimulatedAgent("agent_2")]
    with pytest.raises(ValueError, match="Need at least"):
        ConsensusEngine(agents)


@pytest.mark.asyncio
async def test_consensus_round_audit_trail(agents):
    """The ConsensusRound object should contain complete audit data."""
    engine = ConsensusEngine(agents)

    request = {"type": "HEALTHCHECK", "operation": "PING", "risk": "LOW"}
    result, cert, rnd = await engine.submit_request("action_004", request)

    assert rnd.action_id == "action_004"
    assert rnd.sequence_number == 1
    assert rnd.view_number == 0
    assert rnd.request_hash is not None
    assert rnd.started_at is not None
    assert len(rnd.prepare_msgs) == 4
    assert len(rnd.commit_msgs) > 0
