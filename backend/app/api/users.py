from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdateRequest
from app.services.user_service import UserService
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_profile(user_data: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = int(user_data["sub"])
    service = UserService(db)
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    req: UserUpdateRequest,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = UserService(db)
    user = await service.update(user_id, name=req.name, email=req.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/", response_model=list[UserResponse])
async def list_users(
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user_data.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    service = UserService(db)
    return await service.list_users()
