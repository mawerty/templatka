# 🚀 Hackathon Template

Fast, modern stack for rapid prototyping. Zero migrations, auto-generated types, works on all platforms.

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React + Vite + TypeScript |
| **Routing** | React Router v7 |
| **UI** | Tailwind CSS + shadcn/ui |
| **Data** | TanStack Query + react-hook-form + zod |
| **Backend** | FastAPI + Python 3.12 |
| **Database** | SQLite + SQLModel |
| **Desktop** | Electron (optional) |

## Quick Start

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org))
- **Python** 3.12+ ([download](https://python.org))
- **pnpm**: `npm install -g pnpm`
- **uv**: `pip install uv` or `brew install uv`

### Setup (2 minutes)

```bash
# 1. Install all dependencies
pnpm install                    # Frontend + root deps
uv sync --project backend       # Backend deps

# 2. Run!
pnpm dev
```

Open:
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend + backend (web mode) |
| `pnpm dev:desktop` | Start as desktop app (Electron) |
| `pnpm test` | Run backend smoke tests |
| `pnpm api` | Regenerate API types from backend |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm build` | Build frontend for production |
| `pnpm electron:build` | Build desktop app (.exe/.dmg) |

## Project Structure

```
hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings + feature flags
│   │   ├── db.py            # SQLite connection
│   │   ├── models/          # SQLModel + Pydantic schemas
│   │   ├── routes/          # API endpoints
│   │   ├── features/        # 🔌 Optional modules (auth, uploads, websockets)
│   │   └── utils/           # Helpers (pagination, etc.)
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
    │   │   ├── api/             # API hooks (auto-generate with `pnpm api`)
    │   │   ├── components/      # React components
    │   │   │   └── ui/          # shadcn/ui components
    │   │   ├── features/        # 🔌 Optional modules (auth, uploads, websockets)
    │   │   ├── pages/           # Page components (one per route)
    │   │   ├── lib/             # Utilities
    │   │   ├── App.tsx          # Layout + routing
    │   │   └── main.tsx         # Entry point
    │   └── package.json
│
├── electron/
│   └── main.ts              # Electron entry (desktop mode)
│
├── package.json             # Root scripts
└── biome.json               # Linting config
```

## 🔌 Optional Features

Enable features by setting flags in `backend/app/config.py`:

```python
enable_auth: bool = True         # JWT authentication
enable_file_upload: bool = True  # File upload/download
enable_websockets: bool = True   # Real-time communication
```

### 🔐 Authentication (JWT)

Full auth system with register, login, protected routes.

**Backend:**
```python
from app.features.auth.deps import get_current_user, get_optional_user

@router.get("/protected")
def protected_route(user: AuthUser = Depends(get_current_user)):
    return {"message": f"Hello {user.name}"}

@router.get("/public")
def public_route(user: AuthUser | None = Depends(get_optional_user)):
    if user:
        return {"message": f"Hello {user.name}"}
    return {"message": "Hello guest"}
```

**Frontend:**
```tsx
import { AuthProvider, useAuth, ProtectedRoute, LoginForm } from "@/features/auth";

// Wrap app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Use auth in components
const { user, login, logout, isAuthenticated } = useAuth();

// Protect routes
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Ready-made forms
<LoginForm onSuccess={() => navigate('/dashboard')} />
<RegisterForm onSuccess={() => navigate('/dashboard')} />
```

### 📁 File Upload

Upload, download, delete files.

**Backend:** Endpoints auto-enabled at `/api/uploads/`

**Frontend:**
```tsx
import { useUploadFile, useDeleteFile, getUploadUrl } from "@/features/uploads";

const { mutate: upload, isPending } = useUploadFile({
  onSuccess: (data) => console.log('Uploaded:', data.url),
});

<input type="file" onChange={(e) => {
  const file = e.target.files?.[0];
  if (file) upload(file);
}} />

// Display uploaded file
<img src={getUploadUrl(filename)} />
```

### 🔌 WebSockets (Real-time)

Chat, notifications, live updates.

**Backend:**
```python
from app.features.websockets import manager

# Send to all
await manager.broadcast({"type": "notification", "message": "Hello!"})

# Send to specific client
await manager.send_to_client("user123", {"type": "private", "message": "Hi!"})

# Send to room
await manager.send_to_room("room1", {"type": "chat", "message": "Hello room!"})
```

**Frontend:**
```tsx
import { useWebSocket } from "@/features/websockets";

const { messages, sendMessage, isConnected, joinRoom } = useWebSocket("user123");

// Send message
sendMessage("Hello!");

// Join a room
joinRoom("chat-room-1");

// Messages auto-update
{messages.map(m => <div>{m.content}</div>)}
```

### 📄 Pagination

Helper for paginated lists.

```python
from app.utils.pagination import paginate, PaginatedResponse

@router.get("/items", response_model=PaginatedResponse[ItemRead])
def list_items(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return paginate(db, select(Item), skip, limit)

# Response:
# {
#   "items": [...],
#   "total": 150,
#   "page": 1,
#   "pages": 8,
#   "has_next": true,
#   "has_prev": false
# }
```

## Adding Features

### 🧭 Adding Pages (Routing)

The template uses React Router for navigation. Pages live in `frontend/src/pages/`.

**1. Create a new page:**

```tsx
// frontend/src/pages/DashboardPage.tsx
import { useParams } from "react-router-dom";

export function DashboardPage() {
  const { id } = useParams(); // Get URL params like /dashboard/:id
  
  return (
    <div>
      <h1>Dashboard</h1>
      {id && <p>Viewing item: {id}</p>}
    </div>
  );
}
```

**2. Add route in `App.tsx`:**

```tsx
import { DashboardPage } from "./pages/DashboardPage";

// Inside <Routes>
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/dashboard/:id" element={<DashboardPage />} />
```

**3. Add navigation link:**

```tsx
import { Link, useNavigate } from "react-router-dom";

// Declarative link
<Link to="/dashboard">Go to Dashboard</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate("/dashboard");
navigate("/dashboard/123");
```

**Useful hooks:**
- `useParams()` - get URL parameters (`:id`, `:slug`)
- `useNavigate()` - programmatic navigation
- `useLocation()` - current URL info
- `useSearchParams()` - query string (`?page=2`)

### 1. Add a new model (backend)

```python
# backend/app/models/item.py
import time
from sqlmodel import Field, SQLModel

class ItemBase(SQLModel):
    name: str
    description: str | None = None

class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: float = Field(default_factory=time.time)
    # Add new fields with defaults - no migrations needed!
    is_featured: bool = Field(default=False)

class ItemCreate(ItemBase):
    pass

class ItemRead(ItemBase):
    id: int
    created_at: float
    is_featured: bool
```

### 2. Add routes (backend)

```python
# backend/app/routes/items.py
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_db
from app.models.item import Item, ItemCreate, ItemRead

router = APIRouter()

@router.get("/items", response_model=list[ItemRead])
def list_items(db: Session = Depends(get_db)):
    return list(db.exec(select(Item)).all())

@router.post("/items", response_model=ItemRead, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item.model_validate(item)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
```

```python
# backend/app/main.py - add the router
from app.routes import items
app.include_router(items.router, prefix="/api", tags=["Items"])
```

### 3. Regenerate frontend types

```bash
pnpm api
```

This generates TypeScript types + React Query hooks from your FastAPI OpenAPI schema!

### 4. Use in frontend

```tsx
import { useItems, useCreateItem } from "@/api";

function ItemList() {
  const { data: items, isLoading } = useItems();
  const createItem = useCreateItem();
  
  // ...
}
```

## Database

SQLite database is stored in `backend/app.db`. 

### "Auto-migrations"

No migration files needed! Just:
1. Add new fields with default values
2. Restart the server

```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    # New field - old data gets default automatically
    avatar_url: str | None = Field(default=None)
```

### Reset database

```bash
rm backend/app.db
pnpm dev  # Tables recreated on startup
```

## Environment Variables

Create `.env` files for configuration:

```bash
# backend/.env
DATABASE_URL=sqlite:///app.db
DEBUG=true

# frontend/.env
VITE_API_URL=http://localhost:8000
```

## Desktop App (Electron)

### Development

```bash
pnpm dev:desktop
```

### Build for distribution

```bash
pnpm electron:build
```

Output in `dist-electron/`:
- Windows: `.exe`
- macOS: `.dmg`
- Linux: `.AppImage`

## Adding UI Components

Using shadcn/ui - copy-paste components:

```bash
cd frontend
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add tabs
```

## Tips for Hackathons

1. **Start simple** - Get basic CRUD working first
2. **Use defaults** - Every model field should have a default
3. **Don't migrate** - Just delete `app.db` and restart
4. **Auto-generate types** - Run `pnpm api` after backend changes
5. **shadcn/ui** - Pre-built components save hours

## Troubleshooting

### "Backend not running"

```bash
# Check if port 8000 is in use
lsof -i :8000

# Start backend manually
cd backend && uv run uvicorn app.main:app --reload
```

### "Types out of sync"

```bash
pnpm api
```

### "Module not found" (Python)

```bash
cd backend && uv sync
```

### Reset everything

```bash
rm -rf node_modules frontend/node_modules backend/.venv backend/app.db
pnpm install
uv sync --project backend
pnpm dev
```

---

Built for speed. Ship fast. 🚢

