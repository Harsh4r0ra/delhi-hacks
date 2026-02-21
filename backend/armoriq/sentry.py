from typing import Dict, Any, Optional
from backend.armoriq.intent_engine import IntentDeclaration
import logging

logger = logging.getLogger(__name__)

class Sentry:
    """
    Sentry monitors execution alignment.
    Did the agent consensus actually match the original intent?
    """
    
    @staticmethod
    def validate_consensus_alignment(intent: IntentDeclaration, consensus_result: Dict[str, Any]) -> bool:
        """
        Checks if the approved action matches the requested intent.
        Prevents drift where an agent modifies the payload mischievously.
        """
        if not consensus_result:
            return False
            
        decision = consensus_result.get("decision")
        if decision != "APPROVE":
            return True # Safe closed
            
        # Example Drift Detection:
        # Check if the consensus result sneakily changed the target
        result_target = consensus_result.get("target")
        if result_target and result_target != intent.target:
            logger.error(f"Sentry detected drift! Intent target: {intent.target}, Consensus target: {result_target}")
            return False
            
        return True
