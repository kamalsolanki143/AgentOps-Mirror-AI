from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_current_user

router = APIRouter()


class StressTestRequest(BaseModel):
    persona_ids: list[int]
    scenario_id: int
    agent_id: int | None = None


class StressTestResponse(BaseModel):
    id: int
    status: str


@router.post("/", response_model=StressTestResponse)
async def create_stress_test(req: StressTestRequest, user: dict = Depends(get_current_user)):
    # Placeholder: enqueue stress test to Celery
    return StressTestResponse(id=1, status="queued")


@router.get("/{test_id}")
async def get_stress_test(test_id: int, user: dict = Depends(get_current_user)):
    return {"id": test_id, "status": "running", "progress": 45}
