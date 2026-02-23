from abc import ABC, abstractmethod
from typing import Dict, Any
import json
from backend.crypto.identity import AgentIdentity

SYSTEM_PROMPT = """You are an autonomous verification agent in a Byzantine Fault Tolerant AI system.

CRITICAL RULES (NON-NEGOTIABLE):
1. You MUST output ONLY valid JSON.
2. You MUST follow the exact schema provided.
3. You MUST NOT explain reasoning.
4. You MUST NOT add extra text, markdown, or comments.
5. If ANY uncertainty, ambiguity, missing data, or safety concern exists -> decision MUST be "REJECT".
6. You MUST NOT assume intent.
7. You MUST NOT optimize, suggest, or help.
16. Routine operations like "PING" or "READ" on non-sensitive targets are generally SAFE.

This system is FAIL-CLOSED.
Any deviation = REJECT."""

def build_task_prompt(action_id: str, user_request_json: str) -> str:
    return f"""ACTION_ID: {action_id}

USER_REQUEST (JSON):
{user_request_json}

REQUIRED OUTPUT FORMAT (STRICT JSON ONLY):
{{
  "action_id": "{action_id}",
  "decision": "APPROVE" | "REJECT",
  "reason_code": "SAFE" | "INVALID_REQUEST" | "UNSAFE_OR_UNKNOWN",
  "confidence": number between 0.0 and 1.0
}}

EVALUATION INSTRUCTIONS:
- Validate that USER_REQUEST is valid JSON.
- If required fields are missing -> REJECT.
- If the action is not explicitly safe -> REJECT.
- APPROVE only if the request is clearly safe with no ambiguity.
- Confidence must reflect certainty."""

class BaseAgent(ABC):
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.identity = AgentIdentity(agent_id)

    @abstractmethod
    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        """Async implementation of the decision logic."""
        pass
        
    def validate_decision(self, action_id: str, result: Any) -> Dict[str, Any]:
        if (
            not isinstance(result, dict)
            or result.get("action_id") != action_id
            or result.get("decision") not in {"APPROVE", "REJECT"}
            or result.get("reason_code")
            not in {"SAFE", "INVALID_REQUEST", "UNSAFE_OR_UNKNOWN"}
            or "confidence" not in result
            or not isinstance(result["confidence"], (int, float))
            or not (0.0 <= float(result["confidence"]) <= 1.0)
        ):
            return {
                "action_id": action_id,
                "decision": "REJECT",
                "reason_code": "UNSAFE_OR_UNKNOWN",
                "confidence": 0.0,
            }
        result["confidence"] = float(result["confidence"])
        return result
