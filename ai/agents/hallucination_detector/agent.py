"""
Hallucination Detector – identifies factually incorrect responses.
"""

import json
import logging
from typing import Any, Dict
from models.llm_client import LLMClient

logger = logging.getLogger("ai.hallucination_detector")


class HallucinationDetector:
    """
    Evaluates agent response logs for hallucinations or unsupported claims.
    """
    def __init__(self) -> None:
        self.llm_client = LLMClient()

    async def detect(self, transcript: Dict[str, Any], reference_facts: str = "") -> Dict[str, Any]:
        """
        Analyzes the transcript for hallucinations using LLM scoring.
        """
        try:
            prompt_cfg = self.llm_client.load_prompt("audit", "hallucination")
            system_prompt = prompt_cfg.get("system", "")
            
            messages = transcript.get("messages", [])
            messages_str = json.dumps(messages, indent=2)
            
            # Format the template with relevant inputs
            user_prompt = f"Reference Facts: {reference_facts or 'General consistency and logic'}\n\nTranscript:\n{messages_str}"
            
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
                "reason": parsed.get("reason", "No hallucinations detected."),
                "recommendation": parsed.get("recommendation", "None"),
                "details": parsed.get("details", [])
            }
        except Exception as e:
            logger.error(f"Hallucination detection failed: {e}")
            return {
                "score": 1.0,
                "severity": "none",
                "reason": f"Detection exception: {e}",
                "recommendation": "Verify LLM service availability.",
                "details": []
            }

    async def run(self, config: dict) -> dict:
        """
        Runs the hallucination detector task.
        """
        transcript = config.get("transcript", config)
        reference_facts = config.get("reference_facts", "")
        return await self.detect(transcript, reference_facts)

