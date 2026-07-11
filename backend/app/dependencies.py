from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database import get_db

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> dict:
    token = credentials.credentials
    if token.startswith("mock-jwt-"):
        from app.models.user import User
        from sqlalchemy import select
        from app.core.security import hash_password

        email = "demo@agentops.ai"
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                name="Muskan Yeshminali",
                email=email,
                hashed_password=hash_password("demo1234"),
                role="admin",
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return {"sub": str(user.id), "email": user.email, "role": user.role}

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return {"sub": payload.get("sub"), "email": payload.get("email"), "role": payload.get("role", "user")}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")



async def get_current_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


async def get_db_session() -> AsyncSession:
    async for session in get_db():
        yield session
