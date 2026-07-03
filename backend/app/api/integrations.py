from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/")
async def list_integrations(user: dict = Depends(get_current_user)):
    return {
        "integrations": [
            {"name": "github", "connected": False},
            {"name": "jira", "connected": False},
            {"name": "slack", "connected": False},
            {"name": "teams", "connected": False},
            {"name": "email", "connected": False},
            {"name": "webhook", "connected": False},
        ]
    }
