"""Models package - import all models here for SQLModel to discover them."""

from app.models.cat import Cat, CatCreate, CatRead, CatUpdate

__all__ = ["Cat", "CatCreate", "CatRead", "CatUpdate"]
