from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.stress_test import StressTestCreate, StressTestResponse, RunListResponse
from app.schemas.finding import FindingResponse
from app.services.stress_test_service import StressTestService
from app.dependencies import get_current_user
from app.models.finding import Finding

router = APIRouter()


@router.post("/", response_model=StressTestResponse, status_code=status.HTTP_201_CREATED)
async def create_stress_test(
    req: StressTestCreate,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = StressTestService(db)
    run = await service.create_run(user_id, req)
    return await service.get_run_detail(run)


@router.get("/", response_model=RunListResponse)
async def list_stress_tests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(user_data["sub"])
    service = StressTestService(db)
    runs = await service.list_runs(user_id, skip=skip, limit=limit)
    
    formatted = [await service.get_run_detail(r) for r in runs]
    
    # Get total count of runs
    from sqlalchemy import select, func
    from app.models.stress_test_run import StressTestRun
    total = await db.scalar(select(func.count(StressTestRun.id)).where(StressTestRun.user_id == user_id)) or 0
    
    return {"runs": formatted, "total": total}


@router.get("/{run_id}", response_model=StressTestResponse)
async def get_stress_test(
    run_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = StressTestService(db)
    run = await service.get_run(run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return await service.get_run_detail(run)


@router.post("/{run_id}/start", response_model=StressTestResponse)
async def start_stress_test(
    run_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = StressTestService(db)
    run = await service.start_run(run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return await service.get_run_detail(run)


@router.post("/{run_id}/cancel", response_model=StressTestResponse)
async def cancel_stress_test(
    run_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = StressTestService(db)
    run = await service.cancel_run(run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Run cannot be cancelled")
    return await service.get_run_detail(run)


@router.get("/{run_id}/metrics")
async def get_run_metrics(
    run_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = StressTestService(db)
    metrics = await service.get_run_metrics(run_id)
    if not metrics:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return metrics


@router.get("/{run_id}/findings", response_model=list[FindingResponse])
async def get_run_findings(
    run_id: int,
    user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    result = await db.execute(select(Finding).where(Finding.stress_test_run_id == run_id))
    findings = list(result.scalars().all())
    return findings
