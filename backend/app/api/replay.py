from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.conversation import ConversationResponse
from app.services.replay_service import ReplayService
from app.dependencies import get_current_user
from sqlalchemy import select

router = APIRouter()


async def get_rich_conversation_response(conv, db: AsyncSession) -> ConversationResponse:
    from app.models.finding import Finding
    from app.models.report import Report
    from app.models.transcript_message import TranscriptMessage
    from app.models.agent import Agent
    from app.models.stress_test_run import StressTestRun
    from app.models.persona import Persona
    import json
    
    # Get run
    run_res = await db.execute(select(StressTestRun).where(StressTestRun.id == conv.stress_test_run_id))
    run = run_res.scalar_one()

    # Get agent details
    agent_name = "Unknown Agent"
    agent_id = ""
    if run.agent_id:
        agent_res = await db.execute(select(Agent).where(Agent.id == run.agent_id))
        agent = agent_res.scalar_one_or_none()
        if agent:
            agent_name = agent.name
            agent_id = str(agent.id)

    # Get persona details
    persona_name = "Unknown"
    persona_emoji = "🤖"
    persona_color = "#6C5CE7"
    if conv.persona_id:
        persona_res = await db.execute(select(Persona).where(Persona.id == conv.persona_id))
        persona = persona_res.scalar_one_or_none()
        if persona:
            persona_name = persona.name
            persona_emoji = persona.emoji
            persona_color = persona.color

    # Get report ID if any
    rep_res = await db.execute(select(Report).where(Report.stress_test_run_id == run.id))
    report = rep_res.scalars().first()
    report_id = str(report.id) if report else ""

    # Get findings
    findings_res = await db.execute(select(Finding).where(Finding.conversation_id == conv.id))
    findings = list(findings_res.scalars().all())

    # Get messages
    messages_res = await db.execute(
        select(TranscriptMessage)
        .where(TranscriptMessage.conversation_id == conv.id)
        .order_by(TranscriptMessage.message_index)
    )
    messages = list(messages_res.scalars().all())

    formatted_messages = []
    flag_count = len(findings)

    for msg in messages:
        latency_ms = None
        reasoning = None
        annotations = []

        if msg.metadata_json:
            try:
                meta = json.loads(msg.metadata_json)
                latency_ms = meta.get("latency_ms")
                reasoning = meta.get("reasoning")
            except Exception:
                pass

        # Match any findings for this message
        msg_findings = [f for f in findings if f.finding_type.lower() in msg.content.lower() or (f.description and msg.content.lower() in f.description.lower())]
        if msg.role == "assistant" and msg_findings:
            for f in msg_findings:
                annotations.append({
                    "type": f.finding_type,
                    "severity": f.severity,
                    "label": f.title,
                    "detail": f.description or f.title,
                    "score": int(f.score * 100) if f.score is not None else 85
                })

        if not annotations:
            annotations.append({
                "type": "safe",
                "severity": "info",
                "label": "Safe Response",
                "detail": "No issues detected during automatic audit."
            })

        formatted_messages.append({
            "id": str(msg.id),
            "index": msg.message_index,
            "role": msg.role,
            "content": msg.content,
            "timestamp": msg.created_at,
            "latencyMs": latency_ms,
            "annotations": annotations,
            "reasoning": reasoning
        })

    health_score = max(0, 100 - flag_count * 25)

    duration_ms = 0
    if conv.started_at and conv.completed_at:
        duration_ms = int((conv.completed_at - conv.started_at).total_seconds() * 1000)

    summary = f"Conversation with {persona_name} resolved. Status: {conv.status.upper()}."
    if flag_count > 0:
        summary += f" Detected {flag_count} issue(s) including: {', '.join(f.title for f in findings)}."

    return ConversationResponse(
        id=str(conv.id),
        runId=str(run.id),
        reportId=report_id,
        agentId=agent_id,
        agentName=agent_name,
        personaId=str(conv.persona_id),
        personaName=persona_name,
        personaEmoji=persona_emoji,
        personaColor=persona_color,
        healthScore=health_score,
        messages=formatted_messages,
        summary=summary,
        flagCount=flag_count,
        durationMs=duration_ms,
        startedAt=conv.started_at or conv.created_at,
        completedAt=conv.completed_at or conv.created_at
    )


@router.get("/run/{run_id}", response_model=list[ConversationResponse])
async def get_run_conversations(
    run_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReplayService(db)
    conversations = await service.get_conversations_for_run(run_id, skip=skip, limit=limit)
    return [await get_rich_conversation_response(conv, db) for conv in conversations]


@router.get("/conversation/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReplayService(db)
    conv = await service.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return await get_rich_conversation_response(conv, db)


@router.get("/run/{run_id}/failed", response_model=list[ConversationResponse])
async def get_failed_conversations(
    run_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReplayService(db)
    conversations = await service.get_failed_conversations(run_id)
    return [await get_rich_conversation_response(conv, db) for conv in conversations]
