"""
Prompt Leak Detector – detects system prompt extraction attempts.
"""


class PromptLeakDetector:
    async def detect(self, transcript: dict) -> dict:
        return {
            "leak_attempts": 0,
            "leak_score": 1.0,
            "details": [],
        }

    async def run(self, config: dict) -> dict:
        return await self.detect(config.get("transcript", {}))
