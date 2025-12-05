"""Upload smoke tests - verify file upload/download works.

These tests only run if uploads are enabled (enable_file_upload = True in config).
"""

import io

import pytest
from fastapi.testclient import TestClient

from app.config import settings


# Skip all tests in this module if uploads not enabled
pytestmark = pytest.mark.skipif(
    not settings.enable_file_upload,
    reason="File upload feature not enabled"
)


def test_upload_file(client: TestClient):
    """Should upload a file and return URL."""
    file_content = b"Hello, this is a test file!"
    files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
    
    response = client.post("/api/uploads", files=files)
    assert response.status_code == 201
    data = response.json()
    assert "filename" in data
    assert "url" in data
    assert data["original_name"] == "test.txt"


def test_download_file(client: TestClient):
    """Should download an uploaded file."""
    # Upload first
    file_content = b"Download test content"
    files = {"file": ("download.txt", io.BytesIO(file_content), "text/plain")}
    upload_response = client.post("/api/uploads", files=files)
    filename = upload_response.json()["filename"]
    
    # Download
    response = client.get(f"/api/uploads/{filename}")
    assert response.status_code == 200
    assert response.content == file_content


def test_delete_file(client: TestClient):
    """Should delete an uploaded file."""
    # Upload first
    file_content = b"Delete test content"
    files = {"file": ("delete.txt", io.BytesIO(file_content), "text/plain")}
    upload_response = client.post("/api/uploads", files=files)
    filename = upload_response.json()["filename"]
    
    # Delete
    response = client.delete(f"/api/uploads/{filename}")
    assert response.status_code == 204
    
    # Verify deleted
    get_response = client.get(f"/api/uploads/{filename}")
    assert get_response.status_code == 404


def test_upload_invalid_extension(client: TestClient):
    """Should reject files with invalid extensions."""
    file_content = b"Fake executable content"
    files = {"file": ("malware.exe", io.BytesIO(file_content), "application/octet-stream")}
    
    response = client.post("/api/uploads", files=files)
    assert response.status_code == 400


def test_download_nonexistent_file(client: TestClient):
    """Should return 404 for non-existent file."""
    response = client.get("/api/uploads/nonexistent-file.txt")
    assert response.status_code == 404


def test_path_traversal_attack(client: TestClient):
    """Should reject path traversal attempts."""
    response = client.get("/api/uploads/../../../etc/passwd")
    assert response.status_code == 400

