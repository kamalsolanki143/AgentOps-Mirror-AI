import json
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.stress_test_run import StressTestRun, run_personas
from app.models.conversation import Conversation
from app.models.transcript_message import TranscriptMessage
from app.models.finding import Finding
from app.models.risk_score import RiskScore
from app.schemas.stress_test import StressTestCreate
from app.core.redis import publish_event, set_run_state


class StressTestService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_run(self, user_id: int, req: StressTestCreate) -> StressTestRun:
        run = StressTestRun(
            user_id=user_id,
            agent_id=req.agent_id,
            name=req.name,
            config_json=req.config_json,
            total_personas=len(req.persona_ids),
            status="queued",
        )
        self.db.add(run)
        await self.db.commit()
        await self.db.refresh(run)

        for pid in req.persona_ids:
            await self.db.execute(run_personas.insert().values(run_id=run.id, persona_id=pid))
        await self.db.commit()
        await self.db.refresh(run)
        return run

    async def start_run(self, run_id: int) -> StressTestRun | None:
        run = await self.get_run(run_id)
        if not run:
            return None
        run.status = "running"
        run.started_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(run)
        await publish_event(f"run:{run_id}", {"event": "run_started", "run_id": run_id})
        await set_run_state(run_id, "status", "running")
        return run

    async def get_run(self, run_id: int) -> StressTestRun | None:
        result = await self.db.execute(select(StressTestRun).where(StressTestRun.id == run_id))
        return result.scalar_one_or_none()

    async def list_runs(self, user_id: int, skip: int = 0, limit: int = 100) -> list[StressTestRun]:
        result = await self.db.execute(
            select(StressTestRun)
            .where(StressTestRun.user_id == user_id)
            .order_by(StressTestRun.created_at.desc())
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def cancel_run(self, run_id: int) -> StressTestRun | None:
        run = await self.get_run(run_id)
        if not run or run.status in ("completed", "cancelled", "failed"):
            return None
        run.status = "cancelled"
        run.completed_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(run)
        await publish_event(f"run:{run_id}", {"event": "run_cancelled", "run_id": run_id})
        return run

    async def complete_run(self, run_id: int, overall_score: float | None = None) -> StressTestRun | None:
        run = await self.get_run(run_id)
        if not run:
            return None
        run.status = "completed"
        run.completed_at = datetime.now(timezone.utc)
        if overall_score is not None:
            run.overall_score = overall_score
        await self.db.commit()
        await self.db.refresh(run)
        await publish_event(f"run:{run_id}", {"event": "run_completed", "run_id": run_id, "score": overall_score})
        return run

    async def get_run_metrics(self, run_id: int) -> dict:
        run = await self.get_run(run_id)
        if not run:
            return {}
        conv_count = await self.db.scalar(
            select(func.count(Conversation.id)).where(Conversation.stress_test_run_id == run_id)
        )
        msg_count = await self.db.scalar(
            select(func.count(TranscriptMessage.id))
            .join(Conversation)
            .where(Conversation.stress_test_run_id == run_id)
        )
        finding_count = await self.db.scalar(
            select(func.count(Finding.id)).where(Finding.stress_test_run_id == run_id)
        )
        risk_scores = await self.db.execute(
            select(RiskScore).where(RiskScore.stress_test_run_id == run_id)
        )
        scores = {rs.category: rs.score for rs in risk_scores.scalars().all()}
        return {
            "total_conversations": conv_count or 0,
            "total_messages": msg_count or 0,
            "findings_count": finding_count or 0,
            "risk_scores": scores,
        }

    async def update_progress(self, run_id: int, progress: int, completed_personas: int | None = None):
        run = await self.get_run(run_id)
        if run:
            run.progress = progress
            if completed_personas is not None:
                run.completed_personas = completed_personas
            await self.db.commit()
