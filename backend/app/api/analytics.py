from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/dashboard")
async def dashboard_analytics(user: dict = Depends(get_current_user)):
    return {
        "total_tests": 0,
        "total_personas": 0,
        "vulnerabilities_found": 0,
        "average_score": None,
        "recent_tests": [],
    }
