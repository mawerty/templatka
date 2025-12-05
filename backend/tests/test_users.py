"""User CRUD smoke tests - verify basic operations work."""

from fastapi.testclient import TestClient


def test_create_user(client: TestClient):
    """Should create a new user."""
    response = client.post(
        "/api/users",
        json={"name": "John Doe", "email": "john@example.com"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"
    assert "id" in data


def test_list_users(client: TestClient):
    """Should list users."""
    # Create a user first
    client.post("/api/users", json={"name": "Test", "email": "test@example.com"})
    
    response = client.get("/api/users")
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= 1


def test_get_user(client: TestClient):
    """Should get a specific user."""
    # Create a user first
    create_response = client.post(
        "/api/users",
        json={"name": "Get Test", "email": "get@example.com"},
    )
    user_id = create_response.json()["id"]
    
    response = client.get(f"/api/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["id"] == user_id


def test_update_user(client: TestClient):
    """Should update a user."""
    # Create a user first
    create_response = client.post(
        "/api/users",
        json={"name": "Update Test", "email": "update@example.com"},
    )
    user_id = create_response.json()["id"]
    
    # Update the user
    response = client.patch(
        f"/api/users/{user_id}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


def test_delete_user(client: TestClient):
    """Should delete a user."""
    # Create a user first
    create_response = client.post(
        "/api/users",
        json={"name": "Delete Test", "email": "delete@example.com"},
    )
    user_id = create_response.json()["id"]
    
    # Delete the user
    response = client.delete(f"/api/users/{user_id}")
    assert response.status_code == 204
    
    # Verify deleted
    get_response = client.get(f"/api/users/{user_id}")
    assert get_response.status_code == 404


def test_get_nonexistent_user(client: TestClient):
    """Should return 404 for non-existent user."""
    response = client.get("/api/users/99999")
    assert response.status_code == 404

