"""Models package - import all models here for SQLModel to discover them."""

from app.models.user import User, UserCreate, UserRead, UserUpdate

__all__ = ["User", "UserCreate", "UserRead", "UserUpdate"]

