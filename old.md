# Hackathon Template

## Quick Start

```bash
pnpm install
uv sync --project backend
pnpm dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend**: FastAPI + SQLite + SQLModel
- **Auth**: JWT (enable in `backend/app/config.py`)

## Add Model

```python
# backend/app/models/thing.py
from sqlmodel import Field, SQLModel

class Thing(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
```

Register in `main.py`, run `pnpm api` to generate types.

## Auth

```python
from app.features.auth.deps import get_current_user

@router.get("/protected")
def route(user = Depends(get_current_user)):
    return {"user": user.name}
```

```tsx
const { user, login, logout } = useAuth();
```

## Commands

| Command | What |
|---------|------|
| `pnpm dev` | Start all |
| `pnpm api` | Regen types |
| `pnpm test` | Tests |

