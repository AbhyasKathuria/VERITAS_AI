"""
VERITAS AI: Adversarial Robustness & Generalization Engine
Executes controlled text transformations (synonym, paraphrase, spelling, style) and measures resilience.
"""

import re
import random
import uuid
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any
from sklearn.metrics import f1_score

from ml.fusion.inference import inference_engine
from backend.app.database.session import SessionLocal
from backend.app.database.models import RobustnessEvaluation

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "ml" / "data" / "processed"

# Controlled synonym mapping
SYNONYM_DICT = {
    "hotel": ["property", "lodging", "resort", "inn"],
    "room": ["suite", "quarters", "chamber", "space"],
    "clean": ["spotless", "immaculate", "tidy", "hygienic"],
    "dirty": ["soiled", "unclean", "grimy", "filthy"],
    "great": ["fantastic", "excellent", "superb", "terrific"],
    "bad": ["poor", "substandard", "inferior", "dismal"],
    "staff": ["employees", "personnel", "team", "workers"],
    "stay": ["visit", "vacation", "trip", "sojourn"],
    "friendly": ["hospitable", "courteous", "welcoming", "accommodating"],
    "recommend": ["endorse", "suggest", "advocate", "vouch for"]
}

class RobustnessLabEngine:
    """Evaluates classifier resilience against intentional adversarial transformations."""

    def apply_transformation(self, text: str, transform_type: str, intensity: float = 0.20) -> str:
        """Applies controlled perturbation based on transform_type and intensity (0.0 to 1.0)."""
        words = text.split()
        if not words:
            return text

        if transform_type == "synonym":
            # Replace candidate words with synonyms
            new_words = []
            for w in words:
                clean_w = re.sub(r'[^\w]', '', w.lower())
                if clean_w in SYNONYM_DICT and random.random() < intensity:
                    syn = random.choice(SYNONYM_DICT[clean_w])
                    # Preserve capitalization
                    if w.istitle():
                        syn = syn.capitalize()
                    new_words.append(syn)
                else:
                    new_words.append(w)
            return " ".join(new_words)

        elif transform_type == "spelling":
            # Introduce character typos/swaps
            new_words = []
            for w in words:
                if len(w) > 4 and random.random() < intensity:
                    idx = random.randint(1, len(w) - 2)
                    chars = list(w)
                    chars[idx], chars[idx+1] = chars[idx+1], chars[idx]
                    new_words.append("".join(chars))
                else:
                    new_words.append(w)
            return " ".join(new_words)

        elif transform_type == "paraphrase":
            # Structural alteration: clause reordering and connective substitution
            sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
            if len(sentences) >= 2 and random.random() < intensity:
                random.shuffle(sentences)
                return ". ".join(sentences) + "."
            return text

        elif transform_type == "style":
            # Style edit: lowering exclamation marks and substituting first-person framing
            perturbed = text.replace("!", ".").replace("I felt", "The experience felt").replace("I noticed", "One could observe")
            return perturbed

        return text

    def run_evaluation(
        self,
        transformation_type: str = "synonym",
        perturbation_intensity: float = 0.25,
        sample_count: int = 60
    ) -> Dict[str, Any]:
        """
        Runs robustness evaluation over held-out test reviews.
        """
        test_path = PROCESSED_DIR / "test.csv"
        df_test = pd.read_csv(test_path).head(sample_count)

        label_map = {"genuine": 0, "deceptive": 1}
        y_true = df_test["deception_label"].map(label_map).values
        raw_texts = df_test["review_text"].values

        # 1. Baseline predictions
        base_preds = []
        for t in raw_texts:
            res = inference_engine.analyze_review(t)
            base_preds.append(1 if res["deception"]["label"] == "deceptive" else 0)
        base_f1 = float(f1_score(y_true, base_preds, average="macro", zero_division=0))

        # 2. Perturbed predictions
        perturbed_texts = [
            self.apply_transformation(t, transformation_type, perturbation_intensity)
            for t in raw_texts
        ]

        perturbed_preds = []
        comparisons = []
        for i, (orig, pert) in enumerate(zip(raw_texts, perturbed_texts)):
            res_orig = inference_engine.analyze_review(orig)
            res_pert = inference_engine.analyze_review(pert)

            p_val = 1 if res_pert["deception"]["label"] == "deceptive" else 0
            perturbed_preds.append(p_val)

            if len(comparisons) < 5:
                comparisons.append({
                    "original_text": orig[:180] + "..." if len(orig) > 180 else orig,
                    "perturbed_text": pert[:180] + "..." if len(pert) > 180 else pert,
                    "original_prediction": res_orig["deception"]["label"],
                    "original_confidence": res_orig["deception"]["confidence"],
                    "perturbed_prediction": res_pert["deception"]["label"],
                    "perturbed_confidence": res_pert["deception"]["confidence"],
                    "prediction_flipped": bool(res_orig["deception"]["label"] != res_pert["deception"]["label"])
                })

        pert_f1 = float(f1_score(y_true, perturbed_preds, average="macro", zero_division=0))
        performance_drop = float(max(0.0, base_f1 - pert_f1))
        resilience_pct = float(max(0.0, 1.0 - (performance_drop / max(1e-5, base_f1))) * 100.0)

        eval_id = str(uuid.uuid4())
        record = {
            "id": eval_id,
            "transformation_type": transformation_type,
            "perturbation_intensity": perturbation_intensity,
            "baseline_macro_f1": round(base_f1, 4),
            "perturbed_macro_f1": round(pert_f1, 4),
            "performance_drop": round(performance_drop, 4),
            "resilience_percentage": round(resilience_pct, 1),
            "sample_comparisons": comparisons
        }

        # Persist to database
        db = SessionLocal()
        try:
            db_eval = RobustnessEvaluation(
                id=eval_id,
                model_version_id="deception_v1.0.0",
                transformation_type=transformation_type,
                perturbation_intensity=perturbation_intensity,
                baseline_macro_f1=base_f1,
                perturbed_macro_f1=pert_f1,
                performance_drop=performance_drop,
                eval_details={"sample_comparisons": comparisons}
            )
            db.add(db_eval)
            db.commit()
        finally:
            db.close()

        return record

robustness_lab = RobustnessLabEngine()
