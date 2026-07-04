from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.integration import IntegrationCreate, IntegrationUpdate, IntegrationResponse
from app.services.integration_service import IntegrationService
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
async def create_integration(
    req: IntegrationCreate,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = IntegrationService(db)
    return await service.create(user_id, req)


@router.get("/", response_model=list[IntegrationResponse])
async def list_integrations(
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = IntegrationService(db)
    return await service.list_by_user(user_id)


@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    integration_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IntegrationService(db)
    integration = await service.get_by_id(integration_id)
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return integration


@router.put("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: int,
    req: IntegrationUpdate,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IntegrationService(db)
    integration = await service.update(integration_id, req)
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return integration


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_integration(
    integration_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IntegrationService(db)
    deleted = await service.delete(integration_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")


@router.post("/{integration_id}/toggle", response_model=IntegrationResponse)
async def toggle_integration(
    integration_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IntegrationService(db)
    integration = await service.toggle(integration_id)
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return integration
