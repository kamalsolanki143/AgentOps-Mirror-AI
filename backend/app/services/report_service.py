from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.report import Report
from app.models.stress_test_run import StressTestRun
from app.models.finding import Finding
from app.models.risk_score import RiskScore


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate(self, user_id: int, run_id: int, title: str | None = None) -> Report | None:
        run = await self.db.execute(select(StressTestRun).where(StressTestRun.id == run_id))
        run = run.scalar_one_or_none()
        if not run:
            return None

        findings = await self.db.execute(select(Finding).where(Finding.stress_test_run_id == run_id))
        findings = list(findings.scalars().all())

        risk_scores = await self.db.execute(select(RiskScore).where(RiskScore.stress_test_run_id == run_id))
        risk_scores = list(risk_scores.scalars().all())

        report_data = {
            "run_id": run_id,
            "status": run.status,
            "overall_score": run.overall_score,
            "total_personas": run.total_personas,
            "completed_personas": run.completed_personas,
            "findings": [
                {"type": f.finding_type, "severity": f.severity, "title": f.title, "score": f.score}
                for f in findings
            ],
            "risk_scores": {rs.category: rs.score for rs in risk_scores},
        }

        report = Report(
            user_id=user_id,
            stress_test_run_id=run_id,
            title=title or f"Report for Run #{run_id}",
            report_data=str(report_data),
            summary=self._build_summary(run, findings, risk_scores),
            status="completed",
        )
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def get_by_id(self, report_id: int) -> Report | None:
        result = await self.db.execute(select(Report).where(Report.id == report_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Report]:
        result = await self.db.execute(
            select(Report)
            .where(Report.user_id == user_id)
            .order_by(Report.created_at.desc())
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    def _build_summary(self, run, findings, risk_scores) -> str:
        risk_summary = {rs.category: f"{rs.score:.1f}" for rs in risk_scores}
        finding_summary = {}
        for f in findings:
            finding_summary[f.finding_type] = finding_summary.get(f.finding_type, 0) + 1
        return (
            f"Run #{run.id} completed with status '{run.status}'. "
            f"Overall score: {run.overall_score}. "
            f"Findings: {finding_summary}. "
            f"Risk scores: {risk_summary}."
        )
