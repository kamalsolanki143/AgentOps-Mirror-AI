"""
Transcript Collector – stores simulation transcripts.
"""


class TranscriptCollector:
    def __init__(self):
        self.transcripts = []

    async def collect(self, transcript: dict):
        self.transcripts.append(transcript)
        return {"status": "stored", "id": len(self.transcripts)}

    async def run(self, config: dict) -> dict:
        return await self.collect(config.get("transcript", {}))
