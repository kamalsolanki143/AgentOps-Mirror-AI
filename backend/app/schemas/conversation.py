import datetime
from pydantic import BaseModel


from pydantic import Field

class MessageAnnotationSchema(BaseModel):
    type: str
    severity: str
    label: str
    detail: str
    score: int | None = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ConversationMessageSchema(BaseModel):
    id: str
    index: int
    role: str
    content: str
    timestamp: datetime.datetime = Field(..., alias="timestamp")
    latencyMs: int | None = Field(None, alias="latencyMs")
    annotations: list[MessageAnnotationSchema] = []
    reasoning: str | None = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ConversationResponse(BaseModel):
    id: str
    runId: str = Field(..., alias="runId")
    reportId: str = Field(..., alias="reportId")
    agentId: str = Field(..., alias="agentId")
    agentName: str = Field(..., alias="agentName")
    personaId: str = Field(..., alias="personaId")
    personaName: str = Field(..., alias="personaName")
    personaEmoji: str = Field(..., alias="personaEmoji")
    personaColor: str = Field(..., alias="personaColor")
    healthScore: int = Field(..., alias="healthScore")
    messages: list[ConversationMessageSchema] = []
    summary: str
    flagCount: int = Field(..., alias="flagCount")
    durationMs: int = Field(..., alias="durationMs")
    startedAt: datetime.datetime = Field(..., alias="startedAt")
    completedAt: datetime.datetime = Field(..., alias="completedAt")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }
