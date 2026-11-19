"""
VERITAS AI: Comprehensive Evaluation & Calibration Metrics Suite
Computes Accuracy, Macro/Weighted F1, ROC-AUC, PR-AUC, Confusion Matrix, ECE, and Brier Score.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support, roc_auc_score,
    average_precision_score, confusion_matrix, brier_score_loss
)

def compute_expected_calibration_error(y_true, y_prob, n_bins: int = 10) -> float:
    """Computes Expected Calibration Error (ECE) with equal-width probability bins."""
    bins = np.linspace(0.0, 1.0, n_bins + 1)
    bin_indices = np.digitize(y_prob, bins) - 1
    bin_indices = np.clip(bin_indices, 0, n_bins - 1)

    ece = 0.0
    total_samples = len(y_true)

    for i in range(n_bins):
        mask = bin_indices == i
        bin_size = np.sum(mask)
        if bin_size > 0:
            bin_acc = np.mean(y_true[mask])
            bin_conf = np.mean(y_prob[mask])
            ece += (bin_size / total_samples) * np.abs(bin_acc - bin_conf)

    return float(ece)

def evaluate_binary_classification(y_true, y_pred, y_prob) -> dict:
    """Evaluates binary deception classification."""
    acc = accuracy_score(y_true, y_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    
    try:
        roc_auc = float(roc_auc_score(y_true, y_prob))
    except Exception:
        roc_auc = 0.5

    try:
        pr_auc = float(average_precision_score(y_true, y_prob))
    except Exception:
        pr_auc = 0.5

    cm = confusion_matrix(y_true, y_pred).tolist()
    ece = compute_expected_calibration_error(np.array(y_true), np.array(y_prob))
    brier = float(brier_score_loss(y_true, y_prob))

    return {
        "accuracy": float(acc),
        "macro_f1": float(f1_macro),
        "macro_precision": float(p_macro),
        "macro_recall": float(r_macro),
        "weighted_f1": float(f1_wt),
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "ece": float(ece),
        "brier_score": brier,
        "confusion_matrix": cm
    }

def evaluate_multiclass_classification(y_true, y_pred, y_probs, labels: list) -> dict:
    """Evaluates multi-class authorship classification."""
    acc = accuracy_score(y_true, y_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=labels).tolist()

    # Multi-class ROC AUC (One-vs-Rest)
    try:
        roc_auc = float(roc_auc_score(y_true, y_probs, multi_class="ovr", average="macro"))
    except Exception:
        roc_auc = 0.5

    # Multi-class ECE (over max confidence)
    max_probs = np.max(y_probs, axis=1)
    correct = (np.array(y_true) == np.array(y_pred)).astype(int)
    ece = compute_expected_calibration_error(correct, max_probs)

    return {
        "accuracy": float(acc),
        "macro_f1": float(f1_macro),
        "macro_precision": float(p_macro),
        "macro_recall": float(r_macro),
        "weighted_f1": float(f1_wt),
        "roc_auc": roc_auc,
        "ece": float(ece),
        "confusion_matrix": cm,
        "classes": labels
    }
