from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.integration import Integration
from app.schemas.integration import IntegrationCreate, IntegrationUpdate


class IntegrationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, req: IntegrationCreate) -> Integration:
        integration = Integration(
            user_id=user_id,
            name=req.name,
            integration_type=req.integration_type,
            config_json=req.config_json,
        )
        self.db.add(integration)
        await self.db.commit()
        await self.db.refresh(integration)
        return integration

    async def get_by_id(self, integration_id: int) -> Integration | None:
        result = await self.db.execute(select(Integration).where(Integration.id == integration_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int) -> list[Integration]:
        result = await self.db.execute(
            select(Integration).where(Integration.user_id == user_id)
        )
        return list(result.scalars().all())

    async def update(self, integration_id: int, req: IntegrationUpdate) -> Integration | None:
        integration = await self.get_by_id(integration_id)
        if not integration:
            return None
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(integration, key, value)
        await self.db.commit()
        await self.db.refresh(integration)
        return integration

    async def delete(self, integration_id: int) -> bool:
        integration = await self.get_by_id(integration_id)
        if not integration:
            return False
        await self.db.delete(integration)
        await self.db.commit()
        return True

    async def toggle(self, integration_id: int) -> Integration | None:
        integration = await self.get_by_id(integration_id)
        if not integration:
            return None
        integration.enabled = not integration.enabled
        await self.db.commit()
        await self.db.refresh(integration)
        return integration
