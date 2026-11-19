"""
VERITAS AI: Branch B — Authorship Detection Baseline Training & Evaluation
Predicts Text Origin: Human-written vs. AI-generated vs. AI-assisted.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier

from ml.features.extractor import build_feature_pipeline, DenseTransformer
from ml.evaluation.metrics import evaluate_multiclass_classification
from backend.app.database.session import SessionLocal
from backend.app.database.models import MLModel, ModelVersion

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "ml" / "data" / "processed"
ARTIFACTS_DIR = BASE_DIR / "ml" / "artifacts" / "authorship"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

def train_authorship_models():
    print("=================================================================")
    print("VERITAS AI: TRAINING BRANCH B — AUTHORSHIP DETECTION BASELINES")
    print("=================================================================")

    train_df = pd.read_csv(PROCESSED_DIR / "train.csv")
    val_df = pd.read_csv(PROCESSED_DIR / "val.csv")
    test_df = pd.read_csv(PROCESSED_DIR / "test.csv")

    label_map = {"human": 0, "ai_generated": 1, "ai_assisted": 2}
    class_names = ["human", "ai_generated", "ai_assisted"]

    y_train = train_df["authorship_label"].map(label_map).values
    y_val = val_df["authorship_label"].map(label_map).values
    y_test = test_df["authorship_label"].map(label_map).values

    X_train = train_df["review_text"].fillna("").values
    X_val = val_df["review_text"].fillna("").values
    X_test = test_df["review_text"].fillna("").values

    print(f"Data shapes -> Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
    print("Train class balance:", pd.Series(y_train).value_counts().to_dict())

    feature_pipe = build_feature_pipeline(max_tfidf_features=2500)

    candidate_pipelines = {
        "logistic_regression": Pipeline([
            ("features", feature_pipe),
            ("scaler", StandardScaler(with_mean=False)),
            ("classifier", LogisticRegression(max_iter=1500, C=0.5, random_state=42, class_weight="balanced"))
        ]),
        "random_forest": Pipeline([
            ("features", feature_pipe),
            ("classifier", RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1, class_weight="balanced"))
        ]),
        "gradient_boosting": Pipeline([
            ("features", feature_pipe),
            ("to_dense", DenseTransformer()),
            ("classifier", HistGradientBoostingClassifier(max_iter=80, max_depth=6, random_state=42, class_weight="balanced"))
        ])
    }

    results = {}
    best_name = None
    best_f1 = -1.0
    best_pipeline = None

    for name, pipeline in candidate_pipelines.items():
        print(f"\n--- Training {name} ---")
        pipeline.fit(X_train, y_train)

        # Validation evaluation
        val_pred = pipeline.predict(X_val)
        val_probs = pipeline.predict_proba(X_val)
        metrics = evaluate_multiclass_classification(y_val, val_pred, val_probs, labels=[0, 1, 2])

        results[name] = metrics
        print(f"[{name}] Val Acc: {metrics['accuracy']:.4f} | Macro F1: {metrics['macro_f1']:.4f} | ROC-AUC: {metrics['roc_auc']:.4f} | ECE: {metrics['ece']:.4f}")

        if metrics["macro_f1"] > best_f1:
            best_f1 = metrics["macro_f1"]
            best_name = name
            best_pipeline = pipeline

    # Final Test Set Evaluation
    print(f"\n=================================================================")
    print(f"CHAMPION AUTHORSHIP MODEL SELECTED: {best_name} (Val Macro F1: {best_f1:.4f})")
    test_pred = best_pipeline.predict(X_test)
    test_probs = best_pipeline.predict_proba(X_test)
    test_metrics = evaluate_multiclass_classification(y_test, test_pred, test_probs, labels=[0, 1, 2])
    print(f"LOCKED TEST EVALUATION: Acc: {test_metrics['accuracy']:.4f} | Macro F1: {test_metrics['macro_f1']:.4f} | ROC-AUC: {test_metrics['roc_auc']:.4f} | ECE: {test_metrics['ece']:.4f}")
    print("=================================================================")

    # Save artifacts
    model_artifact_path = ARTIFACTS_DIR / f"authorship_{best_name}.joblib"
    joblib.dump(best_pipeline, model_artifact_path)

    metrics_path = ARTIFACTS_DIR / "authorship_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump({
            "champion_model": best_name,
            "classes": class_names,
            "test_metrics": test_metrics,
            "validation_results": results
        }, f, indent=2)

    # Register in DB
    db = SessionLocal()
    try:
        model_rec = db.query(MLModel).filter(MLModel.id == "authorship_classifier").first()
        if not model_rec:
            model_rec = MLModel(
                id="authorship_classifier",
                name="Veritas Authorship Classifier",
                architecture=best_name,
                target_task="authorship",
                description="Stylometric and lexical classifier for Human vs AI vs AI-assisted authorship.",
                is_active=True
            )
            db.add(model_rec)
            db.commit()

        version_rec = db.query(ModelVersion).filter(ModelVersion.id == "authorship_v1.0.0").first()
        if not version_rec:
            version_rec = ModelVersion(
                id="authorship_v1.0.0",
                model_id="authorship_classifier",
                version_tag="v1.0.0",
                artifact_path=str(model_artifact_path),
                parameters={"architecture": best_name, "max_tfidf_features": 2500},
                metrics=test_metrics,
                temperature=1.0,
                abstention_threshold=0.60,
                is_default=True
            )
            db.add(version_rec)
            db.commit()
            print("[DB REGISTRATION] Authorship model registered in SQLite.")
    finally:
        db.close()

    return best_pipeline, test_metrics

if __name__ == "__main__":
    train_authorship_models()
