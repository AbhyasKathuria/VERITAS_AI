import pytest
import numpy as np
from ml.features.extractor import LinguisticStylometricExtractor, build_feature_pipeline
from ml.evaluation.metrics import compute_expected_calibration_error, evaluate_binary_classification
from ml.behavioural.anomaly import behavioral_engine
from ml.robustness.adversarial import robustness_lab

def test_linguistic_feature_extractor():
    extractor = LinguisticStylometricExtractor()
    sample_texts = [
        "I loved my stay. The bathroom was spotless and the room had large windows.",
        "An absolutely incredible experience! Everything was miraculous."
    ]
    features = extractor.transform(sample_texts)
    assert features.shape[0] == 2
    assert features.shape[1] == 19
    # Dense array check
    dense_arr = features.toarray()
    assert np.all(np.isfinite(dense_arr))

def test_feature_pipeline_construction():
    pipe = build_feature_pipeline(max_tfidf_features=500)
    sample_texts = ["A lovely room in Chicago.", "Terrible customer service and rude staff."]
    transformed = pipe.fit_transform(sample_texts)
    assert transformed.shape[0] == 2
    assert transformed.shape[1] > 20

def test_expected_calibration_error():
    y_true = np.array([1, 1, 0, 0, 1, 0, 1, 0, 1, 0])
    y_prob = np.array([0.9, 0.85, 0.1, 0.15, 0.8, 0.2, 0.75, 0.25, 0.7, 0.3])
    ece = compute_expected_calibration_error(y_true, y_prob, n_bins=5)
    assert isinstance(ece, float)
    assert ece <= 0.25

def test_behavioral_engine_heuristics():
    # Test without metadata
    res_no_meta = behavioral_engine.analyze_single_review(rating=None)
    assert res_no_meta["has_metadata"] is False
    assert res_no_meta["anomaly_score"] is None

    # Test with normal rating
    res_normal = behavioral_engine.analyze_single_review(rating=4.0)
    assert res_normal["has_metadata"] is True
    assert res_normal["anomaly_score"] <= 0.35

    # Test with extreme velocity / burst
    reviewer_hist = [
        {"rating": 5.0, "timestamp": "2026-11-19T10:00:00Z"},
        {"rating": 5.0, "timestamp": "2026-11-19T10:30:00Z"},
        {"rating": 1.0, "timestamp": "2026-11-19T11:00:00Z"},
        {"rating": 5.0, "timestamp": "2026-11-19T11:15:00Z"},
        {"rating": 5.0, "timestamp": "2026-11-19T11:45:00Z"},
    ]
    res_burst = behavioral_engine.analyze_single_review(rating=5.0, reviewer_history=reviewer_hist)
    assert res_burst["anomaly_score"] > 0.40
    assert res_burst["review_frequency_flag"] is True

def test_adversarial_transformations():
    original = "The hotel room was clean and the bathroom was spacious."
    syn_text = robustness_lab.apply_transformation(original, "synonym", intensity=1.0)
    assert isinstance(syn_text, str)
    assert len(syn_text) > 0

    typo_text = robustness_lab.apply_transformation(original, "spelling", intensity=1.0)
    assert isinstance(typo_text, str)
    assert len(typo_text) > 0
