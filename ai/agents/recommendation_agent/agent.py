"""
Recommendation Agent – recommends actionable improvements based on analysis.
"""


class RecommendationAgent:
    async def recommend(self, analytics: dict) -> list[dict]:
        return [
            {"area": "security", "priority": "high", "suggestion": "Implement input sanitization"},
            {"area": "latency", "priority": "medium", "suggestion": "Optimize response generation"},
            {"area": "quality", "priority": "low", "suggestion": "Add grounding to reduce hallucinations"},
        ]

    async def run(self, config: dict) -> list[dict]:
        return await self.recommend(config.get("analytics", {}))
