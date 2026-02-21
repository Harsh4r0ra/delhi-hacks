import asyncio
from typing import Dict, Any
from backend.agents.base import BaseAgent

class SimulatedAgent(BaseAgent):
    def __init__(self, agent_id: str):
        super().__init__(agent_id)

    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        """Simulates an instant, realistic mock response for Fast Mode."""
        await asyncio.sleep(0.1) # Simulate slight latency

        risk = str(user_request.get("risk", "UNKNOWN")).upper()
        
        if risk in ["CRITICAL", "HIGH", "UNKNOWN"]:
            decision = "REJECT"
            reason_code = "UNSAFE_OR_UNKNOWN"
            confidence = 0.95
        else:
            decision = "APPROVE"
            reason_code = "SAFE"
            confidence = 0.99

        result = {
            "action_id": action_id,
            "decision": decision,
            "reason_code": reason_code,
            "confidence": confidence
        }
        
        return self.validate_decision(action_id, result)
