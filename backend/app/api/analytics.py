from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.analytics_service import AnalyticsService
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/dashboard")
async def dashboard(
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = AnalyticsService(db)
    return await service.get_dashboard(user_id)


@router.get("/risk-distribution")
async def risk_distribution(
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = AnalyticsService(db)
    return await service.get_risk_distribution(user_id)


@router.get("/finding-trends")
async def finding_trends(
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = AnalyticsService(db)
    return await service.get_finding_trends(user_id)


@router.get("/time-series")
async def time_series(
    days: int = Query(30, ge=1, le=365),
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = AnalyticsService(db)
    return await service.get_time_series(user_id, days)
