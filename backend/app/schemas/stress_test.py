import datetime
from pydantic import BaseModel


class StressTestCreate(BaseModel):
    name: str | None = None
    agent_id: int | None = None
    persona_ids: list[int]
    config_json: str | None = None


class StressTestStart(BaseModel):
    pass


class StressTestResponse(BaseModel):
    id: int
    user_id: int
    agent_id: int | None
    name: str | None
    status: str
    progress: int
    total_personas: int
    completed_personas: int
    total_messages: int
    findings_count: int
    overall_score: float | None
    started_at: datetime.datetime | None
    completed_at: datetime.datetime | None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class StressTestSummary(BaseModel):
    id: int
    name: str | None
    status: str
    progress: int
    overall_score: float | None
    created_at: datetime.datetime
