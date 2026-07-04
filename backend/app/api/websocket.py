import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_service import manager, listen_redis_pubsub

router = APIRouter()


@router.websocket("/run/{run_id}")
async def websocket_run(websocket: WebSocket, run_id: str):
    await manager.connect(run_id, websocket)
    listener_task = asyncio.create_task(listen_redis_pubsub(run_id))
    try:
        await manager.send_personal(run_id, websocket, {
            "event": "connected",
            "run_id": run_id,
            "message": "Listening for run updates",
        })
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await manager.send_personal(run_id, websocket, {"event": "pong"})
    except WebSocketDisconnect:
        pass
    finally:
        listener_task.cancel()
        manager.disconnect(run_id, websocket)
