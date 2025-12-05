"""WebSocket feature module for real-time communication.

Enable in config.py:
    enable_websockets: bool = True

Provides:
    - WebSocket endpoint at /ws/{client_id}
    - ConnectionManager for broadcasting messages
    - Ready-to-use chat-like functionality

Usage:
    # In your code, you can send messages to all connected clients:
    from app.features.websockets import manager

    await manager.broadcast({"type": "notification", "message": "Hello!"})
    await manager.send_to_client("client123", {"type": "private", "message": "Hi!"})
"""

from app.features.websockets.manager import ConnectionManager, manager
from app.features.websockets.router import router as websockets_router

__all__ = ["websockets_router", "ConnectionManager", "manager"]

