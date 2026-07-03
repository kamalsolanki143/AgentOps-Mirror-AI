from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/")
async def list_agents(user: dict = Depends(get_current_user)):
    return {"agents": ["persona_generator", "simulator", "audit_engine", "hallucination_detector", "jailbreak_detector"]}
