from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/{transcript_id}")
async def get_transcript(transcript_id: int, user: dict = Depends(get_current_user)):
    return {"id": transcript_id, "conversation": []}
