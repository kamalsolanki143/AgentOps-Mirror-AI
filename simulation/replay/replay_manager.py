"""
Replay Manager – displays step-by-step dialogue runs and failure diagnostic points.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from simulation.transcripts.storage import TranscriptStorage

logger = logging.getLogger("simulation.replay")


class ReplayManager:
    """
    Renders structured, turn-by-turn diagrams indicating messages, latencies,
    and failure locations from stored transcripts.
    """

    def __init__(self, data_dir: Optional[str] = None) -> None:
        self.storage = TranscriptStorage(data_dir=data_dir)

    def load_and_format_replay(self, session_id: str) -> str:
        """Loads a session transcript and formats a visual walkthrough."""
        transcript = self.storage.load_transcript(session_id)
        if not transcript:
            return f"Error: Session {session_id} not found in transcript storage."

        return self.format_replay(transcript)

    def format_replay(self, transcript: Dict[str, Any]) -> str:
        """Translates a transcript dict into a text-based step-by-step timeline."""
        persona = transcript.get("persona", {})
        scenario = transcript.get("scenario", {})
        messages = transcript.get("messages", [])
        timestamps = transcript.get("timestamps", {})
        success = transcript.get("success", False)
        fail_reason = transcript.get("failure_reason", "None")

        lines = []
        lines.append("=" * 80)
        lines.append(f" SESSION REPLAY: {transcript.get('session_id')}")
        lines.append("=" * 80)
        lines.append(f"Persona: {persona.get('name')} | Difficulty: {persona.get('difficulty')}")
        lines.append(f"Scenario: {scenario.get('name', 'Custom')}")
        lines.append(f"Goal: {scenario.get('goal', 'N/A')}")
        lines.append(f"Duration: {timestamps.get('duration', 0.0)}s | Status: {transcript.get('status')}")
        lines.append(f"Success: {'YES' if success else 'NO'}")
        if not success:
            lines.append(f"Failure Point: {fail_reason}")
        lines.append("-" * 80)
        lines.append("")

        for i, msg in enumerate(messages):
            role = msg.get("role")
            content = msg.get("content", "").strip()
            ts = msg.get("timestamp", 0.0)
            formatted_time = datetime.fromtimestamp(ts).strftime("%H:%M:%S.%f")[:-3]

            if role == "user":
                lines.append(f"[{formatted_time}] USER ({persona.get('name')})")
                lines.append(f"   {content}")
            elif role == "assistant":
                latency = msg.get("latency", 0.0)
                lines.append(f"[{formatted_time}] AI ASSISTANT (Latency: {latency}s)")
                lines.append(f"   {content}")
            else:
                lines.append(f"[{formatted_time}] SYSTEM")
                lines.append(f"   {content}")
            
            # Draw flow separator
            if i < len(messages) - 1:
                lines.append("        ↓")

        lines.append("")
        
        # If the session failed, append diagnostic highlights
        if not success:
            lines.append("!" * 80)
            lines.append(" DIAGNOSTIC PATHWAY FAILURE ANALYSIS")
            lines.append("!" * 80)
            lines.append(f"Failure Reason: {fail_reason}")
            lines.append(f"Vulnerability Trigger: The session halted during turn {len(messages)//2}.")
            lines.append("Suggestions:")
            if "timeout" in fail_reason.lower():
                lines.append("  * Increase turn_timeout parameters.")
                lines.append("  * Check target agent resource contention/throttling.")
            elif "leak" in fail_reason.lower() or "jailbreak" in fail_reason.lower():
                lines.append("  * Tighten system instructions alignment constraints.")
                lines.append("  * Implement input validation pre-filters.")
            else:
                lines.append("  * Review target logs for internal runtime stack errors.")
            lines.append("!" * 80)

        lines.append("")
        return "\n".join(lines)
