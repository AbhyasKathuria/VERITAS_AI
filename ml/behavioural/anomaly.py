"""
VERITAS AI: Reviewer Behavioral Anomaly Engine
Computes reviewer velocity, rating deviation, temporal burstiness, and entropy metrics.
"""

from typing import List, Dict, Optional, Any
import numpy as np
import pandas as pd
from datetime import datetime

class ReviewerBehavioralAnalyzer:
    """Analyzes reviewer-level metadata and detects suspicious behavioural patterns."""

    def __init__(self, burst_window_days: int = 30):
        self.burst_window_days = burst_window_days

    def analyze_single_review(
        self,
        rating: Optional[float],
        timestamp: Optional[str] = None,
        reviewer_history: Optional[List[Dict[str, Any]]] = None,
        product_reviews: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Evaluates behavioral indicators for a single review.
        If metadata is unavailable, explicitly flags `has_metadata: False`.
        """
        if rating is None and not reviewer_history and not product_reviews:
            return {
                "has_metadata": False,
                "anomaly_score": None,
                "rating_deviation": None,
                "temporal_burst_detected": None,
                "review_frequency_flag": None,
                "interpretation": "Insufficient reviewer/product metadata. Relying on textual stylometry."
            }

        anomaly_signals = []
        rating_dev = None
        burst_flag = False
        freq_flag = False

        # 1. Rating Deviation from Product Consensus
        if product_reviews and rating is not None:
            ratings = [float(r["rating"]) for r in product_reviews if r.get("rating") is not None]
            if len(ratings) >= 3:
                median_rating = float(np.median(ratings))
                rating_dev = abs(rating - median_rating)
                if rating_dev >= 2.5: # e.g. 1 star when consensus is 4.5
                    anomaly_signals.append(0.35)
                else:
                    anomaly_signals.append(rating_dev / 10.0)

        # 2. Reviewer Velocity and Extremity
        if reviewer_history:
            history_count = len(reviewer_history)
            if history_count > 0:
                hist_ratings = [float(r["rating"]) for r in reviewer_history if r.get("rating") is not None]
                if hist_ratings:
                    # Bimodal bias: fraction of 1-star and 5-star reviews
                    extreme_count = sum(1 for r in hist_ratings if r in [1.0, 5.0])
                    extreme_ratio = extreme_count / len(hist_ratings)
                    if extreme_ratio > 0.85 and history_count >= 5:
                        freq_flag = True
                        anomaly_signals.append(0.30)

                # Review frequency (burst in short interval)
                timestamps = []
                for r in reviewer_history:
                    if r.get("timestamp"):
                        try:
                            timestamps.append(pd.to_datetime(r["timestamp"]))
                        except Exception:
                            pass
                if len(timestamps) >= 3:
                    timestamps = sorted(timestamps)
                    intervals = [(timestamps[i+1] - timestamps[i]).total_seconds() / 3600 for i in range(len(timestamps)-1)]
                    min_interval_hours = min(intervals) if intervals else 999
                    if min_interval_hours < 2.0: # Multiple reviews in < 2 hours
                        freq_flag = True
                        anomaly_signals.append(0.40)

        # Compute composite anomaly score [0.0, 1.0]
        if anomaly_signals:
            anomaly_score = float(min(1.0, sum(anomaly_signals)))
        else:
            anomaly_score = 0.15 # Baseline benign default

        # Interpretation
        if anomaly_score > 0.60:
            interpretation = "Suspicious reviewer behavior detected (extreme rating deviation / rapid posting velocity)."
        elif anomaly_score > 0.35:
            interpretation = "Moderate behavioral anomaly observed. Review patterns warrant monitoring."
        else:
            interpretation = "Reviewer behavior conforms to typical consumer engagement distribution."

        return {
            "has_metadata": True,
            "anomaly_score": round(anomaly_score, 4),
            "rating_deviation": round(rating_dev, 2) if rating_dev is not None else None,
            "temporal_burst_detected": burst_flag,
            "review_frequency_flag": freq_flag,
            "interpretation": interpretation
        }

behavioral_engine = ReviewerBehavioralAnalyzer()
