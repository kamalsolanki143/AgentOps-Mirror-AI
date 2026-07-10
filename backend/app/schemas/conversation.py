import datetime
from pydantic import BaseModel


class TranscriptMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    message_index: int
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: int
    persona_id: int
    status: str
    message_count: int
    messages: list[TranscriptMessageResponse] = []
    created_at: datetime.datetime

    model_config = {"from_attributes": True}
