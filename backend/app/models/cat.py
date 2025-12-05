import time

from sqlmodel import Field, SQLModel


class CatBase(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    breed: str = Field(max_length=100, default="Unknown")


class Cat(CatBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    is_cute: bool = Field(default=True)
    avatar_url: str | None = Field(default=None)


class CatCreate(CatBase):
    pass


class CatRead(CatBase):
    id: int
    created_at: float
    updated_at: float
    is_cute: bool
    avatar_url: str | None


class CatUpdate(SQLModel):
    name: str | None = None
    breed: str | None = None
    is_cute: bool | None = None
    avatar_url: str | None = None
