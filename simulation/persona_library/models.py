"""
Persona Model – defines parameters for simulation personas.
"""

from typing import List, Literal
from pydantic import BaseModel, Field


class Persona(BaseModel):
    """
    Pydantic schema representing a reusable testing persona.
    Used to steer the simulated user dialogue behavior.
    """
    name: str = Field(..., description="Name of the persona")
    description: str = Field(..., description="Brief summary of the persona profile")
    goal: str = Field(..., description="The objective of the user in the conversation")
    difficulty: Literal["easy", "medium", "hard", "critical"] = Field("medium", description="The difficulty tier")
    conversation_style: str = Field(..., description="Tone, vocabulary, and communication style constraints")
    personality: str = Field(..., description="Key emotional traits of the user")
    attack_strategy: str = Field(..., description="Adversarial attack parameters (jailbreak/leak tactics if any)")
    expected_outcome: str = Field(..., description="The successful state that resolves their issue")
