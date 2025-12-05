from fastapi.testclient import TestClient


def test_create_cat(client: TestClient):
    response = client.post("/api/cats", json={"name": "Whiskers", "breed": "Persian"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Whiskers"
    assert data["breed"] == "Persian"
    assert "id" in data


def test_list_cats(client: TestClient):
    client.post("/api/cats", json={"name": "Test Cat", "breed": "Tabby"})
    response = client.get("/api/cats")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) >= 1


def test_get_cat(client: TestClient):
    create_response = client.post("/api/cats", json={"name": "Get Test", "breed": "Siamese"})
    cat_id = create_response.json()["id"]
    response = client.get(f"/api/cats/{cat_id}")
    assert response.status_code == 200
    assert response.json()["id"] == cat_id


def test_update_cat(client: TestClient):
    create_response = client.post("/api/cats", json={"name": "Update Test", "breed": "Maine Coon"})
    cat_id = create_response.json()["id"]
    response = client.patch(f"/api/cats/{cat_id}", json={"name": "Updated Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


def test_delete_cat(client: TestClient):
    create_response = client.post("/api/cats", json={"name": "Delete Test", "breed": "British Shorthair"})
    cat_id = create_response.json()["id"]
    response = client.delete(f"/api/cats/{cat_id}")
    assert response.status_code == 204
    get_response = client.get(f"/api/cats/{cat_id}")
    assert get_response.status_code == 404


def test_get_nonexistent_cat(client: TestClient):
    response = client.get("/api/cats/99999")
    assert response.status_code == 404
