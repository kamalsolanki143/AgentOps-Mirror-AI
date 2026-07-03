from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import set

router = APIRouter()

active_connections: dict[str, set[WebSocket]] = {}


@router.websocket("/{test_id}")
async def websocket_endpoint(websocket: WebSocket, test_id: str):
    await websocket.accept()
    if test_id not in active_connections:
        active_connections[test_id] = set()
    active_connections[test_id].add(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[test_id].discard(websocket)
        if not active_connections[test_id]:
            del active_connections[test_id]
