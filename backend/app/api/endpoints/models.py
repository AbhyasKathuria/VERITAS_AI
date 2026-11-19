from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.database.models import MLModel, ModelVersion
from backend.app.schemas.schemas import ModelSummary

router = APIRouter()

@router.get("", response_model=List[ModelSummary])
def list_models(db: Session = Depends(get_db)):
    models = db.query(MLModel).all()
    results = []
    for m in models:
        v_count = len(m.versions)
        results.append(ModelSummary(
            id=m.id,
            name=m.name,
            architecture=m.architecture,
            target_task=m.target_task,
            is_active=m.is_active,
            versions_count=v_count,
            created_at=m.created_at
        ))
    return results

@router.get("/{id}")
def get_model(id: str, db: Session = Depends(get_db)):
    model = db.query(MLModel).filter(MLModel.id == id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    versions = []
    for v in model.versions:
        versions.append({
            "version_tag": v.version_tag,
            "architecture": model.architecture,
            "parameters": v.parameters,
            "metrics": v.metrics,
            "temperature": v.temperature,
            "abstention_threshold": v.abstention_threshold,
            "is_default": v.is_default
        })

    return {
        "id": model.id,
        "name": model.name,
        "architecture": model.architecture,
        "target_task": model.target_task,
        "description": model.description,
        "is_active": model.is_active,
        "versions": versions
    }
