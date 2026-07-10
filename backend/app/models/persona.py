import datetime
from sqlalchemy import String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Persona(Base):
    __tablename__ = "personas"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    persona_type: Mapped[str] = mapped_column(String(100), default="standard", server_default="standard")
    language: Mapped[str] = mapped_column(String(50), default="en", server_default="en")
    difficulty: Mapped[str] = mapped_column(String(50), default="medium", server_default="medium")
    goal: Mapped[str | None] = mapped_column(Text)
    behavior_description: Mapped[str | None] = mapped_column(Text)
    attack_style: Mapped[str | None] = mapped_column(String(100))
    traits: Mapped[dict | None] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="personas")
    stress_test_runs = relationship("StressTestRun", secondary="run_personas", back_populates="personas")
    conversations = relationship("Conversation", back_populates="persona")
