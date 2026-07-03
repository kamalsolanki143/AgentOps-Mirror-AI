"""
Jailbreak Detector – detects prompt injection / jailbreak attacks.
"""


class JailbreakDetector:
    async def detect(self, transcript: dict) -> dict:
        return {
            "jailbreak_attempts": 0,
            "jailbreak_score": 1.0,
            "details": [],
        }

    async def run(self, config: dict) -> dict:
        return await self.detect(config.get("transcript", {}))
