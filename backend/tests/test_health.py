"""Smoke tests - verify the app starts and basic endpoints work."""

from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """App should start and respond to health check."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_openapi_schema(client: TestClient):
    """OpenAPI schema should be accessible."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()


def test_docs_endpoint(client: TestClient):
    """API docs should be accessible."""
    response = client.get("/docs")
    assert response.status_code == 200

