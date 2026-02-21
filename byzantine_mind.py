import os
import json
import hashlib
import datetime
from typing import List, Dict, Any

from dotenv import load_dotenv
from nacl.signing import SigningKey

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# =========================================================
# ENV
# =========================================================
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

AGENT_MODELS = {
    "agent_1": os.getenv("AGENT_1_MODEL"),
    "agent_2": os.getenv("AGENT_2_MODEL"),
    "agent_3": os.getenv("AGENT_3_MODEL"),
    "agent_4": os.getenv("AGENT_4_MODEL"),
}

SYSTEM_PROMPT = """You are an autonomous verification agent in a Byzantine Fault Tolerant AI system.

CRITICAL RULES (NON-NEGOTIABLE):
1. You MUST output ONLY valid JSON.
2. You MUST follow the exact schema provided.
3. You MUST NOT explain reasoning.
4. You MUST NOT add extra text, markdown, or comments.
5. If ANY uncertainty, ambiguity, missing data, or safety concern exists -> decision MUST be "REJECT".
6. You MUST NOT assume intent.
7. You MUST NOT optimize, suggest, or help.

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


# =========================================================
# UTILS
# =========================================================
def canonical_json(data: Dict[str, Any]) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"))


def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


# =========================================================
# HF MODEL WRAPPER
# =========================================================
class HFModel:
    def __init__(self, model_id: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, token=HF_TOKEN)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            token=HF_TOKEN,
            torch_dtype=torch.float32,
            device_map="cpu",
        )

    def run(self, system_prompt: str, task_prompt: str) -> Dict[str, Any]:
        prompt = f"{system_prompt}\n\n{task_prompt}"
        inputs = self.tokenizer(prompt, return_tensors="pt")
        with torch.no_grad():
            output = self.model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=False,
            )

        prompt_tokens = inputs["input_ids"].shape[1]
        generated_tokens = output[0][prompt_tokens:]
        text = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)

        try:
            json_start = text.index("{")
            json_end = text.rindex("}") + 1
            return json.loads(text[json_start:json_end])
        except Exception:
            return {
                "decision": "REJECT",
                "reason_code": "UNSAFE_OR_UNKNOWN",
                "confidence": 0.0,
            }


# =========================================================
# AGENT
# =========================================================
class Agent:
    def __init__(self, agent_id: str, model_id: str):
        self.agent_id = agent_id
        self.signing_key = SigningKey.generate()
        self.verify_key = self.signing_key.verify_key
        self.model = HFModel(model_id)

    def decide(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        user_request_json = json.dumps(user_request)
        task_prompt = build_task_prompt(action_id, user_request_json)
        result = self.model.run(SYSTEM_PROMPT, task_prompt)

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


# =========================================================
# BYZANTINE CONSENSUS
# =========================================================
class ByzantineConsensus:
    @staticmethod
    def find_quorum(responses: List[Dict[str, Any]], f: int):
        buckets = {}
        for r in responses:
            buckets.setdefault(r["hash"], []).append(r)

        quorum_size = 2 * f + 1
        valid = [v for v in buckets.values() if len(v) >= quorum_size]

        if len(valid) != 1:
            return None

        group = valid[0]
        return {
            "hash": group[0]["hash"],
            "decision": group[0]["decision"],
            "canonical": group[0]["canonical"],
            "signers": [g["agent_id"] for g in group],
            "signatures": [g["signature"] for g in group],
        }


# =========================================================
# ORCHESTRATION
# =========================================================
def byzantine_mind_orchestrate(
    agents: List[Agent],
    action_id: str,
    user_request: Dict[str, Any],
    f: int,
):
    assert len(agents) == 3 * f + 1

    responses = []

    for agent in agents:
        output = agent.decide(action_id, user_request)
        canonical = canonical_json(output)
        h = sha256(canonical)
        sig = agent.signing_key.sign(h.encode()).signature.hex()

        responses.append(
            {
                "agent_id": agent.agent_id,
                "decision": output["decision"],
                "canonical": canonical,
                "hash": h,
                "signature": sig,
                "verify_key": agent.verify_key,
            }
        )

    verified = []
    for r in responses:
        try:
            r["verify_key"].verify(r["hash"].encode(), bytes.fromhex(r["signature"]))
            verified.append(r)
        except Exception:
            pass

    quorum = ByzantineConsensus.find_quorum(verified, f)
    if not quorum:
        return None

    if quorum["decision"] != "APPROVE":
        return None

    return {
        "action_id": action_id,
        "decision": "APPROVE",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "signers": quorum["signers"],
        "hash": quorum["hash"],
    }
