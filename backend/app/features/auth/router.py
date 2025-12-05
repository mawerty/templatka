"""Auth API routes - register, login, me."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_db
from app.features.auth.deps import get_current_user
from app.features.auth.models import AuthUser
from app.features.auth.schemas import (
    AuthUserResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
)
from app.features.auth.utils import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.utils.events import broadcast_event_sync

router = APIRouter()


@router.post("/register", response_model=LoginResponse, status_code=201)
def register(
    data: RegisterRequest,
    db: Annotated[Session, Depends(get_db)],
) -> LoginResponse:
    """Register a new user and return token."""
    # Check if email already exists
    existing = db.exec(select(AuthUser).where(AuthUser.email == data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user with hashed password
    user = AuthUser(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(user.id)  # type: ignore

    # Broadcast event for live activity feed
    broadcast_event_sync("user_registered", {"name": user.name})

    return LoginResponse(
        user=AuthUserResponse.model_validate(user),
        access_token=token,
    )


@router.post("/login", response_model=LoginResponse)
def login(
    data: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> LoginResponse:
    """Login with email and password, return token."""
    # Find user by email
    user = db.exec(select(AuthUser).where(AuthUser.email == data.email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check if active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive",
        )

    # Generate token
    token = create_access_token(user.id)  # type: ignore

    # Broadcast event for live activity feed
    broadcast_event_sync("user_logged_in", {"name": user.name})

    return LoginResponse(
        user=AuthUserResponse.model_validate(user),
        access_token=token,
    )


@router.get("/me", response_model=AuthUserResponse)
def get_me(
    user: Annotated[AuthUser, Depends(get_current_user)],
) -> AuthUser:
    """Get current authenticated user."""
    return user


@router.post("/logout", status_code=204)
def logout() -> None:
    """Logout - client should discard the token.

    Note: With JWT, we can't really "invalidate" tokens server-side
    without additional infrastructure (token blacklist, etc.).
    For hackathons, client-side token removal is usually enough.
    """
    return None
