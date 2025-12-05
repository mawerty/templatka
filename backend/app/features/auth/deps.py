"""Auth dependencies for route protection."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.db import get_db
from app.features.auth.models import AuthUser
from app.features.auth.utils import decode_access_token

# Bearer token extractor
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> AuthUser:
    """Get current authenticated user.

    Raises 401 if not authenticated.

    Usage:
        @router.get("/protected")
        def protected(user: AuthUser = Depends(get_current_user)):
            ...
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(AuthUser, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive",
        )

    return user


def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> AuthUser | None:
    """Get current user if authenticated, None otherwise.

    Does NOT raise an error if not authenticated.

    Usage:
        @router.get("/items")
        def list_items(user: AuthUser | None = Depends(get_optional_user)):
            if user:
                # Show personalized items
            else:
                # Show public items
    """
    if credentials is None:
        return None

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        return None

    user = db.get(AuthUser, user_id)
    if user is None or not user.is_active:
        return None

    return user
