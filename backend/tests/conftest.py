import os
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

os.environ["DATABASE_URL"] = "sqlite:///test.db"
os.environ["DEBUG"] = "false"

from app.db import get_db
from app.main import app

TEST_DB_PATH = Path("test.db")
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})


def get_test_db() -> Generator[Session, None, None]:
    with Session(test_engine) as session:
        yield session


@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture(scope="function")
def client(test_db: Session) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_db] = lambda: test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_token(client: TestClient) -> str:
    from app.config import settings

    if not settings.enable_auth:
        pytest.skip("Auth not enabled")

    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "testpass123", "name": "Test User"},
    )
    assert response.status_code == 201
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {auth_token}"}


def pytest_sessionfinish(session, exitstatus):
    test_engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
