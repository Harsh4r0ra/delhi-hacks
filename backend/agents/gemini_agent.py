import os
import json
import httpx
from typing import Dict, Any
from backend.agents.base import BaseAgent, SYSTEM_PROMPT, build_task_prompt


class GeminiAgent(BaseAgent):
    """Agent powered by Google Gemini API (gemini-2.0-flash)."""

    def __init__(self, agent_id: str, model: str = "gemini-2.0-flash-exp"):
        super().__init__(agent_id)
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set in the environment.")
        self.model = model
        self.url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        )

    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        task_prompt = build_task_prompt(action_id, json.dumps(user_request))
        full_prompt = f"{SYSTEM_PROMPT}\n\n{task_prompt}"

        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    self.url,
                    params={"key": self.api_key},
                    json=payload,
                )
                response.raise_for_status()

                data = response.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]

                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                result = json.loads(content[json_start:json_end])
        except Exception:
            result = {}

        return self.validate_decision(action_id, result)
