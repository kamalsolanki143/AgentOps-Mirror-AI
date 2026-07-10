import pytest
from simulation.persona_library.library import PersonaLibrary
from simulation.persona_library.models import Persona


def test_persona_library_defaults():
    """Verifies that the default 10 personas are loaded correctly."""
    lib = PersonaLibrary()
    personas = lib.list_personas()
    assert len(personas) == 10
    
    angry = lib.get_persona("Angry Customer")
    assert angry is not None
    assert angry.difficulty == "hard"
    assert "REFUND" in angry.goal.upper()


def test_persona_registration():
    """Verifies custom persona registration and validation."""
    lib = PersonaLibrary()
    p = Persona(
        name="Custom Tester",
        description="Vulnerability validation profile.",
        goal="Bypass bounds.",
        difficulty="easy",
        conversation_style="concise",
        personality="helpful",
        attack_strategy="none",
        expected_outcome="outcome"
    )
    lib.register_persona(p)
    assert lib.get_persona("Custom Tester") == p
