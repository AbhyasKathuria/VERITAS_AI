from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    source_type = Column(String, nullable=False) # benchmark, custom_upload, synthetic
    domain = Column(String, nullable=False) # hotels, restaurants, products, mixed
    license = Column(String, nullable=True)
    sample_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = relationship("DatasetVersion", back_populates="dataset", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="dataset")

class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    version_tag = Column(String, nullable=False) # v1.0, v1.1
    file_path = Column(String, nullable=False)
    checksum_sha256 = Column(String, nullable=False)
    num_samples = Column(Integer, nullable=False)
    num_genuine = Column(Integer, default=0)
    num_deceptive = Column(Integer, default=0)
    num_human = Column(Integer, default=0)
    num_ai = Column(Integer, default=0)
    split_info = Column(JSON, nullable=True) # train/val/test counts
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="versions")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True) # review_id
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=True)
    review_text = Column(Text, nullable=False)
    deception_label = Column(String, nullable=False) # genuine, deceptive, unknown
    authorship_label = Column(String, nullable=False) # human, ai_generated, ai_assisted, unknown
    source_dataset = Column(String, nullable=False)
    generator_model = Column(String, nullable=True)
    product_category = Column(String, nullable=False)
    rating = Column(Float, nullable=True)
    reviewer_id = Column(String, nullable=True, index=True)
    product_id = Column(String, nullable=True, index=True)
    timestamp = Column(String, nullable=True)
    prompt_id = Column(String, nullable=True)
    edit_type = Column(String, nullable=True)
    provenance = Column(String, nullable=True)
    split_group = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="reviews")
    predictions = relationship("ReviewPrediction", back_populates="review", cascade="all, delete-orphan")
    explanation = relationship("Explanation", back_populates="review", uselist=False, cascade="all, delete-orphan")

class MLModel(Base):
    __tablename__ = "models"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    architecture = Column(String, nullable=False) # logistic_regression, random_forest, distilbert, fusion
    target_task = Column(String, nullable=False) # deception, authorship, multi_task
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    versions = relationship("ModelVersion", back_populates="model", cascade="all, delete-orphan")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String, primary_key=True, index=True)
    model_id = Column(String, ForeignKey("models.id"), nullable=False)
    version_tag = Column(String, nullable=False) # v1.0.0
    artifact_path = Column(String, nullable=False)
    parameters = Column(JSON, nullable=True) # hyperparams
    metrics = Column(JSON, nullable=True) # accuracy, f1_macro, roc_auc, pr_auc, ece
    temperature = Column(Float, default=1.0)
    abstention_threshold = Column(Float, default=0.60)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    model = relationship("MLModel", back_populates="versions")
    predictions = relationship("ReviewPrediction", back_populates="model_version")

class ReviewPrediction(Base):
    __tablename__ = "review_predictions"

    id = Column(String, primary_key=True, index=True)
    review_id = Column(String, ForeignKey("reviews.id"), nullable=False)
    model_version_id = Column(String, ForeignKey("model_versions.id"), nullable=False)
    
    # Dual-track predictions
    deception_prediction = Column(String, nullable=False) # genuine, deceptive, insufficient_evidence
    deception_confidence = Column(Float, nullable=False)
    deception_calibrated_prob = Column(Float, nullable=False)
    
    authorship_prediction = Column(String, nullable=False) # human, ai_generated, ai_assisted, insufficient_evidence
    authorship_confidence = Column(Float, nullable=False)
    authorship_calibrated_prob = Column(Float, nullable=False)

    behavioral_anomaly_score = Column(Float, nullable=True)
    is_abstained = Column(Boolean, default=False)
    abstention_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    review = relationship("Review", back_populates="predictions")
    model_version = relationship("ModelVersion", back_populates="predictions")

class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String, primary_key=True, index=True)
    review_id = Column(String, ForeignKey("reviews.id"), nullable=False)
    explanation_method = Column(String, nullable=False) # shap, lime, linear_attribution
    top_positive_features = Column(JSON, nullable=False) # tokens/features pushing towards deceptive/AI
    top_negative_features = Column(JSON, nullable=False) # tokens/features pushing towards genuine/human
    token_attributions = Column(JSON, nullable=True) # [{token: "...", score: 0.12}, ...]
    linguistic_summary = Column(JSON, nullable=True) # pronoun density, readability, etc.
    created_at = Column(DateTime, default=datetime.utcnow)

    review = relationship("Review", back_populates="explanation")

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    experiment_type = Column(String, nullable=False) # traditional_deception, ai_authorship, fusion, cross_domain, robustness, ablation
    hypothesis_id = Column(String, nullable=True) # H1, H2, H3, H4, H5, H6
    dataset_version_id = Column(String, ForeignKey("dataset_versions.id"), nullable=True)
    config = Column(JSON, nullable=False)
    status = Column(String, default="completed") # pending, running, completed, failed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    results = relationship("ExperimentResult", back_populates="experiment", cascade="all, delete-orphan")

class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    metric_name = Column(String, nullable=False) # accuracy, macro_f1, roc_auc, pr_auc, ece, brier
    metric_value = Column(Float, nullable=False)
    evaluation_split = Column(String, nullable=False) # validation, test, out_of_domain, adversarial
    confusion_matrix = Column(JSON, nullable=True)
    additional_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="results")

class RobustnessEvaluation(Base):
    __tablename__ = "robustness_evaluations"

    id = Column(String, primary_key=True, index=True)
    model_version_id = Column(String, ForeignKey("model_versions.id"), nullable=False)
    transformation_type = Column(String, nullable=False) # synonym, paraphrase, spelling, grammar
    perturbation_intensity = Column(Float, nullable=False)
    baseline_macro_f1 = Column(Float, nullable=False)
    perturbed_macro_f1 = Column(Float, nullable=False)
    performance_drop = Column(Float, nullable=False) # baseline - perturbed
    eval_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    action = Column(String, nullable=False) # predict, train, evaluate, ingest
    entity_type = Column(String, nullable=False) # review, model, dataset, experiment
    entity_id = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
