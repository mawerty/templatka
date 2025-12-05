from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
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
from app.features.auth.utils import create_access_token, hash_password, invalidate_token, verify_password
from app.utils.events import broadcast_event_sync

security = HTTPBearer(auto_error=False)

router = APIRouter()


@router.post("/register", response_model=LoginResponse, status_code=201)
def register(data: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> LoginResponse:
    existing = db.exec(select(AuthUser).where(AuthUser.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = AuthUser(email=data.email, name=data.name, hashed_password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)  # type: ignore
    broadcast_event_sync("user_registered", {"name": user.name})

    return LoginResponse(user=AuthUserResponse.model_validate(user), access_token=token)


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> LoginResponse:
    user = db.exec(select(AuthUser).where(AuthUser.email == data.email)).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive")

    token = create_access_token(user.id)  # type: ignore
    broadcast_event_sync("user_logged_in", {"name": user.name})

    return LoginResponse(user=AuthUserResponse.model_validate(user), access_token=token)


@router.get("/me", response_model=AuthUserResponse)
def get_me(user: Annotated[AuthUser, Depends(get_current_user)]) -> AuthUser:
    return user


@router.post("/logout", status_code=204)
def logout(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> None:
    """Logout and invalidate the current access token."""
    if credentials:
        invalidate_token(credentials.credentials)
    return None
