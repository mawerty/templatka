"""Pagination utilities.

Usage:
    from app.utils.pagination import paginate, PaginatedResponse

    @router.get("/items", response_model=PaginatedResponse[ItemRead])
    def list_items(
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db),
    ):
        return paginate(db, select(Item), skip, limit)
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel
from sqlmodel import Session, func, select

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool

    class Config:
        arbitrary_types_allowed = True


def paginate(
    db: Session,
    query: Any,
    skip: int = 0,
    limit: int = 20,
) -> PaginatedResponse:
    """Execute query with pagination.

    Args:
        db: Database session
        query: SQLModel select query
        skip: Number of records to skip
        limit: Max records to return

    Returns:
        PaginatedResponse with items and pagination metadata

    Example:
        @router.get("/users", response_model=PaginatedResponse[UserRead])
        def list_users(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
            return paginate(db, select(User), skip, limit)
    """
    # Get total count - extract the model from the query
    # This is a bit hacky but works for simple select() queries
    model = query.column_descriptions[0]["entity"]
    total = db.exec(select(func.count()).select_from(model)).one()

    # Get paginated items
    items = list(db.exec(query.offset(skip).limit(limit)).all())

    # Calculate pagination metadata
    page = (skip // limit) + 1 if limit > 0 else 1
    pages = ((total + limit - 1) // limit) if limit > 0 else 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1,
    )


def simple_paginate(
    items: list[T],
    total: int,
    skip: int = 0,
    limit: int = 20,
) -> PaginatedResponse[T]:
    """Create paginated response from already-fetched items.

    Use this when you've already fetched the items and just need
    to wrap them in a PaginatedResponse.

    Example:
        items = db.exec(select(User).offset(skip).limit(limit)).all()
        total = db.exec(select(func.count(User.id))).one()
        return simple_paginate(items, total, skip, limit)
    """
    page = (skip // limit) + 1 if limit > 0 else 1
    pages = ((total + limit - 1) // limit) if limit > 0 else 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1,
    )
