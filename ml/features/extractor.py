"""
VERITAS AI: Comprehensive Stylometric and Linguistic Feature Extractor
Extracts psycholinguistic, syntactic, readability, and statistical text metrics.
"""

import re
import numpy as np
import pandas as pd
from scipy import sparse
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import FeatureUnion

FIRST_PERSON_SINGULAR = {"i", "me", "my", "mine", "myself"}
FIRST_PERSON_PLURAL = {"we", "us", "our", "ours", "ourselves"}
SECOND_PERSON = {"you", "your", "yours", "yourself", "yourselves"}
THIRD_PERSON = {"he", "him", "his", "she", "her", "hers", "it", "its", "they", "them", "their", "theirs"}

SPATIAL_TERMS = {
    "bathroom", "shower", "bed", "bedroom", "room", "window", "door", "floor", "hallway",
    "elevator", "lobby", "desk", "balcony", "view", "wall", "ceiling", "corner", "carpet",
    "tv", "television", "closet", "sink", "tub", "bathtub", "air", "conditioning", "curtains"
}

SUPERLATIVES = {
    "best", "worst", "amazing", "incredible", "perfect", "horrible", "terrible", "awful",
    "flawless", "outstanding", "spectacular", "phenomenal", "dreadful", "disaster", "heaven"
}

def count_syllables(word: str) -> int:
    word = word.lower().strip()
    if len(word) <= 3:
        return 1
    word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
    word = re.sub(r'^y', '', word)
    syllables = len(re.findall(r'[aeiouy]{1,2}', word))
    return max(1, syllables)

class DenseTransformer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        if sparse.issparse(X):
            return X.toarray()
        return X

class LinguisticStylometricExtractor(BaseEstimator, TransformerMixin):
    """Computes dense stylometric, readability, and psycholinguistic features."""

    def __init__(self):
        self.feature_names = [
            "char_count", "word_count", "sentence_count", "avg_word_length", "avg_sentence_length",
            "type_token_ratio", "hapax_ratio", "flesch_reading_ease", "flesch_kincaid_grade",
            "first_person_sing_ratio", "first_person_plur_ratio", "second_person_ratio", "third_person_ratio",
            "spatial_density", "superlative_density", "exclamation_ratio", "question_ratio",
            "uppercase_ratio", "digit_ratio"
        ]

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        features = []
        for text in X:
            text = str(text) if text is not None else ""
            chars = len(text)
            words = re.findall(r'\b\w+\b', text.lower())
            word_count = max(1, len(words))
            sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
            sent_count = max(1, len(sentences))

            avg_word_len = sum(len(w) for w in words) / word_count
            avg_sent_len = word_count / sent_count

            unique_words = set(words)
            ttr = len(unique_words) / word_count
            word_freqs = pd.Series(words).value_counts() if words else pd.Series()
            hapax_count = (word_freqs == 1).sum() if not word_freqs.empty else 0
            hapax_ratio = hapax_count / word_count

            total_syllables = sum(count_syllables(w) for w in words)
            fre = 206.835 - 1.015 * avg_sent_len - 84.6 * (total_syllables / word_count)
            fkgl = 0.39 * avg_sent_len + 11.8 * (total_syllables / word_count) - 15.59

            fps = sum(1 for w in words if w in FIRST_PERSON_SINGULAR) / word_count
            fpp = sum(1 for w in words if w in FIRST_PERSON_PLURAL) / word_count
            sec = sum(1 for w in words if w in SECOND_PERSON) / word_count
            thi = sum(1 for w in words if w in THIRD_PERSON) / word_count
            spatial = sum(1 for w in words if w in SPATIAL_TERMS) / word_count
            superl = sum(1 for w in words if w in SUPERLATIVES) / word_count

            exclamations = text.count("!") / word_count
            questions = text.count("?") / word_count
            upper_ratio = sum(1 for c in text if c.isupper()) / max(1, chars)
            digit_ratio = sum(1 for c in text if c.isdigit()) / max(1, chars)

            features.append([
                chars, word_count, sent_count, avg_word_len, avg_sent_len,
                ttr, hapax_ratio, fre, fkgl,
                fps, fpp, sec, thi,
                spatial, superl, exclamations, questions,
                upper_ratio, digit_ratio
            ])

        return sparse.csr_matrix(np.nan_to_num(np.array(features, dtype=np.float32)))

    def get_feature_names_out(self, input_features=None):
        return np.array(self.feature_names)

def build_feature_pipeline(max_tfidf_features: int = 2500):
    tfidf_words = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=max_tfidf_features,
        sublinear_tf=True,
        stop_words="english"
    )
    stylometry = LinguisticStylometricExtractor()

    union = FeatureUnion(
        transformer_list=[
            ("tfidf", tfidf_words),
            ("stylometry", stylometry)
        ]
    )
    return union
