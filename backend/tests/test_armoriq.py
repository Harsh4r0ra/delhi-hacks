import pytest
from backend.armoriq.intent_engine import IntentEngine, IntentDeclaration
from backend.armoriq.sentry import Sentry
from backend.armoriq.gatekeeper import Gatekeeper
from backend.agents.simulated_agent import SimulatedAgent

def test_intent_classification():
    request = {"operation": "DELETE", "target": "production_db"}
    intent = IntentEngine.build_intent(request)
    
    assert intent.action_type == "DELETE"
    assert intent.risk_level == "CRITICAL"
    
    request2 = {"operation": "PING", "target": "health_endpoint"}
    intent2 = IntentEngine.build_intent(request2)
    assert intent2.risk_level == "LOW"

def test_intent_guardrails():
    intent = IntentDeclaration(action_type="DELETE", target="PRODUCTION_USERS", description="")
    assert not IntentEngine.apply_pre_execution_guardrails(intent) # Blocked
    
    intent2 = IntentDeclaration(action_type="READ", target="PRODUCTION_USERS", description="")
    assert IntentEngine.apply_pre_execution_guardrails(intent2) # Allowed

def test_gatekeeper():
    agents = [SimulatedAgent("1"), SimulatedAgent("2")]
    intent = IntentDeclaration(action_type="READ", target="X", description="")
    authorized = Gatekeeper.authorize_agents(intent, agents)
    assert len(authorized) == 2

def test_sentry_drift():
    intent = IntentDeclaration(action_type="READ", target="SAFE_TARGET", description="")
    
    # Matching target
    result_ok = {"decision": "APPROVE", "target": "SAFE_TARGET"}
    assert Sentry.validate_consensus_alignment(intent, result_ok)
    
    # Malicious target drift
    result_drift = {"decision": "APPROVE", "target": "MALICIOUS_TARGET"}
    assert not Sentry.validate_consensus_alignment(intent, result_drift)
