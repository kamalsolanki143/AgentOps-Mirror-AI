import json
import redis.asyncio as aioredis
from app.config import settings

redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def check_redis_connection() -> bool:
    try:
        r = await get_redis()
        await r.ping()
        return True
    except Exception:
        return False


async def publish_event(channel: str, event: dict):
    r = await get_redis()
    await r.publish(channel, json.dumps(event))


async def set_run_state(run_id: int, key: str, value: any):
    r = await get_redis()
    await r.hset(f"run:{run_id}", key, json.dumps(value))


async def get_run_state(run_id: int, key: str) -> any:
    r = await get_redis()
    val = await r.hget(f"run:{run_id}", key)
    if val:
        return json.loads(val)
    return None
