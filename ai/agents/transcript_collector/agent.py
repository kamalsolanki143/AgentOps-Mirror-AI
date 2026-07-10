"""
Transcript Collector – stores and formats simulation transcripts.
"""

import logging
import time
from typing import Any, Dict, List
from pydantic import BaseModel, Field

logger = logging.getLogger("ai.transcript_collector")


class TranscriptModel(BaseModel):
    session_id: str
    persona: Dict[str, Any]
    scenario: Dict[str, Any]
    messages: List[Dict[str, str]]
    timestamp: float = Field(default_factory=time.time)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TranscriptCollector:
    """
    Collects, validates, and stores conversational transcripts from simulations.
    """
    def __init__(self) -> None:
        self.transcripts: Dict[str, TranscriptModel] = {}

    async def collect(self, session_id: str, persona: dict, scenario: dict, messages: list, metadata: dict = None) -> dict:
        """
        Validates and stores the transcript under a session ID.
        """
        try:
            model = TranscriptModel(
                session_id=session_id,
                persona=persona,
                scenario=scenario,
                messages=messages,
                metadata=metadata or {}
            )
            self.transcripts[session_id] = model
            logger.info(f"Successfully collected and stored transcript for session {session_id}")
            return {"status": "stored", "session_id": session_id, "message_count": len(messages)}
        except Exception as e:
            logger.error(f"Failed to collect transcript: {e}")
            return {"status": "error", "reason": str(e)}

    async def run(self, config: dict) -> dict:
        """
        Runs the transcript collector agent task.
        """
        session_id = config.get("session_id", "default_session")
        persona = config.get("persona", {})
        scenario = config.get("scenario", {})
        messages = config.get("messages", config.get("transcript", {}).get("messages", []))
        metadata = config.get("metadata", {})
        return await self.collect(session_id, persona, scenario, messages, metadata)

