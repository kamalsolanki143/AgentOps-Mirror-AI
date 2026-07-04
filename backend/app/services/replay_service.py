from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation import Conversation
from app.models.transcript_message import TranscriptMessage


class ReplayService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_conversations_for_run(self, run_id: int, skip: int = 0, limit: int = 100) -> list[Conversation]:
        result = await self.db.execute(
            select(Conversation)
            .where(Conversation.stress_test_run_id == run_id)
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_conversation(self, conversation_id: int) -> Conversation | None:
        result = await self.db.execute(select(Conversation).where(Conversation.id == conversation_id))
        return result.scalar_one_or_none()

    async def get_messages(self, conversation_id: int, skip: int = 0, limit: int = 500) -> list[TranscriptMessage]:
        result = await self.db.execute(
            select(TranscriptMessage)
            .where(TranscriptMessage.conversation_id == conversation_id)
            .order_by(TranscriptMessage.message_index)
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_failed_conversations(self, run_id: int) -> list[Conversation]:
        result = await self.db.execute(
            select(Conversation)
            .where(Conversation.stress_test_run_id == run_id)
            .where(Conversation.status == "failed")
        )
        return list(result.scalars().all())
