import json
import sys
import time
import traceback
from typing import Any, Dict, List, Tuple

from byzantine_mind import AGENT_MODELS, HF_TOKEN, Agent, byzantine_mind_orchestrate


def validate_env() -> Tuple[bool, List[str]]:
    errors: List[str] = []

    if not HF_TOKEN:
        errors.append("Missing HF_TOKEN in .env")

    missing_models = [name for name, model in AGENT_MODELS.items() if not model]
    if missing_models:
        errors.append(f"Missing model IDs for: {', '.join(missing_models)}")

    if len(AGENT_MODELS) != 4:
        errors.append(
            f"Expected 4 agents for f=1, found {len(AGENT_MODELS)} entries in AGENT_MODELS"
        )

    return (len(errors) == 0, errors)


def build_agents() -> List[Agent]:
    ordered = sorted(AGENT_MODELS.items(), key=lambda x: x[0])
    return [Agent(agent_id=agent_id, model_id=model_id) for agent_id, model_id in ordered]


def run_case(
    agents: List[Agent], case_name: str, action_id: str, user_request: Dict[str, Any], f: int
) -> Dict[str, Any]:
    started = time.time()
    result = byzantine_mind_orchestrate(
        agents=agents,
        action_id=action_id,
        user_request=user_request,
        f=f,
    )
    elapsed = time.time() - started

    return {
        "case": case_name,
        "action_id": action_id,
        "elapsed_seconds": round(elapsed, 2),
        "result": result,
    }


def validate_result_shape(case_report: Dict[str, Any]) -> Tuple[bool, str]:
    result = case_report["result"]
    if result is None:
        return True, "No quorum approve (valid fail-closed outcome)"

    required_keys = {"action_id", "decision", "timestamp", "signers", "hash"}
    if not isinstance(result, dict):
        return False, "Result is not dict/None"
    if not required_keys.issubset(result.keys()):
        return False, f"Result missing keys: {sorted(required_keys - set(result.keys()))}"
    if result.get("decision") != "APPROVE":
        return False, "Non-APPROVE decision returned in final result object"
    if not isinstance(result.get("signers"), list) or len(result["signers"]) < 3:
        return False, "Expected at least 3 signers for quorum when f=1"

    return True, "APPROVE result shape is valid"


def main() -> int:
    ok, env_errors = validate_env()
    if not ok:
        print("ENV VALIDATION FAILED:")
        for err in env_errors:
            print(f"- {err}")
        return 1

    print("ENV VALIDATION PASSED")
    print("Building agents (this can take time on first run due to model downloads)...")

    try:
        agents = build_agents()
    except Exception:
        print("FAILED while building agents:")
        traceback.print_exc()
        return 1

    f = 1
    if len(agents) != 3 * f + 1:
        print(f"Invalid agent count: got {len(agents)}, expected {3 * f + 1}")
        return 1

    test_cases = [
        (
            "safe_ping",
            "action-safe-ping-001",
            {
                "type": "HEALTHCHECK",
                "operation": "PING",
                "target": "internal_backend",
                "risk": "LOW",
            },
        ),
        (
            "unsafe_high_risk",
            "action-unsafe-001",
            {
                "type": "EXECUTION",
                "operation": "DELETE_ALL_DATA",
                "target": "production_database",
                "risk": "CRITICAL",
            },
        ),
    ]

    reports: List[Dict[str, Any]] = []
    for case_name, action_id, request in test_cases:
        print(f"\nRunning case: {case_name}")
        report = run_case(agents, case_name, action_id, request, f)
        reports.append(report)
        print(json.dumps(report, indent=2))

    print("\nValidating backend responses...")
    all_passed = True
    for report in reports:
        passed, message = validate_result_shape(report)
        status = "PASS" if passed else "FAIL"
        print(f"- {report['case']}: {status} ({message})")
        if not passed:
            all_passed = False

    print("\nSummary:")
    print(json.dumps(reports, indent=2))

    if all_passed:
        print("\nBackend E2E test completed successfully.")
        print("Your backend is ready for frontend integration.")
        return 0

    print("\nBackend E2E test found issues. Fix those before frontend integration.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
