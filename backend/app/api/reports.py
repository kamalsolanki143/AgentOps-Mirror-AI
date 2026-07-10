from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.report import ReportResponse
from app.services.report_service import ReportService
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    run_id: int,
    title: str | None = None,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = ReportService(db)
    report = await service.generate(user_id, run_id, title)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return report


@router.get("/", response_model=list[ReportResponse])
async def list_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = ReportService(db)
    return await service.list_by_user(user_id, skip=skip, limit=limit)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportService(db)
    report = await service.get_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report
