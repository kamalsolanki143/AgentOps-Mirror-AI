import json
import asyncio
from fastapi import WebSocket
from typing import Set, Dict
from app.core.redis import get_redis


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, run_id: str, websocket: WebSocket):
        await websocket.accept()
        if run_id not in self.active:
            self.active[run_id] = set()
        self.active[run_id].add(websocket)

    def disconnect(self, run_id: str, websocket: WebSocket):
        if run_id in self.active:
            self.active[run_id].discard(websocket)
            if not self.active[run_id]:
                del self.active[run_id]

    async def broadcast(self, run_id: str, event: dict):
        if run_id not in self.active:
            return
        message = json.dumps(event)
        stale = set()
        for ws in self.active[run_id]:
            try:
                await ws.send_text(message)
            except Exception:
                stale.add(ws)
        for ws in stale:
            self.active[run_id].discard(ws)
        if run_id in self.active and not self.active[run_id]:
            del self.active[run_id]

    async def send_personal(self, run_id: str, websocket: WebSocket, event: dict):
        try:
            await websocket.send_text(json.dumps(event))
        except Exception:
            self.disconnect(run_id, websocket)


manager = ConnectionManager()


async def listen_redis_pubsub(run_id: str):
    r = await get_redis()
    pubsub = r.pubsub()
    await pubsub.subscribe(f"run:{run_id}")
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message["type"] == "message":
                event = json.loads(message["data"])
                await manager.broadcast(run_id, event)
            await asyncio.sleep(0.01)
    except asyncio.CancelledError:
        pass
    finally:
        await pubsub.unsubscribe(f"run:{run_id}")
