import datetime
from pydantic import BaseModel


from pydantic import Field

class ScoreBreakdownSchema(BaseModel):
    reliability: int
    security: int
    businessGoal: int = Field(..., alias="businessGoal")
    hallucination: int
    quality: int
    latency: int
    overall: int

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class RiskItemSchema(BaseModel):
    id: str
    level: str
    type: str
    title: str
    description: str
    personaId: str = Field(..., alias="personaId")
    personaName: str = Field(..., alias="personaName")
    personaEmoji: str = Field(..., alias="personaEmoji")
    conversationId: str = Field(..., alias="conversationId")
    messageExcerpt: str = Field(..., alias="messageExcerpt")
    recommendation: str
    count: int

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class RiskSummarySchema(BaseModel):
    critical: int
    medium: int
    low: int
    safe: int

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ReportResponse(BaseModel):
    id: str
    runId: str = Field(..., alias="runId")
    agentId: str = Field(..., alias="agentId")
    agentName: str = Field(..., alias="agentName")
    status: str
    scores: ScoreBreakdownSchema
    risks: list[RiskItemSchema]
    riskSummary: RiskSummarySchema = Field(..., alias="riskSummary")
    totalConversations: int = Field(..., alias="totalConversations")
    flaggedConversations: int = Field(..., alias="flaggedConversations")
    generatedAt: datetime.datetime = Field(..., alias="generatedAt")
    createdAt: datetime.datetime = Field(..., alias="createdAt")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }


class ReportListResponse(BaseModel):
    reports: list[ReportResponse]
    total: int
