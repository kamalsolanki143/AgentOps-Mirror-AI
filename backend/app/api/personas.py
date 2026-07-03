from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_current_user

router = APIRouter()


class PersonaRequest(BaseModel):
    name: str
    description: str
    traits: list[str] = []


@router.post("/")
async def create_persona(req: PersonaRequest, user: dict = Depends(get_current_user)):
    return {"id": 1, **req.model_dump()}


@router.get("/")
async def list_personas(user: dict = Depends(get_current_user)):
    return {"personas": []}
