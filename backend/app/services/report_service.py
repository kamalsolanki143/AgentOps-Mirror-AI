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

    async def get_report_detail(self, report: Report) -> dict:
        from app.models.stress_test_run import StressTestRun
        from app.models.agent import Agent
        from app.models.finding import Finding
        from app.models.risk_score import RiskScore
        from app.models.conversation import Conversation
        
        # Get run
        run_res = await self.db.execute(select(StressTestRun).where(StressTestRun.id == report.stress_test_run_id))
        run = run_res.scalar_one()

        # Get agent
        agent_name = "Unknown Agent"
        agent_id = ""
        if run.agent_id:
            agent_res = await self.db.execute(select(Agent).where(Agent.id == run.agent_id))
            agent = agent_res.scalar_one_or_none()
            if agent:
                agent_name = agent.name
                agent_id = str(agent.id)

        # Get risk scores
        rs_res = await self.db.execute(select(RiskScore).where(RiskScore.stress_test_run_id == run.id))
        risk_scores = list(rs_res.scalars().all())
        scores_dict = {rs.category: int(rs.score * 100) for rs in risk_scores}

        # Build score breakdown
        scores = {
            "reliability": scores_dict.get("reliability", 85),
            "security": scores_dict.get("security", 80),
            "businessGoal": scores_dict.get("business_goal", 75),
            "hallucination": scores_dict.get("hallucination", 90),
            "quality": scores_dict.get("quality", 85),
            "latency": scores_dict.get("latency", 90),
            "overall": int(run.overall_score * 100) if run.overall_score is not None else 80,
        }

        # Get findings (risks)
        f_res = await self.db.execute(select(Finding).where(Finding.stress_test_run_id == run.id))
        findings = list(f_res.scalars().all())

        critical = sum(1 for f in findings if f.severity == "critical")
        medium = sum(1 for f in findings if f.severity == "medium")
        low = sum(1 for f in findings if f.severity == "low")
        safe = 0

        risk_summary = {
            "critical": critical,
            "medium": medium,
            "low": low,
            "safe": safe,
        }

        # Format risks list
        risks = []
        for f in findings:
            persona_name = "System"
            persona_emoji = "🤖"
            persona_id = ""
            message_excerpt = ""

            if f.conversation_id:
                conv_res = await self.db.execute(select(Conversation).where(Conversation.id == f.conversation_id))
                conv = conv_res.scalar_one_or_none()
                if conv and conv.persona:
                    persona_name = conv.persona.name
                    persona_emoji = conv.persona.emoji
                    persona_id = str(conv.persona.id)

                if f.description:
                    message_excerpt = f.description
                elif f.details_json:
                    message_excerpt = f.details_json

            risks.append({
                "id": str(f.id),
                "level": f.severity,
                "type": f.finding_type,
                "title": f.title,
                "description": f.description or f.title,
                "personaId": persona_id,
                "personaName": persona_name,
                "personaEmoji": persona_emoji,
                "conversationId": str(f.conversation_id) if f.conversation_id else "",
                "messageExcerpt": message_excerpt or "No excerpt available",
                "recommendation": "Review agent logs and apply prompt guardrails for security and formatting.",
                "count": 1,
            })

        total_convs = run.total_personas
        flagged_convs = len(set(f.conversation_id for f in findings if f.conversation_id))

        return {
            "id": str(report.id),
            "runId": str(run.id),
            "agentId": agent_id,
            "agentName": agent_name,
            "status": "ready" if report.status == "completed" else "generating" if report.status == "generating" else "failed",
            "scores": scores,
            "risks": risks,
            "riskSummary": risk_summary,
            "totalConversations": total_convs,
            "flaggedConversations": flagged_convs,
            "generatedAt": report.created_at,
            "createdAt": report.created_at,
        }

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
