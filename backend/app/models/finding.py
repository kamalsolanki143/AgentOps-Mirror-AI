import datetime
from sqlalchemy import String, Text, Float, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    stress_test_run_id: Mapped[int] = mapped_column(ForeignKey("stress_test_runs.id"), nullable=False, index=True)
    conversation_id: Mapped[int | None] = mapped_column(ForeignKey("conversations.id"))
    finding_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(50), default="medium", server_default="medium")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    details_json: Mapped[str | None] = mapped_column(Text)
    score: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    stress_test_run = relationship("StressTestRun", back_populates="findings")
    conversation = relationship("Conversation", back_populates="findings")
