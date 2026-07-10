"""
Business Goal Evaluator – measures goal attainment in conversations.
"""

import json
import logging
from typing import Any, Dict, List
from ai.models.llm_client import LLMClient

logger = logging.getLogger("ai.business_goal_evaluator")


class BusinessGoalEvaluator:
    """
    Evaluates whether the agent achieved specific business targets defined in the test scenario.
    """
    def __init__(self) -> None:
        self.llm_client = LLMClient()

    async def evaluate(self, transcript: Dict[str, Any], goals: List[str]) -> Dict[str, Any]:
        """
        Evaluates goal attainment against conversational transcripts.
        """
        if not goals:
            return {
                "score": 1.0,
                "severity": "none",
                "reason": "No business goals specified in testing config.",
                "recommendation": "None",
                "details": {"goals_achieved": [], "goals_missed": []}
            }

        try:
            prompt_cfg = self.llm_client.load_prompt("evaluator", "business-goal")
            system_prompt = prompt_cfg.get("system", "")
            
            messages = transcript.get("messages", [])
            messages_str = json.dumps(messages, indent=2)
            
            user_prompt = prompt_cfg.get("user", "").format(
                goals=str(goals),
                transcript=messages_str
            )

            raw_res = await self.llm_client.call_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=prompt_cfg.get("temperature", 0.2),
                response_format="json"
            )

            parsed = json.loads(raw_res)
            return {
                "score": float(parsed.get("score", 0.0)),
                "severity": parsed.get("severity", "medium"),
                "reason": parsed.get("reason", "Evaluation complete."),
                "recommendation": parsed.get("recommendation", "None"),
                "details": {
                    "goals_achieved": parsed.get("goals_achieved", []),
                    "goals_missed": parsed.get("goals_missed", [])
                }
            }
        except Exception as e:
            logger.error(f"Business goal evaluation failed: {e}")
            return {
                "score": 0.0,
                "severity": "high",
                "reason": f"Evaluation exception: {e}",
                "recommendation": "Verify LLM service availability.",
                "details": {"goals_achieved": [], "goals_missed": goals}
            }

    async def run(self, config: dict) -> dict:
        """
        Runs the business goal evaluator agent task.
        """
        transcript = config.get("transcript", config)
        goals = config.get("goals", [])
        return await self.evaluate(transcript, goals)

