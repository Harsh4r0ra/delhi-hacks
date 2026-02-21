import json
import torch
from typing import Dict, Any
from transformers import AutoTokenizer, AutoModelForCausalLM

from backend.config import HF_TOKEN
from backend.agents.base import BaseAgent, SYSTEM_PROMPT, build_task_prompt

class HFAgent(BaseAgent):
    def __init__(self, agent_id: str, model_id: str):
        super().__init__(agent_id)
        self.model_id = model_id
        if not HF_TOKEN:
            raise ValueError("HF_TOKEN must be set to use HFAgent")
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, token=HF_TOKEN)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            token=HF_TOKEN,
            torch_dtype=torch.float32,
            device_map="cpu",
        )

    async def decide_async(self, action_id: str, user_request: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the HF model inference."""
        user_request_json = json.dumps(user_request)
        task_prompt = build_task_prompt(action_id, user_request_json)
        prompt = f"{SYSTEM_PROMPT}\n\n{task_prompt}"
        
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
            result = json.loads(text[json_start:json_end])
        except Exception:
            result = {}

        return self.validate_decision(action_id, result)
