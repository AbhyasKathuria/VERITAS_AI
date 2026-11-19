from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from backend.app.schemas.schemas import (
    SingleReviewAnalysisRequest, SingleReviewAnalysisResponse,
    BatchAnalysisRequest, BatchAnalysisResponse
)
from backend.app.database.session import get_db
from backend.app.database.models import Review, ReviewPrediction, Explanation, AuditLog
from ml.fusion.inference import inference_engine
from ml.explainability.explainer import explainer

router = APIRouter()

@router.post("/review", response_model=SingleReviewAnalysisResponse)
def analyze_single_review(
    payload: SingleReviewAnalysisRequest,
    db: Session = Depends(get_db)
):
    review_id = str(uuid.uuid4())

    # Run inference engine
    result = inference_engine.analyze_review(
        review_text=payload.review_text,
        rating=payload.rating,
        reviewer_id=payload.reviewer_id,
        product_id=payload.product_id,
        timestamp=payload.timestamp
    )

    # Run explanation engine
    explanation = explainer.explain_review(
        payload.review_text,
        method=payload.explanation_method or "shap"
    )

    # Persist review record and prediction to DB
    try:
        db_review = Review(
            id=review_id,
            review_text=payload.review_text,
            deception_label=result["deception"]["label"],
            authorship_label=result["authorship"]["label"],
            source_dataset="live_api",
            product_category=payload.product_category or "general",
            rating=payload.rating,
            reviewer_id=payload.reviewer_id,
            product_id=payload.product_id,
            timestamp=payload.timestamp or datetime.utcnow().isoformat()
        )
        db.add(db_review)

        db_pred = ReviewPrediction(
            id=str(uuid.uuid4()),
            review_id=review_id,
            model_version_id="deception_v1.0.0",
            deception_prediction=result["deception"]["label"],
            deception_confidence=result["deception"]["confidence"],
            deception_calibrated_prob=result["deception"]["calibrated_probability"],
            authorship_prediction=result["authorship"]["label"],
            authorship_confidence=result["authorship"]["confidence"],
            authorship_calibrated_prob=result["authorship"]["calibrated_probability"],
            behavioral_anomaly_score=result["behavioral"].get("anomaly_score"),
            is_abstained=result["deception"]["is_abstained"] or result["authorship"]["is_abstained"],
            abstention_reason=result["deception"]["abstention_reason"] or result["authorship"]["abstention_reason"]
        )
        db.add(db_pred)

        db_exp = Explanation(
            id=str(uuid.uuid4()),
            review_id=review_id,
            explanation_method=explanation["explanation_method"],
            top_positive_features=explanation["top_positive_features"],
            top_negative_features=explanation["top_negative_features"],
            token_attributions=explanation["token_attributions"],
            linguistic_summary=explanation["linguistic_summary"]
        )
        db.add(db_exp)

        # Audit log
        db_audit = AuditLog(
            id=str(uuid.uuid4()),
            action="predict",
            entity_type="review",
            entity_id=review_id,
            details={"deception": result["deception"]["label"], "authorship": result["authorship"]["label"]}
        )
        db.add(db_audit)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[WARN] Failed to persist analysis to DB: {e}")

    return SingleReviewAnalysisResponse(
        review_id=review_id,
        deception=result["deception"],
        authorship=result["authorship"],
        behavioral=result["behavioral"],
        explanation=explanation,
        evidence_fusion_summary=result["evidence_fusion_summary"],
        model_version=result["model_version"],
        analyzed_at=datetime.utcnow()
    )

@router.post("/batch", response_model=BatchAnalysisResponse)
def analyze_batch_reviews(
    payload: BatchAnalysisRequest,
    db: Session = Depends(get_db)
):
    results = []
    deceptive_count = 0
    ai_count = 0
    abstained_count = 0

    for item in payload.reviews:
        res = analyze_single_review(item, db)
        results.append(res)
        if res.deception.label == "deceptive":
            deceptive_count += 1
        if res.authorship.label in ["ai_generated", "ai_assisted"]:
            ai_count += 1
        if res.deception.is_abstained or res.authorship.is_abstained:
            abstained_count += 1

    total = len(results)
    summary = {
        "total": total,
        "deceptive_count": deceptive_count,
        "deceptive_percentage": round(deceptive_count / max(1, total) * 100, 1),
        "ai_count": ai_count,
        "ai_percentage": round(ai_count / max(1, total) * 100, 1),
        "abstained_count": abstained_count,
        "abstained_percentage": round(abstained_count / max(1, total) * 100, 1)
    }

    return BatchAnalysisResponse(
        total_processed=total,
        results=results,
        summary=summary
    )
