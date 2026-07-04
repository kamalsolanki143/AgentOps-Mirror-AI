from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.conversation import ConversationResponse, TranscriptMessageResponse
from app.services.replay_service import ReplayService
from app.dependencies import get_current_user

router = APIRouter()


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
    result = []
    for conv in conversations:
        messages = await service.get_messages(conv.id)
        result.append(ConversationResponse(
            id=conv.id,
            persona_id=conv.persona_id,
            status=conv.status,
            message_count=conv.message_count,
            messages=[TranscriptMessageResponse.model_validate(m) for m in messages],
            created_at=conv.created_at,
        ))
    return result


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
    messages = await service.get_messages(conversation_id)
    return ConversationResponse(
        id=conv.id,
        persona_id=conv.persona_id,
        status=conv.status,
        message_count=conv.message_count,
        messages=[TranscriptMessageResponse.model_validate(m) for m in messages],
        created_at=conv.created_at,
    )


@router.get("/run/{run_id}/failed", response_model=list[ConversationResponse])
async def get_failed_conversations(
    run_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReplayService(db)
    conversations = await service.get_failed_conversations(run_id)
    result = []
    for conv in conversations:
        messages = await service.get_messages(conv.id)
        result.append(ConversationResponse(
            id=conv.id,
            persona_id=conv.persona_id,
            status=conv.status,
            message_count=conv.message_count,
            messages=[TranscriptMessageResponse.model_validate(m) for m in messages],
            created_at=conv.created_at,
        ))
    return result
