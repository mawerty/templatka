import asyncio
from typing import Any

from app.config import settings


async def broadcast_event(event_type: str, data: dict[str, Any] | None = None) -> None:
    if not settings.enable_websockets:
        return

    from app.features.websockets.manager import manager

    await manager.broadcast({"type": "activity", "event": event_type, "data": data or {}})


def broadcast_event_sync(event_type: str, data: dict[str, Any] | None = None) -> None:
    if not settings.enable_websockets:
        return

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(broadcast_event(event_type, data))
        else:
            loop.run_until_complete(broadcast_event(event_type, data))
    except RuntimeError:
        pass
