from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import RegisterRequest, LoginRequest


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, req: RegisterRequest) -> User:
        existing = await self.db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none():
            raise ValueError("Email already registered")
        user = User(
            name=req.name,
            email=req.email,
            hashed_password=hash_password(req.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def register_with_tokens(self, req: RegisterRequest) -> tuple[User, str, str]:
        user = await self.register(req)
        access_token = create_access_token(str(user.id), {"email": user.email, "role": user.role})
        refresh_token = create_refresh_token(str(user.id))
        return user, access_token, refresh_token

    async def login(self, req: LoginRequest) -> tuple[User, str, str]:
        result = await self.db.execute(select(User).where(User.email == req.email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(req.password, user.hashed_password):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account is disabled")
        access_token = create_access_token(str(user.id), {"email": user.email, "role": user.role})
        refresh_token = create_refresh_token(str(user.id))
        return user, access_token, refresh_token

    async def refresh(self, refresh_token: str) -> tuple[str, str]:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")
        user_id = payload.get("sub")
        result = await self.db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        new_access = create_access_token(str(user.id), {"email": user.email, "role": user.role})
        new_refresh = create_refresh_token(str(user.id))
        return new_access, new_refresh
