from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.api import auth, users, agents, stress_test, personas, reports, replay, analytics, integrations, health, websocket
from app.database import engine, Base

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

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


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
