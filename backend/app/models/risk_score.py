import datetime
from sqlalchemy import String, Text, Float, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[int] = mapped_column(primary_key=True)
    stress_test_run_id: Mapped[int] = mapped_column(ForeignKey("stress_test_runs.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    details_json: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    stress_test_run = relationship("StressTestRun", back_populates="risk_scores")
