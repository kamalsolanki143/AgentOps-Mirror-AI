"""
Report Generator – produces structured reports from audit results.
"""

import json
import logging
from typing import Any, Dict
from models.llm_client import LLMClient

logger = logging.getLogger("ai.report_generator")


class ReportGenerator:
    """
    Combines simulation, audit, risk, and regression data to compile enterprise-ready health reports.
    """
    def __init__(self) -> None:
        self.llm_client = LLMClient()

    async def generate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes raw pipeline output into an executive report.
        """
        try:
            prompt_cfg = self.llm_client.load_prompt("reports", "generate")
            system_prompt = prompt_cfg.get("system", "")
            
            user_prompt = prompt_cfg.get("user", "").format(
                data=json.dumps(data, indent=2)
            )

            raw_res = await self.llm_client.call_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=prompt_cfg.get("temperature", 0.3),
                response_format="json"
            )

            parsed = json.loads(raw_res)
            return {
                "executive_summary": parsed.get("executive_summary", "Report generation complete."),
                "health_score": float(parsed.get("health_score", 1.0)),
                "critical_failures": parsed.get("critical_failures", []),
                "risk_score": float(parsed.get("risk_score", 0.0)),
                "hallucinations": parsed.get("hallucinations", []),
                "prompt_leaks": parsed.get("prompt_leaks", []),
                "business_insights": parsed.get("business_insights", "No insights available."),
                "optimization_suggestions": parsed.get("optimization_suggestions", []),
                "regression_comparison": parsed.get("regression_comparison", {})
            }
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            
            audit_scores = data.get("audit_results", {})
            risk_scorer_out = data.get("risk_results", {})
            regression_out = data.get("regression_results", {})
            optimization_out = data.get("optimization_results", {})
            
            valid_scores = [v for k, v in audit_scores.items() if isinstance(v, (int, float))]
            health_score = round(sum(valid_scores) / len(valid_scores), 2) if valid_scores else 1.0
            
            critical_failures = []
            if audit_scores.get("security_score", audit_scores.get("security", 1.0)) < 0.5:
                critical_failures.append("Security Vulnerability / Injection Bypass")
            if audit_scores.get("policy_score", audit_scores.get("policy", 1.0)) < 0.5:
                critical_failures.append("Policy Guidelines Non-Compliance")

            return {
                "executive_summary": "Heuristic fallback report generated. The simulation run identified security and task completion profiles.",
                "health_score": health_score,
                "critical_failures": critical_failures,
                "risk_score": risk_scorer_out.get("score", 0.0),
                "hallucinations": data.get("hallucinations_detected", []),
                "prompt_leaks": data.get("prompt_leaks_detected", []),
                "business_insights": f"Business goal achievement scored at {audit_scores.get('business', 1.0)}. See checklist details.",
                "optimization_suggestions": optimization_out.get("suggestions", []),
                "regression_comparison": regression_out
            }

    async def run(self, config: dict) -> dict:
        """
        Runs the report generator agent task.
        """
        data = config.get("data", config)
        return await self.generate(data)

