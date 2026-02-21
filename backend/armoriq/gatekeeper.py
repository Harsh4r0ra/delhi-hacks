from typing import List, Dict
from backend.agents.base import BaseAgent
from backend.armoriq.intent_engine import IntentDeclaration
import logging

logger = logging.getLogger(__name__)

class Gatekeeper:
    """
    Gatekeeper manages agent identity verification and permission scoping.
    It ensures that only authorized agents can participate in high-risk decisions.
    """
    
    @staticmethod
    def authorize_agents(intent: IntentDeclaration, available_agents: List[BaseAgent]) -> List[BaseAgent]:
        """
        Filters the agent pool based on the permissions required for the intent's risk level.
        In a full system, this would check an IAM/RBAC database.
        For us, we ensure the agent provides a valid verify_key.
        """
        authorized = []
        for agent in available_agents:
            if not getattr(agent.identity, "verify_key", None):
                logger.warning(f"Gatekeeper blocked agent {agent.agent_id}: No valid verify_key.")
                continue
                
            # Example permission scoping:
            # If it's a CRITICAL task, maybe require specific specialized models.
            # For this demo, we authorize all agents that have valid identities.
            authorized.append(agent)
            
        return authorized
