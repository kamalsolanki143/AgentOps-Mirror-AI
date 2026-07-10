"""
Analytics Agent – produces aggregate analytics from test runs.
"""

import logging
from typing import Any, Dict, List

logger = logging.getLogger("ai.analytics_agent")


class AnalyticsAgent:
    """
    Processes collections of test runs to draw performance trends, averages, and identify top vulnerabilities.
    """

    async def analyze(self, test_runs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates run metrics.
        """
        total_runs = len(test_runs)
        if total_runs == 0:
            return {
                "total_runs": 0,
                "avg_score": 1.0,
                "vulnerability_trend": [],
                "latency_p50": 0.0,
                "latency_p95": 0.0,
                "top_issues": []
            }

        scores = []
        latencies = []
        issues_count = {}

        for run in test_runs:
            scores.append(run.get("overall_score", run.get("health_score", 1.0)))
            # Gather latency if present, default to 1.0
            latencies.append(run.get("latency", 1.0))
            for issue in run.get("critical_failures", []):
                issues_count[issue] = issues_count.get(issue, 0) + 1

        avg_score = round(sum(scores) / len(scores), 2)
        sorted_latencies = sorted(latencies)
        p50 = sorted_latencies[int(len(sorted_latencies) * 0.5)] if sorted_latencies else 0.0
        p95 = sorted_latencies[int(len(sorted_latencies) * 0.95)] if sorted_latencies else 0.0

        top_issues = [{"issue": k, "occurrences": v} for k, v in sorted(issues_count.items(), key=lambda x: x[1], reverse=True)]

        return {
            "total_runs": total_runs,
            "avg_score": avg_score,
            "vulnerability_trend": scores,
            "latency_p50": round(p50, 3),
            "latency_p95": round(p95, 3),
            "top_issues": top_issues
        }

    async def run(self, config: dict) -> dict:
        """
        Runs the analytics agent task.
        """
        test_runs = config.get("test_runs", [])
        return await self.analyze(test_runs)

