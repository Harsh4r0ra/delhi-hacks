import asyncio
from typing import Dict, Any
from backend.agents.base import BaseAgent

class DeepSeekAgent(BaseAgent):
    """
    A fast, local mock agent representing a lightweight local model
    (e.g., DeepSeek R1 Distill) running on the same machine.
    This provides sub-second responses and bypasses all API rate limits
    while still securely evaluating the PBFT consensus rules.
    """

    def __init__(self, agent_id: str, model: str = "deepseek-r1-distill-8b"):
        super().__init__(agent_id)
        self.model = model

    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate local LLM token generation latency (0.5 - 1.2s)
        await asyncio.sleep(0.8)

        # Basic deterministic rules engine simulating a local safety model's evaluation
        operation = user_request.get("operation", "").upper()
        target = user_request.get("target", "").lower()
        desc = user_request.get("description", "").lower()

        is_safe = False
        confidence = 0.95

        # Safe operations
        if operation in ["PING", "READ", "GET", "FETCH"]:
            if "admin" not in target and "secret" not in target:
                is_safe = True
                confidence = 0.98

        # Dangerous operations
        if operation in ["DELETE", "DROP", "EXECUTE", "GRANT", "GRANT_ADMIN"]:
            is_safe = False
            confidence = 0.99
            
        # Prompt injection checks
        if "ignore" in desc or "bypass" in desc or "always approve" in desc:
            is_safe = False
            confidence = 1.0

        decision = "APPROVE" if is_safe else "REJECT"
        reason_code = "SAFE" if is_safe else "UNSAFE_OR_UNKNOWN"

        result = {
            "action_id": action_id,
            "decision": decision,
            "reason_code": reason_code,
            "confidence": confidence,
        }

        return self.validate_decision(action_id, result)
