import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_api_analyze_review():
    payload = {
        "review_text": "I had a wonderful stay at the Chicago hotel. The bedroom was spacious and the bathroom was pristine.",
        "rating": 5.0,
        "product_category": "hotels"
    }
    res = client.post("/api/v1/analyze/review", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "deception" in data
    assert "authorship" in data
    assert "explanation" in data
    assert "evidence_fusion_summary" in data
    assert data["deception"]["label"] in ["genuine", "deceptive", "insufficient_evidence"]
    assert data["authorship"]["label"] in ["human", "ai_generated", "ai_assisted", "insufficient_evidence"]

def test_api_analyze_batch():
    payload = {
        "reviews": [
            {"review_text": "First sample review for testing batch analyzer.", "rating": 4.0},
            {"review_text": "Second sample review with more details on hotel amenities.", "rating": 2.0}
        ]
    }
    res = client.post("/api/v1/analyze/batch", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_processed"] == 2
    assert "summary" in data

def test_api_datasets():
    res = client.get("/api/v1/datasets")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_api_models():
    res = client.get("/api/v1/models")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_api_experiments():
    res = client.get("/api/v1/experiments")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 12

def test_api_graph_ego_network():
    res = client.get("/api/v1/graph/100")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "links" in data
    assert "degree_centrality" in data

def test_api_reports():
    res = client.get("/api/v1/reports")
    assert res.status_code == 200
    assert len(res.json()) >= 1
