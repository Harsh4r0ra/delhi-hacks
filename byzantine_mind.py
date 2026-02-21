import os
import json
import hashlib
import datetime
from typing import List, Dict, Any

from dotenv import load_dotenv
from nacl.signing import SigningKey, VerifyKey

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
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_id, token=HF_TOKEN
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            token=HF_TOKEN,
            torch_dtype=torch.float32,
            device_map="cpu"
        )

    def run(self, prompt: str) -> Dict[str, Any]:
        inputs = self.tokenizer(prompt, return_tensors="pt")
        with torch.no_grad():
            output = self.model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=False
            )

        text = self.tokenizer.decode(output[0], skip_special_tokens=True)

        # STRICT FAIL-CLOSED PARSING
        try:
            json_start = text.index("{")
            json_end = text.rindex("}") + 1
            parsed = json.loads(text[json_start:json_end])
            return parsed
        except Exception:
            return {
                "decision": "REJECT",
                "reason_code": "INVALID_MODEL_OUTPUT",
                "confidence": 0.0
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
        prompt = f"""
You are a Byzantine verification agent.

RULES:
- Output ONLY valid JSON
- No explanations
- If uncertain → REJECT

FORMAT:
{{
  "action_id": "{action_id}",
  "decision": "APPROVE" | "REJECT",
  "reason_code": "SAFE" | "INVALID_REQUEST" | "UNSAFE_OR_UNKNOWN",
  "confidence": number
}}

USER_REQUEST:
{json.dumps(user_request)}
"""
        result = self.model.run(prompt)

        # Enforce schema strictly
        if (
            not isinstance(result, dict)
            or result.get("decision") not in {"APPROVE", "REJECT"}
            or "confidence" not in result
        ):
            return {
                "action_id": action_id,
                "decision": "REJECT",
                "reason_code": "SCHEMA_VIOLATION",
                "confidence": 0.0
            }

        result["action_id"] = action_id
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

        responses.append({
            "agent_id": agent.agent_id,
            "decision": output["decision"],
            "canonical": canonical,
            "hash": h,
            "signature": sig,
            "verify_key": agent.verify_key
        })

    # Verify signatures
    verified = []
    for r in responses:
        try:
            r["verify_key"].verify(
                r["hash"].encode(),
                bytes.fromhex(r["signature"])
            )
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