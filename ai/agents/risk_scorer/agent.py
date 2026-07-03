"""
Risk Scorer – computes composite risk scores from audit results.
"""


class RiskScorer:
    async def compute(self, audit_results: dict) -> dict:
        security = audit_results.get("security_score", 1.0)
        quality = audit_results.get("quality_score", 1.0)
        policy = audit_results.get("policy_score", 1.0)
        composite = (1 - security) * 0.4 + (1 - quality) * 0.3 + (1 - policy) * 0.3
        return {"composite_risk": round(composite, 3), "risk_level": "low" if composite < 0.3 else "medium" if composite < 0.7 else "high"}

    async def run(self, config: dict) -> dict:
        return await self.compute(config.get("audit_results", {}))
