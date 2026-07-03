"""
Business Goal Evaluator – measures goal attainment in conversations.
"""


class BusinessGoalEvaluator:
    async def evaluate(self, transcript: dict, goals: list[str]) -> dict:
        return {
            "goals_achieved": [],
            "goals_missed": goals,
            "attainment_rate": 0.0,
        }

    async def run(self, config: dict) -> dict:
        return await self.evaluate(config.get("transcript", {}), config.get("goals", []))
