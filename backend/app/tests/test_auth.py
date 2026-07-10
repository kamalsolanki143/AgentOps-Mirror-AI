import pytest
import uuid
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session")
def event_loop():
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def client():
    from app.main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_register(client):
    email = f"test-{uuid.uuid4().hex[:8]}@example.com"
    response = await client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": email, "password": "testpass123"},
    )
    assert response.status_code in (200, 201)
    resp_data = response.json()
    assert resp_data["email"] == email


@pytest.mark.asyncio
async def test_login_invalid(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrong"},
    )
    assert response.status_code == 401
