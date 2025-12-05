import time

from sqlmodel import Field, SQLModel


class AuthUserBase(SQLModel):
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=100)


class AuthUser(AuthUserBase, table=True):
    __tablename__ = "auth_users"

    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    is_active: bool = Field(default=True)
    avatar_url: str | None = Field(default=None)
