import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, func, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


run_personas = Table(
    "run_personas",
    Base.metadata,
    Column("run_id", ForeignKey("stress_test_runs.id"), primary_key=True),
    Column("persona_id", ForeignKey("personas.id"), primary_key=True),
)


class StressTestRun(Base):
    __tablename__ = "stress_test_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    agent_id: Mapped[int | None] = mapped_column(ForeignKey("agents.id"))
    name: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="queued", server_default="queued", index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    config_json: Mapped[str | None] = mapped_column(Text)
    total_personas: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    completed_personas: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    total_messages: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    findings_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    overall_score: Mapped[float | None] = mapped_column(Float)
    started_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="stress_test_runs")
    agent = relationship("Agent", back_populates="stress_test_runs")
    personas = relationship("Persona", secondary=run_personas, back_populates="stress_test_runs")
    conversations = relationship("Conversation", back_populates="stress_test_run")
    findings = relationship("Finding", back_populates="stress_test_run")
    risk_scores = relationship("RiskScore", back_populates="stress_test_run")
    reports = relationship("Report", back_populates="stress_test_run")
