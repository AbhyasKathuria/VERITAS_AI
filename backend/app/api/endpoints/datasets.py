from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.database.models import Dataset, Review
from backend.app.schemas.schemas import DatasetSummary, DatasetDetail

router = APIRouter()

@router.get("", response_model=List[DatasetSummary])
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).all()
    results = []
    for d in datasets:
        # Get count of actual reviews in DB
        cnt = db.query(Review).filter(Review.dataset_id == d.id).count()
        results.append(DatasetSummary(
            id=d.id,
            name=d.name,
            description=d.description,
            source_type=d.source_type,
            domain=d.domain,
            license=d.license,
            sample_count=cnt if cnt > 0 else d.sample_count,
            created_at=d.created_at
        ))
    return results

@router.get("/{id}")
def get_dataset(id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    reviews = db.query(Review).filter(Review.dataset_id == id).limit(50).all()
    review_list = [
        {
            "review_id": r.id,
            "text": r.review_text[:120] + "..." if len(r.review_text) > 120 else r.review_text,
            "deception": r.deception_label,
            "authorship": r.authorship_label,
            "rating": r.rating
        }
        for r in reviews
    ]

    return {
        "id": dataset.id,
        "name": dataset.name,
        "description": dataset.description,
        "source_type": dataset.source_type,
        "domain": dataset.domain,
        "license": dataset.license,
        "sample_count": dataset.sample_count,
        "sample_reviews": review_list
    }
