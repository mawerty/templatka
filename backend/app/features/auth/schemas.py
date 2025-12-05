"""Auth request/response schemas."""

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    """Registration request body."""

    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class AuthUserResponse(BaseModel):
    """Auth user response (without password)."""

    model_config = {"from_attributes": True}

    id: int
    email: str
    name: str
    created_at: float
    is_active: bool
    avatar_url: str | None


class LoginResponse(BaseModel):
    """Login response with user and token."""

    user: AuthUserResponse
    access_token: str
    token_type: str = "bearer"

