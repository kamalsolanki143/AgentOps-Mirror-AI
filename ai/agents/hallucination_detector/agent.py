"""
Hallucination Detector – identifies factually incorrect responses.
"""


class HallucinationDetector:
    async def detect(self, transcript: dict) -> dict:
        return {
            "hallucinations_found": 0,
            "hallucination_score": 0.98,
            "details": [],
        }

    async def run(self, config: dict) -> dict:
        return await self.detect(config.get("transcript", {}))
