import datetime
from sqlalchemy import String, Text, Integer, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    stress_test_run_id: Mapped[int] = mapped_column(ForeignKey("stress_test_runs.id"), nullable=False, index=True)
    persona_id: Mapped[int] = mapped_column(ForeignKey("personas.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="in_progress", server_default="in_progress")
    message_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    started_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    stress_test_run = relationship("StressTestRun", back_populates="conversations")
    persona = relationship("Persona", back_populates="conversations")
    messages = relationship("TranscriptMessage", back_populates="conversation", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="conversation")
