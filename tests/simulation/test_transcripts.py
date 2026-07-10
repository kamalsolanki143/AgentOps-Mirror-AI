import pytest
from tempfile import TemporaryDirectory
from simulation.transcripts.storage import TranscriptStorage


def test_transcript_storage():
    """Verifies that transcript records can be stored, loaded, and listed correctly."""
    with TemporaryDirectory() as tmp_dir:
        storage = TranscriptStorage(data_dir=tmp_dir)
        transcript = {
            "session_id": "test-session-xyz",
            "success": True,
            "persona": {"name": "Test Persona"},
            "messages": [{"role": "user", "content": "hello"}]
        }
        
        # Save
        assert storage.save_transcript(transcript) is True
        
        # Load
        loaded = storage.load_transcript("test-session-xyz")
        assert loaded is not None
        assert loaded["success"] is True
        assert loaded["persona"]["name"] == "Test Persona"
        
        # List
        all_t = storage.list_transcripts()
        assert len(all_t) == 1
        assert all_t[0]["session_id"] == "test-session-xyz"
        
        # Delete
        assert storage.delete_transcript("test-session-xyz") is True
        assert storage.load_transcript("test-session-xyz") is None
