"""
Simple in-memory token blacklist for logout functionality.
For production, use Redis or database storage.
"""

from datetime import datetime, timezone
from threading import Lock

# In-memory blacklist with expiration times
_blacklist: dict[str, float] = {}
_lock = Lock()


def add_to_blacklist(token: str, expires_at: float) -> None:
    """Add a token to the blacklist."""
    with _lock:
        _blacklist[token] = expires_at
        _cleanup_expired()


def is_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted."""
    with _lock:
        if token not in _blacklist:
            return False
        # Check if token has expired (can be removed from blacklist)
        if _blacklist[token] < datetime.now(timezone.utc).timestamp():
            del _blacklist[token]
            return False
        return True


def _cleanup_expired() -> None:
    """Remove expired tokens from blacklist (called during add)."""
    now = datetime.now(timezone.utc).timestamp()
    expired = [token for token, exp in _blacklist.items() if exp < now]
    for token in expired:
        del _blacklist[token]


