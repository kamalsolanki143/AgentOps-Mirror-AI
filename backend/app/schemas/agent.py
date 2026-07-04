import datetime
from pydantic import BaseModel


class AgentCreate(BaseModel):
    model_config = {"protected_namespaces": ()}
    name: str
    description: str | None = None
    model_type: str = "openai"
    endpoint: str | None = None
    tags: str | None = None


class AgentUpdate(BaseModel):
    model_config = {"protected_namespaces": ()}
    name: str | None = None
    description: str | None = None
    model_type: str | None = None
    endpoint: str | None = None
    status: str | None = None
    tags: str | None = None


class AgentResponse(BaseModel):
    model_config = {"from_attributes": True, "protected_namespaces": ()}
    id: int
    user_id: int
    name: str
    description: str | None
    model_type: str
    endpoint: str | None
    status: str
    tags: str | None
    created_at: datetime.datetime
    updated_at: datetime.datetime
