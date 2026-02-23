"""
OpenRouter Agent — Universal gateway to 100+ open-source models via openrouter.ai.

This gives access (with a single OPENROUTER_API_KEY) to:
  - Gemma 2 (google/gemma-2-9b-it)
  - DeepSeek R1 (deepseek/deepseek-r1)
  - Phi-4 (microsoft/phi-4)
  - Falcon 3 7B (tiiuae/falcon3-7b-instruct)
  - ...and hundreds more

Get a free API key at: https://openrouter.ai/  (many models are free)
"""

import os
import json
import httpx
from typing import Dict, Any
from backend.agents.base import BaseAgent, SYSTEM_PROMPT, build_task_prompt


class OpenRouterAgent(BaseAgent):
    """
    Agent powered by OpenRouter — a unified API gateway to 100+ open-source LLMs.
    Supports Gemma, DeepSeek, Phi, Falcon, and many more from a single API key.

    Sign up free at: https://openrouter.ai/
    Set OPENROUTER_API_KEY in your .env file.
    """

    # Curated set of free/cheap models with diverse architectures
    RECOMMENDED_MODELS = {
        "gemma2":    "google/gemma-2-9b-it",           # Google DeepMind
        "deepseek":  "deepseek/deepseek-r1",           # DeepSeek AI
        "phi4":      "microsoft/phi-4",                 # Microsoft Research
        "falcon3":   "tiiuae/falcon-3-7b-instruct",     # TII, UAE
        "llama4":    "meta-llama/llama-4-maverick",    # Meta (latest)
        "qwen2":     "qwen/qwen-2.5-72b-instruct",    # Alibaba
        "mistral":   "mistralai/mistral-nemo",         # Mistral AI
    }

    def __init__(self, agent_id: str, model: str = "google/gemma-2-9b-it"):
        super().__init__(agent_id)
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError(
                "OPENROUTER_API_KEY is not set. "
                "Get a free key at https://openrouter.ai/ and add it to your .env file."
            )
        self.model = model
        self.url = "https://openrouter.ai/api/v1/chat/completions"

    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        task_prompt = build_task_prompt(action_id, json.dumps(user_request))

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://byzantinemind.ai",
            "X-Title": "ByzantineMind PBFT Consensus",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": task_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.url, headers=headers, json=payload)
                response.raise_for_status()

                data = response.json()
                content = data["choices"][0]["message"]["content"]

                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                result = json.loads(content[json_start:json_end])
        except Exception:
            result = {}

        return self.validate_decision(action_id, result)
