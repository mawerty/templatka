from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from app.config import settings
from app.features.websockets.manager import manager

router = APIRouter()


async def authenticate_websocket(websocket: WebSocket, token: str | None) -> int | None:
    """Authenticate WebSocket connection using JWT token. Returns user_id or None."""
    if not settings.enable_auth:
        return None  # Auth disabled, allow anonymous connections

    if not token:
        return None

    from app.features.auth.utils import decode_access_token

    return decode_access_token(token)


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
    token: str | None = Query(default=None, description="JWT access token for authentication"),
):
    """
    WebSocket endpoint with optional JWT authentication.

    Connect with token: ws://localhost:8000/ws/my-client-id?token=<jwt_token>
    Connect without token (if auth disabled): ws://localhost:8000/ws/my-client-id
    """
    # Authenticate if auth is enabled
    user_id = await authenticate_websocket(websocket, token)

    if settings.enable_auth and user_id is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication required")
        return

    # Use user_id as part of client identifier if authenticated
    effective_client_id = f"user_{user_id}_{client_id}" if user_id else client_id

    await manager.connect(effective_client_id, websocket)
    await manager.broadcast(
        {"type": "system", "content": f"{effective_client_id} connected", "user_id": user_id},
        exclude=effective_client_id,
    )

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")

            if msg_type == "message":
                await manager.broadcast(
                    {"type": "message", "from": effective_client_id, "user_id": user_id, "content": data.get("content", "")}
                )

            elif msg_type == "join_room":
                room = data.get("room")
                if room:
                    manager.join_room(effective_client_id, room)
                    await manager.send_to_room(
                        room, {"type": "system", "content": f"{effective_client_id} joined {room}", "user_id": user_id}
                    )

            elif msg_type == "leave_room":
                room = data.get("room")
                if room:
                    manager.leave_room(effective_client_id, room)
                    await manager.send_to_room(
                        room, {"type": "system", "content": f"{effective_client_id} left {room}", "user_id": user_id}
                    )

            elif msg_type == "room_message":
                room = data.get("room")
                if room:
                    await manager.send_to_room(
                        room,
                        {
                            "type": "room_message",
                            "room": room,
                            "from": effective_client_id,
                            "user_id": user_id,
                            "content": data.get("content", ""),
                        },
                    )

            elif msg_type == "private":
                to_client = data.get("to")
                if to_client:
                    await manager.send_to_client(
                        to_client,
                        {"type": "private", "from": effective_client_id, "user_id": user_id, "content": data.get("content", "")},
                    )

    except WebSocketDisconnect:
        manager.disconnect(effective_client_id)
        await manager.broadcast(
            {"type": "system", "content": f"{effective_client_id} disconnected", "user_id": user_id}
        )
