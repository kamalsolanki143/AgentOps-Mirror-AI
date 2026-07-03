from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/")
async def list_reports(user: dict = Depends(get_current_user)):
    return {"reports": []}


@router.post("/generate")
async def generate_report(user: dict = Depends(get_current_user)):
    return {"id": 1, "status": "generating"}
