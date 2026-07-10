"""
Transcript Storage – handles reading and writing simulation logs to disk.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("simulation.transcripts")


class TranscriptStorage:
    """
    Persistence layer for simulation runs.
    Saves and reads transcripts as JSON files in a dedicated data folder.
    """

    def __init__(self, data_dir: Optional[str] = None) -> None:
        if data_dir:
            self.data_dir = Path(data_dir)
        else:
            # Default to a sub-folder under transcripts/
            self.data_dir = Path(__file__).resolve().parent / "data"
        
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def save_transcript(self, transcript: Dict[str, Any]) -> bool:
        """Saves a single simulation transcript to a JSON file."""
        session_id = transcript.get("session_id")
        if not session_id:
            logger.error("Cannot save transcript without a valid session_id")
            return False

        try:
            file_path = self.data_dir / f"{session_id}.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(transcript, f, indent=2)
            logger.debug(f"Saved transcript: {file_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save transcript {session_id}: {e}")
            return False

    def load_transcript(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Loads a transcript by its session ID."""
        file_path = self.data_dir / f"{session_id}.json"
        if not file_path.exists():
            logger.warning(f"Transcript file not found: {file_path}")
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load transcript {session_id}: {e}")
            return None

    def list_transcripts(self) -> List[Dict[str, Any]]:
        """Lists all stored transcripts in the directory."""
        transcripts = []
        for file_path in self.data_dir.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    transcripts.append(json.load(f))
            except Exception as e:
                logger.error(f"Failed to read file {file_path}: {e}")
        return transcripts

    def delete_transcript(self, session_id: str) -> bool:
        """Deletes a transcript by session ID."""
        file_path = self.data_dir / f"{session_id}.json"
        if file_path.exists():
            try:
                file_path.unlink()
                logger.info(f"Deleted transcript file {file_path}")
                return True
            except Exception as e:
                logger.error(f"Failed to delete transcript {session_id}: {e}")
                return False
        return False
