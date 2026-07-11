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
        config_data = {
            "difficulty": req.difficulty or "medium",
            "conversationsPerPersona": req.conversations_per_persona or 3,
            "timeoutMs": req.timeout_ms or 30000
        }
        run = StressTestRun(
            user_id=user_id,
            agent_id=req.agent_id,
            name=req.name or f"Stress Test Run {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            config_json=json.dumps(config_data),
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

    async def get_run_detail(self, run: StressTestRun) -> dict:
        from app.models.agent import Agent
        from app.models.finding import Finding
        from app.models.conversation import Conversation
        from app.models.risk_score import RiskScore
        
        # Get agent name
        agent_name = "Unknown Agent"
        if run.agent_id:
            agent_res = await self.db.execute(select(Agent).where(Agent.id == run.agent_id))
            agent = agent_res.scalar_one_or_none()
            if agent:
                agent_name = agent.name

        # Parse config_json
        config = {
            "agentId": str(run.agent_id) if run.agent_id else "",
            "selectedPersonaIds": [],
            "difficulty": "medium",
            "conversationsPerPersona": 3,
            "timeoutMs": 30000
        }
        if run.config_json:
            try:
                parsed_config = json.loads(run.config_json)
                config.update(parsed_config)
            except Exception:
                pass

        # Load personas associated with run
        personas_res = await self.db.execute(
            select(run_personas.c.persona_id).where(run_personas.c.run_id == run.id)
        )
        config["selectedPersonaIds"] = [str(pid) for pid in personas_res.scalars().all()]

        # Query metrics
        finding_res = await self.db.execute(select(Finding).where(Finding.stress_test_run_id == run.id))
        findings = list(finding_res.scalars().all())

        critical_risks = sum(1 for f in findings if f.severity == "critical")
        medium_risks = sum(1 for f in findings if f.severity == "medium")
        low_risks = sum(1 for f in findings if f.severity == "low")
        failed_convs = len(set(f.conversation_id for f in findings if f.conversation_id))

        # Count categories in findings
        hallucination_count = sum(1 for f in findings if f.finding_type == "hallucination")
        security_count = sum(1 for f in findings if f.finding_type in ("security", "jailbreak"))
        business_goal_count = sum(1 for f in findings if f.finding_type == "business_goal")

        metrics = {
            "totalConversations": run.total_personas,
            "completedConversations": run.completed_personas,
            "failedConversations": failed_convs,
            "avgHealthScore": int(run.overall_score * 100) if run.overall_score is not None else 0,
            "criticalRisks": critical_risks,
            "mediumRisks": medium_risks,
            "lowRisks": low_risks,
            "hallucinationCount": hallucination_count,
            "securityCount": security_count,
            "businessGoalCount": business_goal_count,
        }

        # Load conversations details
        convs_res = await self.db.execute(
            select(Conversation).where(Conversation.stress_test_run_id == run.id)
        )
        conversations = []
        for conv in convs_res.scalars().all():
            # Get findings for this conversation
            conv_findings = [f for f in findings if f.conversation_id == conv.id]
            flags = []
            for cf in conv_findings:
                flags.append({
                    "type": cf.finding_type,
                    "severity": cf.severity,
                    "message": cf.description or cf.title,
                    "messageIndex": 0
                })
            
            # Persona details
            p_name = "Unknown"
            p_emoji = "🤖"
            p_color = "#6C5CE7"
            if conv.persona:
                p_name = conv.persona.name
                p_emoji = conv.persona.emoji
                p_color = conv.persona.color

            conv_health = max(0, 100 - len(flags) * 25)
            conv_risk = "safe" if len(flags) == 0 else "low" if len(flags) == 1 else "medium" if len(flags) == 2 else "critical"

            conversations.append({
                "id": str(conv.id),
                "runId": str(run.id),
                "personaId": str(conv.persona_id),
                "personaName": p_name,
                "personaEmoji": p_emoji,
                "personaColor": p_color,
                "status": conv.status,
                "healthScore": conv_health,
                "riskLevel": conv_risk,
                "messageCount": conv.message_count,
                "startedAt": conv.started_at,
                "completedAt": conv.completed_at,
                "flags": flags,
            })

        return {
            "id": str(run.id),
            "agentId": str(run.agent_id) if run.agent_id else "",
            "agentName": agent_name,
            "config": config,
            "status": run.status,
            "metrics": metrics,
            "conversations": conversations,
            "startedAt": run.started_at,
            "completedAt": run.completed_at,
            "createdAt": run.created_at,
        }

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
