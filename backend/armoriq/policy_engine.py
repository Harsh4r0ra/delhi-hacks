import yaml
import os
import logging
from typing import Dict, Any, Optional
from backend.armoriq.intent_engine import IntentDeclaration

logger = logging.getLogger(__name__)

DEFAULT_POLICY = """
policies:
  - id: require_full_consensus_for_production
    target: ".*PRODUCTION.*"
    action: "ANY"
    min_quorum: 4
    escalate_to_human: false
    description: "Production operations require 4/4 unanimous consent."

  - id: human_review_for_financials
    target: "ANY"
    action: "TRANSFER_FUNDS"
    min_quorum: 3
    escalate_to_human: true
    description: "Financial transactions require Human-In-The-Loop approval."

  - id: standard_operations
    target: "ANY"
    action: "ANY"
    min_quorum: 3
    escalate_to_human: false
    description: "Standard 3/4 quorum for regular operations."
"""

class PolicyEngine:
    """
    Evaluates intents against organizational governance policies.
    Determines required quorum sizes and whether human escalation is needed.
    """
    def __init__(self, policy_path: str = "policies.yaml"):
        self.policy_path = policy_path
        self.policies = []
        self._load_policies()

    def _load_policies(self):
        if not os.path.exists(self.policy_path):
            with open(self.policy_path, "w") as f:
                f.write(DEFAULT_POLICY.strip())
        
        try:
            with open(self.policy_path, "r") as f:
                data = yaml.safe_load(f)
                self.policies = data.get("policies", [])
                logger.info(f"Loaded {len(self.policies)} governance policies.")
        except Exception as e:
            logger.error(f"Failed to load policies: {e}")
            self.policies = []

    def evaluate(self, intent: IntentDeclaration, default_quorum: int = 3) -> Dict[str, Any]:
        """
        Evaluate the intent against all policies from top to bottom.
        The first matching policy applies.
        """
        import re

        result = {
            "policy_id": "default",
            "required_quorum": default_quorum,
            "escalate_to_human": False,
            "description": "Default configuration applies."
        }

        for policy in self.policies:
            target_match = policy.get("target") == "ANY" or re.search(policy.get("target", ""), intent.target, re.IGNORECASE)
            action_match = policy.get("action") == "ANY" or policy.get("action") == intent.action_type

            if target_match and action_match:
                result["policy_id"] = policy.get("id", "unknown")
                result["required_quorum"] = policy.get("min_quorum", default_quorum)
                result["escalate_to_human"] = policy.get("escalate_to_human", False)
                result["description"] = policy.get("description", "Matched policy")
                break

        return result

    def get_all_policies(self) -> list:
        return self.policies

    def update_policies(self, new_policies_yaml: str) -> bool:
        try:
            # Validate YAML first
            data = yaml.safe_load(new_policies_yaml)
            if "policies" not in data:
                return False
                
            with open(self.policy_path, "w") as f:
                f.write(new_policies_yaml)
                
            self.policies = data["policies"]
            return True
        except Exception:
            return False

# Global instance
policy_engine = PolicyEngine()
