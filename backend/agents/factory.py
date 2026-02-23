"""
Agent Factory — creates the correct set of agents based on MODE.

  MODE="fast"  → 7x SimulatedAgent (instant mock responses, no API keys needed)
  MODE="full"  → 7 real LLM agents using 4 existing API keys with distinct models:
    agent_1: Mistral Large      (mistral-large-latest)   — Mistral AI, France
    agent_2: Groq Llama 3.3 70B (llama-3.3-70b-versatile)— Meta, dense transformer
    agent_3: Groq Qwen3 32B    (qwen/qwen3-32b)          — Alibaba, MoE architecture
    agent_4: Gemini 2.0 Flash   (gemini-2.0-flash)        — Google DeepMind
    agent_5: Gemini 2.5 Flash   (gemini-2.5-flash)        — Google (newer generation)
    agent_6: Cerebras GPT-OSS 120B (gpt-oss-120b)         — OpenAI open-source on CS-3
    agent_7: Cerebras Llama 8B  (llama3.1-8b)             — Meta, ultra-fast inference

7 agents → f=2 Byzantine Fault Tolerance  (3f+1 = 7)

RATE-LIMIT ALTERNATIVES (swap any above with these if you add OPENROUTER_API_KEY):
  OpenRouter → Gemma 2       : "google/gemma-2-9b-it"
  OpenRouter → DeepSeek R1   : "deepseek/deepseek-r1"
  OpenRouter → Phi-4         : "microsoft/phi-4"
  OpenRouter → Falcon 3 7B   : "tiiuae/falcon-3-7b-instruct"
  OpenRouter → Llama 4 Maverick: "meta-llama/llama-4-maverick"
"""

import os
import logging
from typing import List

from backend.agents.base import BaseAgent
from backend.agents.simulated_agent import SimulatedAgent
from backend.agents.mistral_agent import MistralAgent
from backend.agents.groq_agent import GroqAgent
from backend.agents.gemini_agent import GeminiAgent
from backend.agents.cerebras_agent import CerebrasAgent
from backend.agents.openrouter_agent import OpenRouterAgent

logger = logging.getLogger("byzantinemind.factory")

# Check if OpenRouter is configured — if so, prefer diverse open-source models
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")


def create_agents(mode: str) -> List[BaseAgent]:
    """
    Factory that builds a 7-agent heterogeneous LLM ensemble (agent_1 through agent_7).
    Agents are numbered starting from 1 to reflect their role as active participants
    (no zero-indexed "inactive" slot).

    If OPENROUTER_API_KEY is set, automatically swaps in more diverse models
    (Gemma 2, DeepSeek, Phi-4, Falcon 3) for better rate-limit resilience.

    Args:
        mode: "fast" for simulated agents, "full" for real LLM agents.

    Returns:
        List of 7 BaseAgent instances (3f+1 for f=2 Byzantine fault tolerance).
    """
    if mode == "full":
        if OPENROUTER_KEY:
            logger.info("OPENROUTER_API_KEY detected — using diverse open-source model pool...")
            agents = [
                # Mistral AI — European, RSM architecture
                MistralAgent("agent_1", model="mistral-large-latest"),

                # Meta Llama 3.3 via Groq — dense transformer
                GroqAgent("agent_2", model="llama-3.3-70b-versatile"),

                # Google Gemma 2 via OpenRouter — DeepMind research architecture
                OpenRouterAgent("agent_3", model="google/gemma-2-9b-it"),

                # DeepSeek R1 via OpenRouter — Chinese AI, chain-of-thought reasoning
                OpenRouterAgent("agent_4", model="deepseek/deepseek-r1"),

                # Microsoft Phi-4 via OpenRouter — small but powerful research model
                OpenRouterAgent("agent_5", model="microsoft/phi-4"),

                # Gemini 2.0 Flash — Google DeepMind
                GeminiAgent("agent_6", model="gemini-2.0-flash"),

                # Cerebras Llama 8B — fast ultra-low-latency CS-3 silicon inference
                CerebrasAgent("agent_7", model="llama3.1-8b"),
            ]
            logger.info("7-agent OpenRouter ensemble initialized. Max diversity across 6 orgs.")
        else:
            logger.info("Creating FULL-DEPTH 7-agent ensemble (existing API keys)...")
            agents = [
                # Mistral AI — European, RSM architecture
                MistralAgent("agent_1", model="mistral-large-latest"),

                # Groq — two distinct architectures (Meta + Alibaba)
                GroqAgent("agent_2", model="llama-3.3-70b-versatile"),
                GroqAgent("agent_3", model="qwen/qwen3-32b"),

                # Google Gemini — two distinct model generations
                GeminiAgent("agent_4", model="gemini-2.0-flash"),
                OpenRouterAgent("agent_5", model="microsoft/phi-4"),

                # Cerebras — two distinct model families
                CerebrasAgent("agent_6", model="gpt-oss-120b"),
                CerebrasAgent("agent_7", model="llama3.1-8b"),
            ]
            logger.info("All 7 LLM agents initialized. BFT tolerance: f=2 (tolerates 2 Byzantine faults).")
        return agents

    # Default: fast / simulated mode (7 agents, 1-indexed to match full mode IDs)
    logger.info("Creating FAST-MODE agents (7x simulated, agent_1..agent_7)...")
    return [SimulatedAgent(f"agent_{i}") for i in range(1, 8)]
