from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.persona import PersonaCreate, PersonaUpdate, PersonaResponse, PersonaListResponse
from app.services.persona_service import PersonaService
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
async def create_persona(
    req: PersonaCreate,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = PersonaService(db)
    return await service.create(user_id, req)


@router.get("/", response_model=PersonaListResponse)
async def list_personas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = PersonaService(db)
    personas = await service.list_by_user(user_id, skip=skip, limit=limit)
    total = await service.count_by_user(user_id)
    return {"personas": personas, "total": total}



@router.get("/{persona_id}", response_model=PersonaResponse)
async def get_persona(
    persona_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PersonaService(db)
    persona = await service.get_by_id(persona_id)
    if not persona:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
    return persona


@router.put("/{persona_id}", response_model=PersonaResponse)
async def update_persona(
    persona_id: int,
    req: PersonaUpdate,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PersonaService(db)
    persona = await service.update(persona_id, req)
    if not persona:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
    return persona


@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_persona(
    persona_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PersonaService(db)
    deleted = await service.delete(persona_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
