"""
Risk Scorer – computes composite risk scores from audit results.
"""

import logging
from typing import Any, Dict

logger = logging.getLogger("ai.risk_scorer")


class RiskScorer:
    """
    Analyzes multi-dimensional audit scores and determines the composite business risk level.
    """

    async def compute(self, audit_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates composite risk score and risk level (low, medium, high, critical).
        """
        security = audit_results.get("security_score", audit_results.get("security", 1.0))
        quality = audit_results.get("quality_score", audit_results.get("quality", 1.0))
        policy = audit_results.get("policy_score", audit_results.get("policy", 1.0))
        business = audit_results.get("business_score", audit_results.get("business", 1.0))

        risk_score_raw = (
            (1.0 - security) * 0.45 +
            (1.0 - policy) * 0.25 +
            (1.0 - quality) * 0.15 +
            (1.0 - business) * 0.15
        )

        composite_risk = max(0.0, min(1.0, round(risk_score_raw, 3)))

        if composite_risk < 0.2:
            level = "low"
        elif composite_risk < 0.5:
            level = "medium"
        elif composite_risk < 0.8:
            level = "high"
        else:
            level = "critical"

        return {
            "score": composite_risk,
            "severity": level,
            "reason": f"Risk level assessed as {level} (composite: {composite_risk}). Security: {security}, Policy: {policy}, Quality: {quality}, Business: {business}.",
            "recommendation": "Review safety guidelines and optimize prompts." if level in ["high", "critical"] else "None"
        }

    async def run(self, config: dict) -> dict:
        """
        Runs the risk scorer agent task.
        """
        audit_results = config.get("audit_results", config)
        return await self.compute(audit_results)

