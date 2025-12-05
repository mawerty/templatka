"""WebSocket routes.

Basic chat-like WebSocket endpoint. Customize for your needs.

Message format (incoming):
    {"type": "message", "content": "Hello!"}
    {"type": "join_room", "room": "room123"}
    {"type": "leave_room", "room": "room123"}
    {"type": "room_message", "room": "room123", "content": "Hi room!"}

Message format (outgoing):
    {"type": "message", "from": "client123", "content": "Hello!"}
    {"type": "system", "content": "client123 connected"}
    {"type": "room_message", "room": "room123", "from": "client123", "content": "Hi!"}
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.features.websockets.manager import manager

router = APIRouter()


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication.

    Connect with: ws://localhost:8000/ws/your-unique-id

    Send JSON messages, receive JSON responses.
    """
    await manager.connect(client_id, websocket)

    # Notify others
    await manager.broadcast(
        {"type": "system", "content": f"{client_id} connected"},
        exclude=client_id,
    )

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")

            if msg_type == "message":
                # Broadcast to all
                await manager.broadcast(
                    {
                        "type": "message",
                        "from": client_id,
                        "content": data.get("content", ""),
                    }
                )

            elif msg_type == "join_room":
                room = data.get("room")
                if room:
                    manager.join_room(client_id, room)
                    await manager.send_to_room(
                        room,
                        {"type": "system", "content": f"{client_id} joined {room}"},
                    )

            elif msg_type == "leave_room":
                room = data.get("room")
                if room:
                    manager.leave_room(client_id, room)
                    await manager.send_to_room(
                        room,
                        {"type": "system", "content": f"{client_id} left {room}"},
                    )

            elif msg_type == "room_message":
                room = data.get("room")
                if room:
                    await manager.send_to_room(
                        room,
                        {
                            "type": "room_message",
                            "room": room,
                            "from": client_id,
                            "content": data.get("content", ""),
                        },
                    )

            elif msg_type == "private":
                # Send private message to specific client
                to_client = data.get("to")
                if to_client:
                    await manager.send_to_client(
                        to_client,
                        {
                            "type": "private",
                            "from": client_id,
                            "content": data.get("content", ""),
                        },
                    )

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast(
            {"type": "system", "content": f"{client_id} disconnected"},
        )

