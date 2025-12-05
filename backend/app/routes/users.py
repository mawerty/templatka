"""Users API routes - example CRUD operations."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select

from app.db import get_db
from app.models.user import User, UserCreate, UserRead, UserUpdate
from app.utils.events import broadcast_event_sync
from app.utils.pagination import PaginatedResponse

router = APIRouter()


@router.get("/users", response_model=PaginatedResponse[UserRead])
def list_users(
    page: int = 1,
    per_page: int = 10,
    db: Session = Depends(get_db),
) -> PaginatedResponse[UserRead]:
    """List all users with pagination."""
    # Count total
    total = db.exec(select(func.count(User.id))).one()
    
    # Calculate offset
    skip = (page - 1) * per_page
    
    # Get items
    statement = select(User).offset(skip).limit(per_page)
    items = list(db.exec(statement).all())
    
    # Calculate pages
    pages = (total + per_page - 1) // per_page if total > 0 else 1
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1,
    )


@router.post("/users", response_model=UserRead, status_code=201)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> User:
    """Create a new user."""
    user = User.model_validate(user_in)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Broadcast event for live activity feed
    broadcast_event_sync("user_created", {"name": user.name})
    
    return user


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
) -> User:
    """Get a user by ID."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
) -> User:
    """Update a user."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_in.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a user."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_name = user.name
    db.delete(user)
    db.commit()
    
    # Broadcast event for live activity feed
    broadcast_event_sync("user_deleted", {"name": user_name})

