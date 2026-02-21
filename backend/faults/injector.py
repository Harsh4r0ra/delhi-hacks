"""
FaultInjector — production-grade fault injection system for Byzantine Fault Tolerance testing.

Supports 5 fault types from the BFT literature:
1. CrashFault      — agent stops responding entirely (process death)
2. OmissionFault   — agent silently drops messages (network partition)
3. TimingFault     — agent responds too slowly (exceeds timeout)
4. ByzantineFault  — agent sends deliberately wrong/malicious responses
5. CollusionFault  — multiple agents coordinate to send identical wrong answers

Design: wraps BaseAgent instances via decorator pattern.
The original agent is preserved and can be restored by clearing faults.
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Set
from enum import Enum

from backend.agents.base import BaseAgent

logger = logging.getLogger("byzantinemind.faults")


class FaultType(str, Enum):
    CRASH = "CRASH"
    OMISSION = "OMISSION"
    TIMING = "TIMING"
    BYZANTINE = "BYZANTINE"
    COLLUSION = "COLLUSION"


class FaultConfig:
    """Configuration for a single fault injection."""
    def __init__(self, fault_type: FaultType, delay_seconds: float = 30.0,
                 malicious_decision: str = "APPROVE", collusion_group: Optional[str] = None):
        self.fault_type = fault_type
        self.delay_seconds = delay_seconds
        self.malicious_decision = malicious_decision
        self.collusion_group = collusion_group


class FaultyAgentWrapper(BaseAgent):
    """
    Wraps a real agent and intercepts its decide_async() to inject faulty behavior.
    The wrapper preserves the original agent's identity (same keys, same agent_id)
    so the PBFT protocol sees the same node — but the behavior is corrupted.
    """

    def __init__(self, original_agent: BaseAgent, fault_config: FaultConfig):
        # Don't call super().__init__ — we steal identity from original
        self.agent_id = original_agent.agent_id
        self.identity = original_agent.identity
        self._original = original_agent
        self._fault = fault_config

    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        ft = self._fault.fault_type

        if ft == FaultType.CRASH:
            logger.warning(f"[FAULT] Agent {self.agent_id}: CRASH — raising exception")
            raise RuntimeError(f"Agent {self.agent_id} has crashed (injected fault)")

        if ft == FaultType.OMISSION:
            logger.warning(f"[FAULT] Agent {self.agent_id}: OMISSION — hanging forever")
            await asyncio.sleep(999999)  # Will be caught by timeout in engine
            return {}

        if ft == FaultType.TIMING:
            delay = self._fault.delay_seconds
            logger.warning(f"[FAULT] Agent {self.agent_id}: TIMING — delaying {delay}s")
            await asyncio.sleep(delay)
            return await self._original.decide_async(action_id, user_request)

        if ft == FaultType.BYZANTINE:
            logger.warning(f"[FAULT] Agent {self.agent_id}: BYZANTINE — sending malicious response")
            return {
                "action_id": action_id,
                "decision": self._fault.malicious_decision,
                "reason_code": "SAFE",
                "confidence": 0.99,
            }

        if ft == FaultType.COLLUSION:
            logger.warning(f"[FAULT] Agent {self.agent_id}: COLLUSION — coordinated wrong answer")
            return {
                "action_id": action_id,
                "decision": self._fault.malicious_decision,
                "reason_code": "SAFE",
                "confidence": 0.99,
                "_collusion_group": self._fault.collusion_group,
            }

        # Fallback: no fault
        return await self._original.decide_async(action_id, user_request)


class FaultInjector:
    """
    Central controller for injecting and clearing faults on agents.

    Usage:
        injector = FaultInjector()
        injector.inject(agent, FaultConfig(FaultType.BYZANTINE, malicious_decision="APPROVE"))
        # ... run consensus ...
        injector.clear(agent.agent_id)
    """

    def __init__(self):
        self._originals: Dict[str, BaseAgent] = {}
        self._active_faults: Dict[str, FaultConfig] = {}

    def inject(self, agents: list, agent_id: str, fault_config: FaultConfig) -> bool:
        """
        Injects a fault into the specified agent within the agents list (in-place).
        Returns True if successful, False if agent not found.
        """
        for idx, agent in enumerate(agents):
            if agent.agent_id == agent_id:
                # Save original
                if agent_id not in self._originals:
                    self._originals[agent_id] = agent
                # Replace with faulty wrapper
                agents[idx] = FaultyAgentWrapper(agent, fault_config)
                self._active_faults[agent_id] = fault_config
                logger.info(f"Injected {fault_config.fault_type.value} fault on {agent_id}")
                return True
        return False

    def clear(self, agents: list, agent_id: str) -> bool:
        """Restores the original agent (removes fault). Returns True if cleared."""
        if agent_id in self._originals:
            original = self._originals.pop(agent_id)
            for idx, agent in enumerate(agents):
                if agent.agent_id == agent_id:
                    agents[idx] = original
                    break
            self._active_faults.pop(agent_id, None)
            logger.info(f"Cleared fault on {agent_id}")
            return True
        return False

    def clear_all(self, agents: list):
        """Restores all agents to their original state."""
        for agent_id in list(self._originals.keys()):
            self.clear(agents, agent_id)

    def get_active_faults(self) -> Dict[str, str]:
        """Returns a map of agent_id -> fault_type for all currently active faults."""
        return {aid: fc.fault_type.value for aid, fc in self._active_faults.items()}
