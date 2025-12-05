from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import settings
from app.features.auth.blacklist import add_to_blacklist, is_blacklisted


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiration_hours)
    payload = {"sub": str(user_id), "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    """Decode and validate a JWT token. Returns user_id or None if invalid/blacklisted."""
    if is_blacklisted(token):
        return None

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except jwt.PyJWTError:
        return None


def invalidate_token(token: str) -> bool:
    """Add a token to the blacklist. Returns True if successful."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        exp = payload.get("exp")
        if exp:
            add_to_blacklist(token, exp)
            return True
    except jwt.PyJWTError:
        pass
    return False
