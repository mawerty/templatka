"""Database connection and session management."""

from collections.abc import Generator
from contextlib import contextmanager

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

# Create engine - SQLite with check_same_thread=False for FastAPI async
connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}
engine = create_engine(settings.database_url, connect_args=connect_args, echo=settings.debug)


def init_db() -> None:
    """Create all database tables.

    Called on startup - SQLModel will create tables that don't exist.
    For hackathons, this is enough. No migrations needed!
    """
    SQLModel.metadata.create_all(engine)


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Get a database session as context manager."""
    with Session(engine) as session:
        yield session


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session."""
    with Session(engine) as session:
        yield session

