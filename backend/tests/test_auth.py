"""Auth smoke tests - verify auth flow works end-to-end.

These tests only run if auth is enabled (enable_auth = True in config).
"""

import pytest
from fastapi.testclient import TestClient

from app.config import settings


# Skip all tests in this module if auth is not enabled
pytestmark = pytest.mark.skipif(
    not settings.enable_auth,
    reason="Auth feature not enabled"
)


def test_register_user(client: TestClient):
    """Should register a new user and return token."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "register@example.com",
            "password": "password123",
            "name": "Register Test",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "register@example.com"


def test_login_user(client: TestClient):
    """Should login existing user and return token."""
    # Register first
    client.post(
        "/api/auth/register",
        json={
            "email": "login@example.com",
            "password": "password123",
            "name": "Login Test",
        },
    )
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_get_current_user(client: TestClient, auth_headers: dict):
    """Should return current user when authenticated."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert "email" in response.json()


def test_protected_route_without_token(client: TestClient):
    """Should reject requests without token."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_protected_route_with_invalid_token(client: TestClient):
    """Should reject requests with invalid token."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


def test_register_duplicate_email(client: TestClient):
    """Should reject registration with existing email."""
    user_data = {
        "email": "duplicate@example.com",
        "password": "password123",
        "name": "First User",
    }
    
    # First registration should succeed
    response1 = client.post("/api/auth/register", json=user_data)
    assert response1.status_code == 201
    
    # Second registration with same email should fail
    response2 = client.post("/api/auth/register", json=user_data)
    assert response2.status_code == 409


def test_login_wrong_password(client: TestClient):
    """Should reject login with wrong password."""
    # Register
    client.post(
        "/api/auth/register",
        json={
            "email": "wrongpass@example.com",
            "password": "correctpassword",
            "name": "Test",
        },
    )
    
    # Login with wrong password
    response = client.post(
        "/api/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client: TestClient):
    """Should reject login for non-existent user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 401

