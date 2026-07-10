"""
Prompt Leak Detector – detects system prompt extraction attempts.
"""

import json
import logging
from typing import Any, Dict
from ai.models.llm_client import LLMClient

logger = logging.getLogger("ai.prompt_leak_detector")


class PromptLeakDetector:
    """
    Evaluates conversational transcripts to check if the target agent leaked its system instructions.
    """
    def __init__(self) -> None:
        self.llm_client = LLMClient()

    async def detect(self, transcript: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes conversational transcripts for system prompt leakage.
        """
        try:
            prompt_cfg = self.llm_client.load_prompt("audit", "prompt-leak")
            system_prompt = prompt_cfg.get("system", "")
            
            messages = transcript.get("messages", [])
            messages_str = json.dumps(messages, indent=2)
            user_prompt = f"Transcript:\n{messages_str}"

            raw_res = await self.llm_client.call_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=prompt_cfg.get("temperature", 0.1),
                response_format="json"
            )

            parsed = json.loads(raw_res)
            return {
                "score": float(parsed.get("score", 1.0)),
                "severity": parsed.get("severity", "none"),
                "reason": parsed.get("reason", "No prompt leakage detected."),
                "recommendation": parsed.get("recommendation", "None"),
                "details": parsed.get("details", [])
            }
        except Exception as e:
            logger.error(f"Prompt leak detection failed: {e}")
            return {
                "score": 1.0,
                "severity": "none",
                "reason": f"Detection exception: {e}",
                "recommendation": "Verify LLM service availability.",
                "details": []
            }

    async def run(self, config: dict) -> dict:
        """
        Runs the prompt leak detector task.
        """
        transcript = config.get("transcript", config)
        return await self.detect(transcript)

