import datetime
from pydantic import BaseModel, Field


class PersonaGoalSchema(BaseModel):
    description: str
    successCriteria: str = Field(..., alias="successCriteria")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class PersonaCreate(BaseModel):
    name: str
    slug: str | None = None
    category: str = "standard"
    language: str = "en"
    difficulty: str = "medium"
    description: str = ""
    personality: str = ""
    goal: PersonaGoalSchema
    sample_opener: str = Field(..., alias="sampleOpener")
    tags: list[str] = []
    color: str = "#6C5CE7"
    emoji: str = "🤖"
    success_rate: int = Field(0, alias="successRate")
    is_built_in: bool = Field(False, alias="isBuiltIn")

    persona_type: str = "standard"
    behavior_description: str | None = None
    attack_style: str | None = None
    traits: str | None = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class PersonaUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    category: str | None = None
    language: str | None = None
    difficulty: str | None = None
    description: str | None = None
    personality: str | None = None
    goal: PersonaGoalSchema | None = None
    sample_opener: str | None = Field(None, alias="sampleOpener")
    tags: list[str] | None = None
    color: str | None = None
    emoji: str | None = None
    success_rate: int | None = Field(None, alias="successRate")
    is_active: bool | None = None

    persona_type: str | None = None
    behavior_description: str | None = None
    attack_style: str | None = None
    traits: str | None = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class PersonaResponse(BaseModel):
    id: str
    user_id: int
    name: str
    slug: str
    category: str
    language: str
    difficulty: str
    description: str
    personality: str
    goal: PersonaGoalSchema
    sample_opener: str = Field(..., alias="sampleOpener")
    tags: list[str]
    color: str
    emoji: str
    success_rate: int = Field(..., alias="successRate")
    is_built_in: bool = Field(..., alias="isBuiltIn")
    is_active: bool = Field(..., alias="isActive")
    created_at: datetime.datetime = Field(..., alias="createdAt")
    updated_at: datetime.datetime = Field(..., alias="updatedAt")

    persona_type: str
    behavior_description: str | None
    attack_style: str | None
    traits: str | None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class PersonaListResponse(BaseModel):
    personas: list[PersonaResponse]
    total: int

