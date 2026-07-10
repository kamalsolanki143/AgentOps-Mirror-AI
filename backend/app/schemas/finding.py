import datetime
from pydantic import BaseModel


class FindingResponse(BaseModel):
    id: int
    stress_test_run_id: int
    conversation_id: int | None
    finding_type: str
    severity: str
    title: str
    description: str | None
    score: float | None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}
