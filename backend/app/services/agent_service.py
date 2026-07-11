from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate


class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_agent_response(self, agent: Agent) -> dict:
        from app.models.stress_test_run import StressTestRun

        # Get count of runs
        count_res = await self.db.execute(
            select(func.count(StressTestRun.id)).where(StressTestRun.agent_id == agent.id)
        )
        tests_run = count_res.scalar_one()

        # Get avg score
        avg_res = await self.db.execute(
            select(func.avg(StressTestRun.overall_score)).where(
                StressTestRun.agent_id == agent.id,
                StressTestRun.overall_score.isnot(None)
            )
        )
        avg_score = avg_res.scalar_one()
        avg_health = int(avg_score * 100) if avg_score is not None else 0

        # Get last run
        last_res = await self.db.execute(
            select(StressTestRun)
            .where(StressTestRun.agent_id == agent.id)
            .order_by(StressTestRun.created_at.desc())
            .limit(1)
        )
        last_run = last_res.scalar_one_or_none()

        health_score = int(last_run.overall_score * 100) if last_run and last_run.overall_score is not None else avg_health
        
        # Determine status
        if not last_run:
            status = "idle"
            health_score = 0
        else:
            status = "healthy" if health_score >= 80 else "warning" if health_score >= 60 else "critical"

        # Parse tags
        tags_list = []
        if agent.tags:
            tags_list = [t.strip() for t in agent.tags.split(",") if t.strip()]

        return {
            "id": str(agent.id),
            "user_id": agent.user_id,
            "name": agent.name,
            "description": agent.description,
            "connector": agent.model_type,
            "endpoint": agent.endpoint,
            "status": status,
            "tags": tags_list,
            "healthScore": health_score,
            "lastRunAt": last_run.created_at if last_run else None,
            "lastRunId": str(last_run.id) if last_run else None,
            "testsRun": tests_run,
            "avgHealthScore": avg_health,
            "createdAt": agent.created_at,
            "updatedAt": agent.updated_at,
        }

    async def create(self, user_id: int, req: AgentCreate) -> Agent:
        agent = Agent(
            user_id=user_id,
            name=req.name,
            description=req.description,
            model_type=req.model_type,
            endpoint=req.endpoint,
            tags=",".join(req.tags) if req.tags else "",
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
            if key == "tags" and isinstance(value, list):
                setattr(agent, key, ",".join(value))
            else:
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
