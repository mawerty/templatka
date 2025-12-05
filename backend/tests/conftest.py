"""Test fixtures and configuration.

Provides:
- test_client: FastAPI TestClient with fresh test database
- test_db: Fresh SQLite database for each test
"""

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

# Set test environment before importing app
os.environ["DATABASE_URL"] = "sqlite:///test.db"
os.environ["DEBUG"] = "false"

from app.db import get_db
from app.main import app


# Test database setup
TEST_DATABASE_URL = "sqlite:///test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})


def get_test_db() -> Generator[Session, None, None]:
    """Override database dependency for tests."""
    with Session(test_engine) as session:
        yield session


@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    """Create fresh database for each test."""
    # Create all tables
    SQLModel.metadata.create_all(test_engine)
    
    with Session(test_engine) as session:
        yield session
    
    # Drop all tables after test
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture(scope="function")
def client(test_db: Session) -> Generator[TestClient, None, None]:
    """Test client with fresh database."""
    # Override the database dependency
    app.dependency_overrides[get_db] = lambda: test_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture
def auth_token(client: TestClient) -> str:
    """Get auth token for protected routes (requires auth enabled)."""
    from app.config import settings
    
    if not settings.enable_auth:
        pytest.skip("Auth not enabled")
    
    # Register a test user
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
        },
    )
    assert response.status_code == 201
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token: str) -> dict[str, str]:
    """Authorization headers for protected routes."""
    return {"Authorization": f"Bearer {auth_token}"}

