"""
Regression Engine – compares agent behavior across prompt/config versions.
"""

import logging
from typing import Any, Dict

logger = logging.getLogger("ai.regression_engine")


class RegressionEngine:
    """
    Compares current run scores against baseline run scores to detect regressions (Regression Shield).
    """

    async def compare(self, baseline: Dict[str, Any], current: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compares baseline and current runs, mapping performance delta and identifying regressions.
        """
        score_delta = {}
        regressions = []
        improvements = []

        all_keys = set(baseline.keys()).union(current.keys())
        for k in all_keys:
            base_val = baseline.get(k)
            curr_val = current.get(k)
            if isinstance(base_val, (int, float)) and isinstance(curr_val, (int, float)):
                delta = round(curr_val - base_val, 3)
                score_delta[k] = delta
                if delta < -0.05:  # Regression threshold
                    regressions.append({
                        "dimension": k,
                        "baseline": base_val,
                        "current": curr_val,
                        "delta": delta,
                        "severity": "high" if delta < -0.2 else "medium"
                    })
                elif delta > 0.05:
                    improvements.append({
                        "dimension": k,
                        "baseline": base_val,
                        "current": curr_val,
                        "delta": delta
                    })

        status = "passed"
        if regressions:
            status = "failed" if any(r["severity"] == "high" for r in regressions) else "warning"

        return {
            "status": status,
            "score_delta": score_delta,
            "regressions": regressions,
            "improvements": improvements,
            "reason": f"Regression shield status: {status.upper()}. {len(regressions)} regression(s) found. {len(improvements)} improvement(s) found."
        }

    async def run(self, config: dict) -> dict:
        """
        Runs the regression engine agent task.
        """
        baseline = config.get("baseline", {})
        current = config.get("current", {})
        return await self.compare(baseline, current)

