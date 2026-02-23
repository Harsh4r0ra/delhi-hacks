import os
import json
import httpx
from typing import Dict, Any
from backend.agents.base import BaseAgent, SYSTEM_PROMPT, build_task_prompt


class CerebrasAgent(BaseAgent):
    """Agent powered by Cerebras ultra-fast inference API (Llama 3.3 70B)."""

    def __init__(self, agent_id: str, model: str = "llama3.1-8b"):
        super().__init__(agent_id)
        self.api_key = os.getenv("CEREBRAS_API_KEY")
        if not self.api_key:
            raise ValueError("CEREBRAS_API_KEY is not set in the environment.")
        self.model = model
        self.url = "https://api.cerebras.ai/v1/chat/completions"

    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        task_prompt = build_task_prompt(action_id, json.dumps(user_request))

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
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
            async with httpx.AsyncClient(timeout=20.0) as client:
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
