import datetime
from sqlalchemy import String, Text, DateTime, func, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Persona(Base):
    __tablename__ = "personas"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="standard", server_default="standard")
    language: Mapped[str] = mapped_column(String(50), default="en", server_default="en")
    difficulty: Mapped[str] = mapped_column(String(50), default="medium", server_default="medium")
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    personality: Mapped[str] = mapped_column(Text, default="", nullable=False)
    goal: Mapped[dict] = mapped_column(JSON, default=dict, server_default="{}", nullable=False)
    sample_opener: Mapped[str] = mapped_column(Text, default="", nullable=False)
    tags: Mapped[list] = mapped_column(JSON, default=list, server_default="[]", nullable=False)
    color: Mapped[str] = mapped_column(String(50), default="#6C5CE7", server_default="#6C5CE7")
    emoji: Mapped[str] = mapped_column(String(50), default="🤖", server_default="🤖")
    success_rate: Mapped[int] = mapped_column(default=0, server_default="0")
    is_built_in: Mapped[bool] = mapped_column(default=False, server_default="false")
    
    persona_type: Mapped[str] = mapped_column(String(100), default="standard", server_default="standard")
    behavior_description: Mapped[str | None] = mapped_column(Text)
    attack_style: Mapped[str | None] = mapped_column(String(100))
    traits: Mapped[dict | None] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="personas")
    stress_test_runs = relationship("StressTestRun", secondary="run_personas", back_populates="personas")
    conversations = relationship("Conversation", back_populates="persona")

