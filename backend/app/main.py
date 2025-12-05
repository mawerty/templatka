from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_db
from app.routes import health, cats


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Hackathon API",
    description="Fast hackathon template API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(cats.router, prefix=settings.api_prefix, tags=["Cats"])

if settings.enable_auth:
    from app.features.auth import auth_router
    app.include_router(auth_router, prefix=f"{settings.api_prefix}/auth", tags=["Auth"])

if settings.enable_file_upload:
    from app.features.uploads import uploads_router
    app.include_router(uploads_router, prefix=f"{settings.api_prefix}/uploads", tags=["Uploads"])

if settings.enable_websockets:
    from app.features.websockets import websockets_router
    app.include_router(websockets_router, tags=["WebSockets"])
