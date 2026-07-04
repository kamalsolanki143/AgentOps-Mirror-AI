from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, AuthResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        user, access_token, refresh_token = await service.register_with_tokens(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return AuthResponse(
        id=user.id, name=user.name, email=user.email, role=user.role,
        access_token=access_token, refresh_token=refresh_token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        user, access_token, refresh_token = await service.login(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return AuthResponse(
        id=user.id, name=user.name, email=user.email, role=user.role,
        access_token=access_token, refresh_token=refresh_token,
    )


@router.post("/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        access_token, refresh_token = await service.refresh(req.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(user_data: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from app.services.user_service import UserService
    user_id = int(user_data["sub"])
    user = await UserService(db).get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
