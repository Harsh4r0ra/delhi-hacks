"""
Agent Factory — creates the correct set of agents based on MODE.

  MODE="fast"  → 4x SimulatedAgent (instant mock responses, no API keys needed)
  MODE="full"  → MistralAgent + GroqAgent + GeminiAgent + CerebrasAgent (real LLMs)
"""

import logging
from typing import List

from backend.agents.base import BaseAgent
from backend.agents.simulated_agent import SimulatedAgent
from backend.agents.mistral_agent import MistralAgent
from backend.agents.groq_agent import GroqAgent
from backend.agents.gemini_agent import GeminiAgent
from backend.agents.cerebras_agent import CerebrasAgent

logger = logging.getLogger("byzantinemind.factory")


def create_agents(mode: str) -> List[BaseAgent]:
    """
    Factory that builds the agent ensemble.

    Args:
        mode: "fast" for simulated agents, "full" for real LLM agents.

    Returns:
        List of 4 BaseAgent instances.
    """
    if mode == "full":
        logger.info("Creating FULL-DEPTH agents (real LLM APIs)...")
        agents = [
            MistralAgent("agent_1"),
            GroqAgent("agent_2"),
            GeminiAgent("agent_3"),
            CerebrasAgent("agent_4"),
        ]
        logger.info("All 4 LLM agents initialized successfully.")
        return agents

    # Default: fast / simulated mode
    logger.info("Creating FAST-MODE agents (simulated)...")
    return [SimulatedAgent(f"agent_{i+1}") for i in range(4)]
