import os
from dotenv import load_dotenv

load_dotenv()

# ── API Keys ─────────────────────────────────────────────────────
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

# Legacy — kept for backward compatibility with HFAgent
HF_TOKEN = os.getenv("HF_TOKEN")

# ── Mode & BFT Config ────────────────────────────────────────────
MODE = os.getenv("MODE", "fast")  # "fast" or "full"
F_FAULTS = int(os.getenv("F_FAULTS", "1"))
N_AGENTS = 3 * F_FAULTS + 1

# PBFT timeout (seconds) — increased for real API latency
CONSENSUS_TIMEOUT_SEC = float(os.getenv("CONSENSUS_TIMEOUT_SEC", "30.0"))

# Agent model IDs (for HFAgent / display purposes)
AGENT_MODELS = {
    "agent_1": os.getenv("AGENT_1_MODEL", "mistralai/Mistral-7B-Instruct-v0.2"),
    "agent_2": os.getenv("AGENT_2_MODEL", "microsoft/phi-2"),
    "agent_3": os.getenv("AGENT_3_MODEL", "google/gemma-2b-it"),
    "agent_4": os.getenv("AGENT_4_MODEL", "meta-llama/Llama-2-7b-chat-hf"),
}
