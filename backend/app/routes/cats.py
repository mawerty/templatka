from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select

from app.db import get_db
from app.models.cat import Cat, CatCreate, CatRead, CatUpdate
from app.utils.events import broadcast_event_sync
from app.utils.pagination import PaginatedResponse

router = APIRouter()


@router.get("/cats", response_model=PaginatedResponse[CatRead])
def list_cats(
    page: int = 1,
    per_page: int = 10,
    db: Session = Depends(get_db),
) -> PaginatedResponse[CatRead]:
    total = db.exec(select(func.count(Cat.id))).one()
    skip = (page - 1) * per_page
    items = list(db.exec(select(Cat).offset(skip).limit(per_page)).all())
    pages = (total + per_page - 1) // per_page if total > 0 else 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1,
    )


@router.post("/cats", response_model=CatRead, status_code=201)
def create_cat(cat_in: CatCreate, db: Session = Depends(get_db)) -> Cat:
    cat = Cat.model_validate(cat_in)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    broadcast_event_sync("cat_created", {"name": cat.name})
    return cat


@router.get("/cats/{cat_id}", response_model=CatRead)
def get_cat(cat_id: int, db: Session = Depends(get_db)) -> Cat:
    cat = db.get(Cat, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Cat not found")
    return cat


@router.patch("/cats/{cat_id}", response_model=CatRead)
def update_cat(cat_id: int, cat_in: CatUpdate, db: Session = Depends(get_db)) -> Cat:
    cat = db.get(Cat, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Cat not found")

    for key, value in cat_in.model_dump(exclude_unset=True).items():
        setattr(cat, key, value)

    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/cats/{cat_id}", status_code=204)
def delete_cat(cat_id: int, db: Session = Depends(get_db)) -> None:
    cat = db.get(Cat, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Cat not found")

    cat_name = cat.name
    db.delete(cat)
    db.commit()
    broadcast_event_sync("cat_deleted", {"name": cat_name})
