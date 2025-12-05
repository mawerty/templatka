"""Event broadcasting utilities for live activity feed.

Usage:
    from app.utils.events import broadcast_event
    
    await broadcast_event("user_created", {"name": "Alice"})
"""

import asyncio
from typing import Any

from app.config import settings


async def broadcast_event(event_type: str, data: dict[str, Any] | None = None) -> None:
    """Broadcast an event to all connected WebSocket clients.
    
    Events are used for the live activity feed.
    """
    if not settings.enable_websockets:
        return
    
    # Import here to avoid circular imports
    from app.features.websockets.manager import manager
    
    message = {
        "type": "activity",
        "event": event_type,
        "data": data or {},
    }
    
    await manager.broadcast(message)


def broadcast_event_sync(event_type: str, data: dict[str, Any] | None = None) -> None:
    """Sync wrapper for broadcast_event - use in non-async routes."""
    if not settings.enable_websockets:
        return
    
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(broadcast_event(event_type, data))
        else:
            loop.run_until_complete(broadcast_event(event_type, data))
    except RuntimeError:
        # No event loop, skip broadcasting
        pass

