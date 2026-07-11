import datetime
from pydantic import BaseModel


from pydantic import Field

class AgentCreate(BaseModel):
    model_config = {
        "protected_namespaces": (),
        "populate_by_name": True,
        "from_attributes": True
    }
    name: str
    description: str | None = None
    model_type: str = Field("openai", alias="connector")
    endpoint: str | None = None
    tags: list[str] = []


class AgentUpdate(BaseModel):
    model_config = {
        "protected_namespaces": (),
        "populate_by_name": True,
        "from_attributes": True
    }
    name: str | None = None
    description: str | None = None
    model_type: str | None = Field(None, alias="connector")
    endpoint: str | None = None
    status: str | None = None
    tags: list[str] | None = None


class AgentResponse(BaseModel):
    model_config = {
        "from_attributes": True,
        "protected_namespaces": (),
        "populate_by_name": True
    }
    id: str
    user_id: int
    name: str
    description: str | None
    connector: str = Field(..., alias="connector")
    endpoint: str | None
    status: str
    tags: list[str] = []
    health_score: int = Field(80, alias="healthScore")
    last_run_at: datetime.datetime | None = Field(None, alias="lastRunAt")
    last_run_id: str | None = Field(None, alias="lastRunId")
    tests_run: int = Field(0, alias="testsRun")
    avg_health_score: int = Field(80, alias="avgHealthScore")
    created_at: datetime.datetime = Field(..., alias="createdAt")
    updated_at: datetime.datetime = Field(..., alias="updatedAt")


class AgentListResponse(BaseModel):
    agents: list[AgentResponse]
    total: int

