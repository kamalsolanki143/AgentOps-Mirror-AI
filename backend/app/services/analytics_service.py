from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.stress_test_run import StressTestRun
from app.models.finding import Finding
from app.models.risk_score import RiskScore


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard(self, user_id: int) -> dict:
        total_runs = await self.db.scalar(
            select(func.count(StressTestRun.id)).where(StressTestRun.user_id == user_id)
        )
        completed_runs = await self.db.scalar(
            select(func.count(StressTestRun.id)).where(
                StressTestRun.user_id == user_id,
                StressTestRun.status == "completed",
            )
        )
        failed_runs = await self.db.scalar(
            select(func.count(StressTestRun.id)).where(
                StressTestRun.user_id == user_id,
                StressTestRun.status == "failed",
            )
        )
        avg_score = await self.db.scalar(
            select(func.avg(StressTestRun.overall_score)).where(
                StressTestRun.user_id == user_id,
                StressTestRun.overall_score.isnot(None),
            )
        )
        recent_runs = await self.db.execute(
            select(StressTestRun)
            .where(StressTestRun.user_id == user_id)
            .order_by(StressTestRun.created_at.desc())
            .limit(10)
        )
        recent = [
            {"id": r.id, "status": r.status, "score": r.overall_score, "created_at": r.created_at.isoformat()}
            for r in recent_runs.scalars().all()
        ]
        return {
            "total_runs": total_runs or 0,
            "completed_runs": completed_runs or 0,
            "failed_runs": failed_runs or 0,
            "average_score": round(float(avg_score), 2) if avg_score else None,
            "recent_runs": recent,
        }

    async def get_risk_distribution(self, user_id: int) -> list[dict]:
        result = await self.db.execute(
            select(
                RiskScore.category,
                func.avg(RiskScore.score).label("avg_score"),
                func.count(RiskScore.id).label("count"),
            )
            .join(StressTestRun)
            .where(StressTestRun.user_id == user_id)
            .group_by(RiskScore.category)
        )
        return [
            {"category": row.category, "average_score": round(float(row.avg_score), 2), "count": row.count}
            for row in result.all()
        ]

    async def get_finding_trends(self, user_id: int) -> list[dict]:
        result = await self.db.execute(
            select(
                Finding.finding_type,
                func.count(Finding.id).label("count"),
            )
            .join(StressTestRun)
            .where(StressTestRun.user_id == user_id)
            .group_by(Finding.finding_type)
            .order_by(func.count(Finding.id).desc())
        )
        return [
            {"finding_type": row.finding_type, "count": row.count}
            for row in result.all()
        ]

    async def get_time_series(self, user_id: int, days: int = 30) -> list[dict]:
        result = await self.db.execute(
            select(
                func.date(StressTestRun.created_at).label("date"),
                func.count(StressTestRun.id).label("count"),
                func.avg(StressTestRun.overall_score).label("avg_score"),
            )
            .where(
                StressTestRun.user_id == user_id,
                StressTestRun.created_at >= func.now() - func.make_interval(days=days),
            )
            .group_by(func.date(StressTestRun.created_at))
            .order_by(func.date(StressTestRun.created_at))
        )
        return [
            {"date": str(row.date), "runs": row.count, "average_score": round(float(row.avg_score), 2) if row.avg_score else None}
            for row in result.all()
        ]
