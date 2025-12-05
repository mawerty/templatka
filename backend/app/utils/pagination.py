from typing import Any, Generic, TypeVar

from pydantic import BaseModel
from sqlmodel import Session, func, select

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool

    class Config:
        arbitrary_types_allowed = True


def paginate(db: Session, query: Any, skip: int = 0, limit: int = 20) -> PaginatedResponse:
    model = query.column_descriptions[0]["entity"]
    total = db.exec(select(func.count()).select_from(model)).one()
    items = list(db.exec(query.offset(skip).limit(limit)).all())

    page = (skip // limit) + 1 if limit > 0 else 1
    pages = ((total + limit - 1) // limit) if limit > 0 else 1

    return PaginatedResponse(
        items=items, total=total, page=page, pages=pages, has_next=page < pages, has_prev=page > 1
    )


def simple_paginate(items: list[T], total: int, skip: int = 0, limit: int = 20) -> PaginatedResponse[T]:
    page = (skip // limit) + 1 if limit > 0 else 1
    pages = ((total + limit - 1) // limit) if limit > 0 else 1

    return PaginatedResponse(
        items=items, total=total, page=page, pages=pages, has_next=page < pages, has_prev=page > 1
    )
