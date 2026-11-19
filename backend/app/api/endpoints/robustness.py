from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.schemas.schemas import RobustnessEvaluateRequest, RobustnessEvaluateResponse
from backend.app.database.session import get_db
from backend.app.database.models import RobustnessEvaluation
from ml.robustness.adversarial import robustness_lab

router = APIRouter()

@router.post("/evaluate", response_model=RobustnessEvaluateResponse)
def evaluate_robustness(payload: RobustnessEvaluateRequest):
    result = robustness_lab.run_evaluation(
        transformation_type=payload.transformation_type,
        perturbation_intensity=payload.perturbation_intensity,
        sample_count=payload.test_samples_count
    )
    return RobustnessEvaluateResponse(**result)

@router.get("/history")
def get_robustness_history(db: Session = Depends(get_db)):
    evals = db.query(RobustnessEvaluation).order_by(RobustnessEvaluation.created_at.desc()).limit(15).all()
    results = []
    for e in evals:
        results.append({
            "id": e.id,
            "transformation_type": e.transformation_type,
            "perturbation_intensity": e.perturbation_intensity,
            "baseline_macro_f1": round(e.baseline_macro_f1, 4),
            "perturbed_macro_f1": round(e.perturbed_macro_f1, 4),
            "performance_drop": round(e.performance_drop, 4),
            "created_at": e.created_at
        })
    return results
