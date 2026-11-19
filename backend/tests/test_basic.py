import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import SessionLocal, engine, Base
import backend.app.database.models

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "VERITAS AI"
    assert data["status"] == "active"

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project"] == "VERITAS AI"
    assert data["torch_available"] is True
    assert "cuda_available" in data

def test_database_connection():
    db = SessionLocal()
    try:
        # Check that we can query without errors
        datasets_count = db.query(backend.app.database.models.Dataset).count()
        assert isinstance(datasets_count, int)
    finally:
        db.close()
