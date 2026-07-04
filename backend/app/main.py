from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.database import engine, Base
from app.core.redis import close_redis
from app.logging import logger

from app.api import (
    auth, users, agents, stress_test, personas, reports,
    replay, analytics, integrations, health, websocket,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up", app=settings.APP_NAME)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")
    yield
    logger.info("Shutting down")
    await close_redis()
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["Agents"])
app.include_router(stress_test.router, prefix="/api/v1/stress-test", tags=["Stress Test"])
app.include_router(personas.router, prefix="/api/v1/personas", tags=["Personas"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(replay.router, prefix="/api/v1/replay", tags=["Replay"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(integrations.router, prefix="/api/v1/integrations", tags=["Integrations"])
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])

Instrumentator().instrument(app).expose(app)


@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "version": "1.0.0", "docs": "/docs"}
