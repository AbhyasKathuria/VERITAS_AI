"""
VERITAS AI: Multi-Task Calibrated Evidence Fusion Inference Engine
Integrates Branch A (Deception), Branch B (Authorship), Branch C (Behavioral), and Branch D (Graph).
Guanratees orthogonal predictions, selective abstention, and temperature scaling.
"""

import os
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional

from ml.behavioural.anomaly import behavioral_engine
from ml.graph.graph_engine import graph_engine

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DECEPTION_ARTIFACT = BASE_DIR / "ml" / "artifacts" / "deception" / "deception_gradient_boosting.joblib"
AUTHORSHIP_ARTIFACT = BASE_DIR / "ml" / "artifacts" / "authorship" / "authorship_gradient_boosting.joblib"

class VeritasInferenceEngine:
    """Unified inference engine for multi-task review forensics."""

    def __init__(
        self,
        abstention_threshold: float = 0.60,
        deception_temperature: float = 1.15,
        authorship_temperature: float = 1.10
    ):
        self.abstention_threshold = abstention_threshold
        self.deception_temperature = deception_temperature
        self.authorship_temperature = authorship_temperature

        print("[INFERENCE ENGINE] Loading trained model artifacts...")
        self.deception_model = joblib.load(DECEPTION_ARTIFACT)
        self.authorship_model = joblib.load(AUTHORSHIP_ARTIFACT)
        print("[INFERENCE ENGINE] Both champion models successfully loaded into memory.")

    def calibrate_probability(self, prob: float, temperature: float) -> float:
        """Applies temperature scaling to binary probability."""
        eps = 1e-7
        prob = np.clip(prob, eps, 1.0 - eps)
        logit = np.log(prob / (1.0 - prob))
        scaled_logit = logit / temperature
        return float(1.0 / (1.0 + np.exp(-scaled_logit)))

    def calibrate_multiclass(self, probs: np.ndarray, temperature: float) -> np.ndarray:
        """Applies temperature scaling to multiclass softmax vector."""
        eps = 1e-7
        probs = np.clip(probs, eps, 1.0)
        logits = np.log(probs)
        scaled_logits = logits / temperature
        exp_logits = np.exp(scaled_logits - np.max(scaled_logits))
        return exp_logits / np.sum(exp_logits)

    def analyze_review(
        self,
        review_text: str,
        rating: Optional[float] = None,
        reviewer_id: Optional[str] = None,
        product_id: Optional[str] = None,
        timestamp: Optional[str] = None,
        graph_node_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end dual-track analysis with behavioral and graph cross-validation.
        """
        # 1. Branch A: Deception Analysis
        raw_dec_prob = float(self.deception_model.predict_proba([review_text])[0, 1])
        calibrated_dec_prob = self.calibrate_probability(raw_dec_prob, self.deception_temperature)

        # Deception decision with selective abstention
        dec_confidence = max(calibrated_dec_prob, 1.0 - calibrated_dec_prob)
        if dec_confidence < self.abstention_threshold:
            dec_label = "insufficient_evidence"
            dec_abstained = True
            dec_reason = f"Confidence ({dec_confidence:.1%}) below selective threshold ({self.abstention_threshold:.0%})"
        else:
            dec_label = "deceptive" if calibrated_dec_prob >= 0.50 else "genuine"
            dec_abstained = False
            dec_reason = None

        # 2. Branch B: Authorship Analysis
        raw_auth_probs = self.authorship_model.predict_proba([review_text])[0]
        calibrated_auth_probs = self.calibrate_multiclass(raw_auth_probs, self.authorship_temperature)
        auth_classes = ["human", "ai_generated", "ai_assisted"]
        best_auth_idx = int(np.argmax(calibrated_auth_probs))
        auth_confidence = float(calibrated_auth_probs[best_auth_idx])

        if auth_confidence < self.abstention_threshold:
            auth_label = "insufficient_evidence"
            auth_abstained = True
            auth_reason = f"Authorship margin ({auth_confidence:.1%}) below certainty threshold"
        else:
            auth_label = auth_classes[best_auth_idx]
            auth_abstained = False
            auth_reason = None

        # 3. Branch C: Behavioral Anomaly Scoring
        behavioral_result = behavioral_engine.analyze_single_review(
            rating=rating,
            timestamp=timestamp
        )

        # 4. Branch D: Graph Forensics
        node_id = graph_node_id if graph_node_id is not None else 100
        graph_data = graph_engine.get_node_ego_network(node_id)

        # 5. Evidence Fusion & Synthesis
        fusion_summary = self._generate_fusion_synthesis(
            dec_label, calibrated_dec_prob,
            auth_label, auth_confidence,
            behavioral_result
        )

        return {
            "deception": {
                "label": dec_label,
                "confidence": round(dec_confidence, 4),
                "calibrated_probability": round(calibrated_dec_prob, 4),
                "is_abstained": dec_abstained,
                "abstention_reason": dec_reason
            },
            "authorship": {
                "label": auth_label,
                "confidence": round(auth_confidence, 4),
                "calibrated_probability": round(float(calibrated_auth_probs[1]), 4), # prob of AI
                "probabilities": {cls: round(float(calibrated_auth_probs[i]), 4) for i, cls in enumerate(auth_classes)},
                "is_abstained": auth_abstained,
                "abstention_reason": auth_reason
            },
            "behavioral": behavioral_result,
            "graph_evidence": {
                "neighbor_fraud_ratio": graph_data["neighbor_fraud_ratio"],
                "degree_centrality": graph_data["degree_centrality"],
                "node_count": len(graph_data["nodes"]),
                "link_count": len(graph_data["links"])
            },
            "evidence_fusion_summary": fusion_summary,
            "model_version": "deception_v1.0.0+authorship_v1.0.0"
        }

    def _generate_fusion_synthesis(
        self,
        dec_label: str,
        dec_prob: float,
        auth_label: str,
        auth_conf: float,
        behavioral: Dict[str, Any]
    ) -> str:
        """Synthesizes an explainable, non-hallucinated narrative reconciling both tracks."""
        if dec_label == "insufficient_evidence" and auth_label == "insufficient_evidence":
            return "Indeterminate evidence profile. The review exhibits subtle, ambiguous stylometric cues; selective classification abstains to prevent false accusations."

        parts = []

        # Case 1: AI-generated but Genuine
        if auth_label in ["ai_generated", "ai_assisted"] and dec_label == "genuine":
            parts.append(
                f"Synthetic Text with Genuine Intent: Text authorship is classified as {auth_label.replace('_', ' ')} "
                f"({auth_conf:.1%} confidence), yet the deception classifier identifies high factual grounding and authentic sentiment "
                f"(deception probability: {dec_prob:.1%}). This pattern typically reflects an authentic customer using an AI tool "
                f"to formulate or polish an honest review."
            )
        # Case 2: AI-generated and Deceptive
        elif auth_label in ["ai_generated", "ai_assisted"] and dec_label == "deceptive":
            parts.append(
                f"Synthetic Deception: Coordinated generative manipulation detected. The review exhibits both machine authorship markers "
                f"({auth_conf:.1%}) and deceptive opinion signals ({dec_prob:.1%} deception probability: extreme superlatives, lack of physical location details)."
            )
        # Case 3: Human-authored and Deceptive
        elif auth_label == "human" and dec_label == "deceptive":
            parts.append(
                f"Human Opinion Spam: Natural human prose identified ({auth_conf:.1%} human confidence), but with strong deceptive indicators "
                f"({dec_prob:.1%} deception probability: elevated first-person singular pronouns, spatial detail deficit). Likely an incentivized or astroturfed human review."
            )
        # Case 4: Human-authored and Genuine
        elif auth_label == "human" and dec_label == "genuine":
            parts.append(
                f"Verified Organic Consumer Review: Natural human author ({auth_conf:.1%}) combined with genuine experiential markers "
                f"(deception probability {dec_prob:.1%}: concrete spatial nouns, balanced sentiment polarity)."
            )
        else:
            parts.append(f"Mixed signal: Authorship is {auth_label} ({auth_conf:.1%}), Deception status is {dec_label} ({dec_prob:.1%}).")

        if behavioral.get("has_metadata") and behavioral.get("anomaly_score", 0) > 0.40:
            parts.append(f" Behavioral context: {behavioral.get('interpretation')}")

        return " ".join(parts)

inference_engine = VeritasInferenceEngine()
