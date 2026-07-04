import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.auth_service import AuthService
from app.services.agent_service import AgentService
from app.services.persona_service import PersonaService
from app.schemas.auth import RegisterRequest, LoginRequest
from app.schemas.agent import AgentCreate
from app.schemas.persona import PersonaCreate


@pytest.fixture
def mock_db():
    return AsyncMock(spec=AsyncSession)


@pytest.mark.asyncio
async def test_auth_register_duplicate_email(mock_db):
    mock_db.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=MagicMock())))
    service = AuthService(mock_db)
    with pytest.raises(ValueError, match="Email already registered"):
        await service.register(RegisterRequest(name="T", email="t@t.com", password="p"))


@pytest.mark.asyncio
async def test_agent_create(mock_db):
    service = AgentService(mock_db)
    req = AgentCreate(name="Test Agent")
    result = await service.create(1, req)
    assert result.name == "Test Agent"
    assert result.user_id == 1


@pytest.mark.asyncio
async def test_persona_create(mock_db):
    service = PersonaService(mock_db)
    req = PersonaCreate(name="Test Persona")
    result = await service.create(1, req)
    assert result.name == "Test Persona"
