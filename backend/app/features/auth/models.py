"""Auth user model - extends base User with password."""

import time

from sqlmodel import Field, SQLModel


class AuthUserBase(SQLModel):
    """Base auth user fields."""

    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=100)


class AuthUser(AuthUserBase, table=True):
    """Auth user database model with hashed password.

    Note: This is separate from the example User model.
    In a real app, you'd likely have just one User model.
    """

    __tablename__ = "auth_users"

    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    is_active: bool = Field(default=True)

    # Add more fields as needed (with defaults for auto-migration)
    avatar_url: str | None = Field(default=None)
