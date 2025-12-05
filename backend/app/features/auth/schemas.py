from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    email: str
    name: str
    created_at: float
    is_active: bool
    avatar_url: str | None


class LoginResponse(BaseModel):
    user: AuthUserResponse
    access_token: str
    token_type: str = "bearer"
