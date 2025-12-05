"""User model - example SQLModel with Pydantic schemas.

This demonstrates the pattern:
- SQLModel class for database (with table=True)
- Pydantic schemas for API input/output
- All fields with defaults = no migrations needed!
"""

import time

from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    """Base user fields shared across schemas."""

    name: str = Field(min_length=1, max_length=100)
    email: str = Field(max_length=255)


class User(UserBase, table=True):
    """User database model.

    Add new fields with defaults - old records will get the default value
    automatically. No migrations needed for hackathons!
    """

    id: int | None = Field(default=None, primary_key=True)
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

    # Example: Add new fields with defaults for "auto migration"
    is_active: bool = Field(default=True)
    avatar_url: str | None = Field(default=None)


class UserCreate(UserBase):
    """Schema for creating a user."""

    pass


class UserRead(UserBase):
    """Schema for reading a user (API response)."""

    id: int
    created_at: float
    updated_at: float
    is_active: bool
    avatar_url: str | None


class UserUpdate(SQLModel):
    """Schema for updating a user (all fields optional)."""

    name: str | None = None
    email: str | None = None
    is_active: bool | None = None
    avatar_url: str | None = None

