import datetime
from pydantic import BaseModel


from pydantic import Field

class StressTestCreate(BaseModel):
    name: str | None = None
    agent_id: int | None = Field(None, alias="agentId")
    persona_ids: list[int] = Field(..., alias="selectedPersonaIds")
    difficulty: str | None = None
    conversations_per_persona: int | None = Field(3, alias="conversationsPerPersona")
    timeout_ms: int | None = Field(30000, alias="timeoutMs")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class StressTestStart(BaseModel):
    pass


class StressTestConfigSchema(BaseModel):
    agentId: str = Field(..., alias="agentId")
    selectedPersonaIds: list[str] = Field(..., alias="selectedPersonaIds")
    difficulty: str
    conversationsPerPersona: int = Field(..., alias="conversationsPerPersona")
    timeoutMs: int = Field(..., alias="timeoutMs")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class RunMetricsSchema(BaseModel):
    totalConversations: int = Field(..., alias="totalConversations")
    completedConversations: int = Field(..., alias="completedConversations")
    failedConversations: int = Field(..., alias="failedConversations")
    avgHealthScore: int = Field(..., alias="avgHealthScore")
    criticalRisks: int = Field(..., alias="criticalRisks")
    mediumRisks: int = Field(..., alias="mediumRisks")
    lowRisks: int = Field(..., alias="lowRisks")
    hallucinationCount: int = Field(..., alias="hallucinationCount")
    securityCount: int = Field(..., alias="securityCount")
    businessGoalCount: int = Field(..., alias="businessGoalCount")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ConversationFlagSchema(BaseModel):
    type: str
    severity: str
    message: str
    messageIndex: int = Field(..., alias="messageIndex")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class PersonaConversationSchema(BaseModel):
    id: str
    runId: str = Field(..., alias="runId")
    personaId: str = Field(..., alias="personaId")
    personaName: str = Field(..., alias="personaName")
    personaEmoji: str = Field(..., alias="personaEmoji")
    personaColor: str = Field(..., alias="personaColor")
    status: str
    healthScore: int | None = Field(None, alias="healthScore")
    riskLevel: str | None = Field(None, alias="riskLevel")
    messageCount: int = Field(..., alias="messageCount")
    startedAt: datetime.datetime | None = Field(None, alias="startedAt")
    completedAt: datetime.datetime | None = Field(None, alias="completedAt")
    flags: list[ConversationFlagSchema]

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class StressTestResponse(BaseModel):
    id: str
    agentId: str = Field(..., alias="agentId")
    agentName: str = Field(..., alias="agentName")
    config: StressTestConfigSchema
    status: str
    metrics: RunMetricsSchema
    conversations: list[PersonaConversationSchema] = []
    startedAt: datetime.datetime | None = Field(None, alias="startedAt")
    completedAt: datetime.datetime | None = Field(None, alias="completedAt")
    createdAt: datetime.datetime = Field(..., alias="createdAt")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }


class RunListResponse(BaseModel):
    runs: list[StressTestResponse]
    total: int


class StressTestSummary(BaseModel):
    id: int
    name: str | None
    status: str
    progress: int
    overall_score: float | None
    created_at: datetime.datetime
