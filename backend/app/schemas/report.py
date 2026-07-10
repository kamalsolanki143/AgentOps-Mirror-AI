import datetime
from pydantic import BaseModel


class ReportResponse(BaseModel):
    id: int
    user_id: int
    stress_test_run_id: int
    title: str
    summary: str | None
    report_data: str | None
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}
