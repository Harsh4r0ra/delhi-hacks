"""
ConsensusEngine — orchestrates the full 3-phase PBFT protocol across an agent ensemble.

Production design:
- Handles both APPROVE and REJECT consensus (majority decision wins)
- Returns a cryptographic certificate for ANY consensus outcome
- Gracefully handles agent failures without crashing the round
- Event hooks for real-time WebSocket streaming
- Structured logging for every phase transition
"""

import asyncio
import logging
import datetime
from typing import List, Dict, Any, Tuple, Optional, Callable
from collections import Counter

from backend.consensus.pbft_node import PBFTNode
from backend.consensus.messages import PrePrepare, Prepare, Commit
from backend.crypto.certificate import ConsensusCertificate
from backend.agents.base import BaseAgent
from backend.utils import canonical_json, sha256
from backend.config import F_FAULTS, CONSENSUS_TIMEOUT_SEC

logger = logging.getLogger("byzantinemind.consensus")


class ConsensusRound:
    """Encapsulates the full state of a single consensus round for auditability."""

    def __init__(self, action_id: str, sequence_number: int, view_number: int, request: Dict[str, Any]):
        self.action_id = action_id
        self.sequence_number = sequence_number
        self.view_number = view_number
        self.request = request
        self.request_hash = sha256(canonical_json(request))
        self.started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.agent_results: Dict[str, Dict[str, Any]] = {}
        self.agent_errors: Dict[str, str] = {}
        self.prepare_msgs: List[Prepare] = []
        self.commit_msgs: List[Commit] = []
        self.consensus_decision: Optional[str] = None
        self.certificate: Optional[ConsensusCertificate] = None


class ConsensusEngine:
    def __init__(self, agents: List[BaseAgent], on_event: Optional[Callable] = None):
        self.agents = agents
        self.f = F_FAULTS
        self.n = len(agents)
        self.quorum_size = 2 * self.f + 1

        if self.n < 3 * self.f + 1:
            raise ValueError(f"Need at least {3 * self.f + 1} agents for f={self.f}, got {self.n}")

        self.nodes: Dict[str, PBFTNode] = {
            agent.agent_id: PBFTNode(agent.agent_id, agent.identity, self.f)
            for agent in agents
        }
        self.sequence_number = 0
        self.view_number = 0
        self.on_event = on_event or (lambda *a, **k: None)

    def _emit(self, event_type: str, data: Dict[str, Any]):
        """Emit event for WebSocket streaming."""
        try:
            self.on_event(event_type, data)
        except Exception:
            pass

    async def submit_request(
        self, action_id: str, request: Dict[str, Any]
    ) -> Tuple[Optional[Dict[str, Any]], Optional[ConsensusCertificate], ConsensusRound]:
        """
        Drives the full 3-phase PBFT consensus protocol.

        Returns:
            (consensus_result, certificate, round_data)
            - consensus_result: The agreed-upon decision dict, or None if no quorum
            - certificate: Cryptographic proof of consensus, or None
            - round_data: Full audit trail of the round
        """
        self.sequence_number += 1
        seq = self.sequence_number
        view = self.view_number

        rnd = ConsensusRound(action_id, seq, view, request)
        logger.info(f"[Round {seq}] Starting consensus for action={action_id}")
        self._emit("round_started", {"action_id": action_id, "sequence": seq})

        primary_agent = self.agents[view % self.n]

        # ── PHASE 0: AGENT EXECUTION ──────────────────────────────────
        logger.info(f"[Round {seq}] Phase 0: Querying {self.n} agents...")
        self._emit("phase_update", {"phase": "AGENT_EXECUTION", "sequence": seq})

        agent_tasks = [
            asyncio.wait_for(agent.decide_async(action_id, request), timeout=CONSENSUS_TIMEOUT_SEC)
            for agent in self.agents
        ]
        results = await asyncio.gather(*agent_tasks, return_exceptions=True)

        for idx, result in enumerate(results):
            agent = self.agents[idx]
            if isinstance(result, asyncio.TimeoutError):
                rnd.agent_errors[agent.agent_id] = "TIMEOUT"
                logger.warning(f"[Round {seq}] Agent {agent.agent_id} timed out")
                self._emit("agent_response", {"agent_id": agent.agent_id, "status": "TIMEOUT"})
            elif isinstance(result, Exception):
                rnd.agent_errors[agent.agent_id] = str(result)
                logger.error(f"[Round {seq}] Agent {agent.agent_id} failed: {result}")
                self._emit("agent_response", {"agent_id": agent.agent_id, "status": "ERROR", "error": str(result)})
            else:
                rnd.agent_results[agent.agent_id] = result
                logger.info(f"[Round {seq}] Agent {agent.agent_id} decided: {result.get('decision')}")
                self._emit("agent_response", {"agent_id": agent.agent_id, "status": "OK", "decision": result.get("decision")})

        if len(rnd.agent_results) < self.quorum_size:
            logger.error(f"[Round {seq}] Not enough agent responses: {len(rnd.agent_results)} < {self.quorum_size}")
            return None, None, rnd

        # ── DETERMINE MAJORITY DECISION ───────────────────────────────
        decisions = [r.get("decision") for r in rnd.agent_results.values()]
        decision_counts = Counter(decisions)
        majority_decision, majority_count = decision_counts.most_common(1)[0]

        if majority_count < self.quorum_size:
            logger.warning(f"[Round {seq}] No quorum on any decision: {dict(decision_counts)}")
            return None, None, rnd

        rnd.consensus_decision = majority_decision
        logger.info(f"[Round {seq}] Majority decision: {majority_decision} ({majority_count}/{self.n})")

        # Pick a canonical result from the majority
        majority_result = next(
            r for r in rnd.agent_results.values() if r.get("decision") == majority_decision
        )

        # ── PHASE 1: PRE-PREPARE ──────────────────────────────────────
        logger.info(f"[Round {seq}] Phase 1: Pre-Prepare from primary={primary_agent.agent_id}")
        self._emit("phase_update", {"phase": "PRE_PREPARE", "primary": primary_agent.agent_id})

        pre_prepare = PrePrepare(
            agent_id=primary_agent.agent_id,
            view_number=view,
            sequence_number=seq,
            request_hash=rnd.request_hash,
            request=request,
        )
        payload = canonical_json(pre_prepare.model_dump(exclude={"signature"}))
        pre_prepare.signature = primary_agent.identity.sign(payload)

        # ── PHASE 2: PREPARE ──────────────────────────────────────────
        logger.info(f"[Round {seq}] Phase 2: Prepare broadcast")
        self._emit("phase_update", {"phase": "PREPARE"})

        for agent_id, node in self.nodes.items():
            prep = node.on_pre_prepare(pre_prepare)
            if prep:
                rnd.prepare_msgs.append(prep)

        # ── PHASE 3: COMMIT ───────────────────────────────────────────
        logger.info(f"[Round {seq}] Phase 3: Commit broadcast")
        self._emit("phase_update", {"phase": "COMMIT"})

        committed = False
        for prep in rnd.prepare_msgs:
            for agent_id, node in self.nodes.items():
                if agent_id in rnd.agent_results:
                    com = node.on_prepare(prep, rnd.agent_results[agent_id])
                    if com:
                        rnd.commit_msgs.append(com)

        for com in rnd.commit_msgs:
            for agent_id, node in self.nodes.items():
                if node.on_commit(com):
                    committed = True

        if not committed:
            logger.warning(f"[Round {seq}] Commit phase failed — no quorum")
            return None, None, rnd

        # ── BUILD CERTIFICATE ─────────────────────────────────────────
        result_hash = sha256(canonical_json(majority_result))

        # Build verifiable prepare signatures (sign the request_hash directly)
        prepare_quorum = []
        for agent in self.agents:
            if agent.agent_id in rnd.agent_results:
                sig = agent.identity.sign(rnd.request_hash)
                prepare_quorum.append({"agent_id": agent.agent_id, "signature": sig})
                if len(prepare_quorum) >= self.quorum_size:
                    break

        # Build verifiable commit signatures (sign the result_hash directly)
        commit_quorum = []
        for agent in self.agents:
            if agent.agent_id in rnd.agent_results:
                sig = agent.identity.sign(result_hash)
                commit_quorum.append({"agent_id": agent.agent_id, "signature": sig})
                if len(commit_quorum) >= self.quorum_size:
                    break

        cert = ConsensusCertificate(
            view_number=view,
            sequence_number=seq,
            request_hash=rnd.request_hash,
            pre_prepare_signature=pre_prepare.signature,
            prepare_quorum=prepare_quorum,
            commit_quorum=commit_quorum,
            result_hash=result_hash,
            decision=majority_decision,
        )
        rnd.certificate = cert

        logger.info(f"[Round {seq}] Consensus reached: {majority_decision} | Certificate generated")
        self._emit("consensus_reached", {
            "decision": majority_decision,
            "sequence": seq,
            "prepare_count": len(prepare_quorum),
            "commit_count": len(commit_quorum),
        })

        return majority_result, cert, rnd
