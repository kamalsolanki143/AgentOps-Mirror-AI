from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def update(self, user_id: int, name: str | None = None, email: str | None = None) -> User | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def list_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        result = await self.db.execute(select(User).offset(skip).limit(limit))
        return list(result.scalars().all())
