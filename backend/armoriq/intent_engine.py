import uuid
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field

class IntentDeclaration(BaseModel):
    intent_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action_type: str
    target: str
    description: str
    risk_level: str = "UNKNOWN"
    created_at: str = Field(default_factory=lambda: datetime.datetime.utcnow().isoformat() + "Z")
    
class IntentEngine:
    @staticmethod
    def classify_risk(action_type: str, target: str) -> str:
        """Determines the risk level of the requested action."""
        action_type = action_type.upper()
        target = target.upper()
        
        if action_type in ["DELETE", "DROP", "WIPE", "TRANSFER_FUNDS"]:
            return "CRITICAL"
        if action_type in ["UPDATE", "MODIFY", "GRANT_ACCESS", "REBOOT"]:
            return "HIGH"
        if action_type in ["CREATE", "INSERT", "UPLOAD"]:
            return "MEDIUM"
        if action_type in ["READ", "GET", "PING", "HEALTHCHECK", "LIST"]:
            return "LOW"
            
        return "UNKNOWN"

    @staticmethod
    def build_intent(request: Dict[str, Any]) -> IntentDeclaration:
        """Parses a raw request into an ArmorIQ IntentDeclaration."""
        action_type = request.get("operation", "UNKNOWN")
        target = request.get("target", "UNKNOWN")
        desc = request.get("description", f"Execute {action_type} on {target}")
        
        risk = IntentEngine.classify_risk(action_type, target)
        
        return IntentDeclaration(
            action_type=action_type,
            target=target,
            description=desc,
            risk_level=risk
        )

    @staticmethod
    def apply_pre_execution_guardrails(intent: IntentDeclaration) -> bool:
        """
        Hard block on certain extremely dangerous intents before they even reach agents.
        Returns True if allowed to proceed, False if blocked.
        """
        # Ensure we're using the calculated risk level
        if intent.risk_level == "UNKNOWN":
            intent.risk_level = IntentEngine.classify_risk(intent.action_type, intent.target)
            
        if intent.risk_level == "CRITICAL" and "PRODUCTION" in intent.target.upper():
            # Example hard guardrail: never delete production directly via agent
            return False
            
        return True
