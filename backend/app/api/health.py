from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.database import check_db_connection
from app.core.redis import check_redis_connection

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health_check():
    db_ok = await check_db_connection()
    redis_ok = await check_redis_connection()
    status = "healthy" if db_ok and redis_ok else "degraded"
    return HealthResponse(
        status=status,
        version="1.0.0",
        database="connected" if db_ok else "disconnected",
        redis="connected" if redis_ok else "disconnected",
    )


@router.get("/live")
async def liveness():
    return {"status": "alive"}


@router.get("/ready")
async def readiness():
    db_ok = await check_db_connection()
    redis_ok = await check_redis_connection()
    if not db_ok or not redis_ok:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"database": "connected" if db_ok else "disconnected", "redis": "connected" if redis_ok else "disconnected"},
        )
    return {"status": "ready", "database": "connected", "redis": "connected"}
