import datetime
from pydantic import BaseModel


class PersonaCreate(BaseModel):
    name: str
    persona_type: str = "standard"
    language: str = "en"
    difficulty: str = "medium"
    goal: str | None = None
    behavior_description: str | None = None
    attack_style: str | None = None
    traits: str | None = None


class PersonaUpdate(BaseModel):
    name: str | None = None
    persona_type: str | None = None
    language: str | None = None
    difficulty: str | None = None
    goal: str | None = None
    behavior_description: str | None = None
    attack_style: str | None = None
    traits: str | None = None
    is_active: bool | None = None


class PersonaResponse(BaseModel):
    id: int
    user_id: int
    name: str
    persona_type: str
    language: str
    difficulty: str
    goal: str | None
    behavior_description: str | None
    attack_style: str | None
    traits: str | None
    is_active: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}
