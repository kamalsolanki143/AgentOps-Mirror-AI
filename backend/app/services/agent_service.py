from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate


class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, req: AgentCreate) -> Agent:
        agent = Agent(
            user_id=user_id,
            name=req.name,
            description=req.description,
            model_type=req.model_type,
            endpoint=req.endpoint,
            tags=req.tags,
        )
        self.db.add(agent)
        await self.db.commit()
        await self.db.refresh(agent)
        return agent

    async def get_by_id(self, agent_id: int) -> Agent | None:
        result = await self.db.execute(select(Agent).where(Agent.id == agent_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Agent]:
        result = await self.db.execute(
            select(Agent).where(Agent.user_id == user_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def update(self, agent_id: int, req: AgentUpdate) -> Agent | None:
        agent = await self.get_by_id(agent_id)
        if not agent:
            return None
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(agent, key, value)
        await self.db.commit()
        await self.db.refresh(agent)
        return agent

    async def delete(self, agent_id: int) -> bool:
        agent = await self.get_by_id(agent_id)
        if not agent:
            return False
        await self.db.delete(agent)
        await self.db.commit()
        return True
