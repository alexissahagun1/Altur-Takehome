from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    """
    Test the health check endpoint.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Altur Call Analyzer API is running"}

def test_get_calls_empty():
    """
    Test fetching calls when the DB is empty (or just ensures the endpoint is reachable).
    """
    response = client.get("/calls")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_upload_invalid_extension():
    """
    Test that uploading a non-audio file fails with 400.
    """
    response = client.post(
        "/upload",
        files={"file": ("test.txt", b"this is a text file", "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

