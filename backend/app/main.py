"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_db
from app.routes import health, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    # Startup: Initialize database tables
    init_db()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Hackathon API",
    description="Fast hackathon template API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware - allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================================
# CORE ROUTES - Always enabled
# ===========================================
app.include_router(health.router, tags=["Health"])
app.include_router(users.router, prefix=settings.api_prefix, tags=["Users"])


# ===========================================
# OPTIONAL FEATURES - Enable in config.py
# ===========================================

# Auth - JWT authentication
if settings.enable_auth:
    from app.features.auth import auth_router

    app.include_router(auth_router, prefix=f"{settings.api_prefix}/auth", tags=["Auth"])

# File Upload
if settings.enable_file_upload:
    from app.features.uploads import uploads_router

    app.include_router(
        uploads_router, prefix=f"{settings.api_prefix}/uploads", tags=["Uploads"]
    )

# WebSockets
if settings.enable_websockets:
    from app.features.websockets import websockets_router

    app.include_router(websockets_router, tags=["WebSockets"])


# ===========================================
# ADD YOUR ROUTES HERE
# ===========================================
# from app.routes import items
# app.include_router(items.router, prefix=settings.api_prefix, tags=["Items"])
