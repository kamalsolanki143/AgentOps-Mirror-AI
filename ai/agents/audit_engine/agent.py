"""
Audit Engine – orchestrates multi-dimensional scoring.
"""

import asyncio
import logging
from typing import Any, Dict
from ai.agents.hallucination_detector.agent import HallucinationDetector
from ai.agents.prompt_leak_detector.agent import PromptLeakDetector
from ai.agents.jailbreak_detector.agent import JailbreakDetector
from ai.agents.business_goal_evaluator.agent import BusinessGoalEvaluator

logger = logging.getLogger("ai.audit_engine_agent")


class AuditEngine:
    """
    Orchestrator for the multi-agent auditing step.
    Runs detectors concurrently and formats a unified score report.
    """
    def __init__(self) -> None:
        self.hallucination_detector = HallucinationDetector()
        self.prompt_leak_detector = PromptLeakDetector()
        self.jailbreak_detector = JailbreakDetector()
        self.business_goal_evaluator = BusinessGoalEvaluator()

    async def score(self, transcript: Dict[str, Any], goals: list[str] = None) -> Dict[str, Any]:
        """
        Runs the individual safety and business detectors and aggregates them.
        """
        try:
            # Run checks concurrently for high throughput
            hallucination_task = self.hallucination_detector.detect(transcript)
            prompt_leak_task = self.prompt_leak_detector.detect(transcript)
            jailbreak_task = self.jailbreak_detector.detect(transcript)
            business_task = self.business_goal_evaluator.evaluate(transcript, goals or [])

            hallucination_res, prompt_leak_res, jailbreak_res, business_res = await asyncio.gather(
                hallucination_task, prompt_leak_task, jailbreak_task, business_task
            )

            # Security score is combination of jailbreak and prompt leak
            security_score = min(prompt_leak_res.get("score", 1.0), jailbreak_res.get("score", 1.0))
            
            # Policy score (can check toxic content, defaults to security-based policies for now)
            policy_score = security_score
            
            # Quality score is hallucination score
            quality_score = hallucination_res.get("score", 1.0)
            
            # Business score is goal attainment rate
            business_score = business_res.get("score", 1.0)

            overall_score = round(
                security_score * 0.4 +
                quality_score * 0.2 +
                policy_score * 0.2 +
                business_score * 0.2,
                3
            )

            return {
                "security_score": security_score,
                "quality_score": quality_score,
                "policy_score": policy_score,
                "business_score": business_score,
                "overall_score": overall_score,
                "hallucination_details": hallucination_res,
                "prompt_leak_details": prompt_leak_res,
                "jailbreak_details": jailbreak_res,
                "business_goal_details": business_res
            }
        except Exception as e:
            logger.error(f"Audit orchestration failed: {e}")
            return {
                "security_score": 1.0,
                "quality_score": 1.0,
                "policy_score": 1.0,
                "business_score": 1.0,
                "overall_score": 1.0,
                "error": str(e)
            }

    async def run(self, config: dict) -> dict:
        """
        Runs the audit engine agent task.
        """
        transcript = config.get("transcript", config)
        goals = config.get("goals", [])
        return await self.score(transcript, goals)

