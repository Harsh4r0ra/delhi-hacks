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
    def apply_pre_execution_guardrails(intent: IntentDeclaration, strict: bool = True) -> tuple:
        """
        Two-mode guardrail system.

        Args:
            intent: The declared intent to evaluate.
            strict: If True (default), hard-block dangerous operations before they reach agents.
                    If False (Consensus Mode), log a warning and allow PBFT to decide.

        Returns:
            (allowed: bool, guardrail_bypassed: bool)
        """
        import logging
        _logger = logging.getLogger(__name__)

        if intent.risk_level == "UNKNOWN":
            intent.risk_level = IntentEngine.classify_risk(intent.action_type, intent.target)

        is_critical_production = (
            intent.risk_level == "CRITICAL" and "PRODUCTION" in intent.target.upper()
        )

        if is_critical_production:
            if strict:
                # 🛡️ First Shield: ArmorIQ hard-blocks before agents are invoked
                _logger.warning(
                    f"[GUARDRAIL:STRICT] Blocked {intent.action_type} on {intent.target} "
                    f"(risk={intent.risk_level})"
                )
                return False, False
            else:
                # ⚡ Second Shield: Log warning, hand off to PBFT consensus
                _logger.warning(
                    f"[GUARDRAIL:BYPASSED] {intent.action_type} on {intent.target} "
                    f"(risk={intent.risk_level}) — passing to consensus agents"
                )
                return True, True  # allowed=True, guardrail_bypassed=True

        return True, False
