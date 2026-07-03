"""
Regression Engine – compares agent behavior across prompt/config versions.
"""


class RegressionEngine:
    async def compare(self, baseline: dict, current: dict) -> dict:
        return {
            "score_delta": {k: current.get(k, 0) - baseline.get(k, 0) for k in baseline},
            "regressions": [],
            "improvements": [],
        }

    async def run(self, config: dict) -> dict:
        return await self.compare(config.get("baseline", {}), config.get("current", {}))
