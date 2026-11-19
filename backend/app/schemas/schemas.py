from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Health
class HealthResponse(BaseModel):
    status: str
    project: str
    environment: str
    version: str
    torch_available: bool
    cuda_available: bool
    timestamp: datetime

# Review Analysis
class SingleReviewAnalysisRequest(BaseModel):
    review_text: str = Field(..., min_length=5, description="The review text to analyze")
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    product_category: Optional[str] = "general"
    reviewer_id: Optional[str] = None
    product_id: Optional[str] = None
    timestamp: Optional[str] = None
    explanation_method: Optional[str] = "shap"

class TokenAttribution(BaseModel):
    token: str
    score: float
    importance: str # positive_deceptive, positive_ai, neutral, negative_genuine

class ExplanationDetails(BaseModel):
    explanation_method: str
    top_positive_features: List[Dict[str, Any]]
    top_negative_features: List[Dict[str, Any]]
    token_attributions: Optional[List[TokenAttribution]] = None
    linguistic_summary: Dict[str, Any]

class DeceptionPrediction(BaseModel):
    label: str # genuine, deceptive, insufficient_evidence
    confidence: float
    calibrated_probability: float
    is_abstained: bool
    abstention_reason: Optional[str] = None

class AuthorshipPrediction(BaseModel):
    label: str # human, ai_generated, ai_assisted, insufficient_evidence
    confidence: float
    calibrated_probability: float
    is_abstained: bool
    abstention_reason: Optional[str] = None

class BehavioralAnomaly(BaseModel):
    has_metadata: bool
    anomaly_score: Optional[float] = None
    rating_deviation: Optional[float] = None
    temporal_burst_detected: Optional[bool] = None
    review_frequency_flag: Optional[bool] = None
    interpretation: str

class SingleReviewAnalysisResponse(BaseModel):
    review_id: str
    deception: DeceptionPrediction
    authorship: AuthorshipPrediction
    behavioral: BehavioralAnomaly
    explanation: ExplanationDetails
    evidence_fusion_summary: str
    model_version: str
    analyzed_at: datetime

class BatchAnalysisRequest(BaseModel):
    reviews: List[SingleReviewAnalysisRequest]

class BatchAnalysisResponse(BaseModel):
    total_processed: int
    results: List[SingleReviewAnalysisResponse]
    summary: Dict[str, Any]

# Datasets
class DatasetSummary(BaseModel):
    id: str
    name: str
    description: Optional[str]
    source_type: str
    domain: str
    license: Optional[str]
    sample_count: int
    created_at: datetime

class DatasetDetail(DatasetSummary):
    versions: List[Dict[str, Any]]

# Models
class ModelSummary(BaseModel):
    id: str
    name: str
    architecture: str
    target_task: str
    is_active: bool
    versions_count: int
    created_at: datetime

class ModelVersionDetail(BaseModel):
    id: str
    model_id: str
    version_tag: str
    parameters: Optional[Dict[str, Any]]
    metrics: Optional[Dict[str, Any]]
    temperature: float
    abstention_threshold: float
    is_default: bool
    created_at: datetime

# Experiments
class ExperimentSummary(BaseModel):
    id: str
    name: str
    experiment_type: str
    hypothesis_id: Optional[str]
    status: str
    metrics: Optional[Dict[str, float]]
    created_at: datetime

# Robustness
class RobustnessEvaluateRequest(BaseModel):
    model_version_id: Optional[str] = None
    transformation_type: str # synonym, paraphrase, spelling, grammar
    perturbation_intensity: float = 0.2
    test_samples_count: int = 50

class RobustnessEvaluateResponse(BaseModel):
    id: str
    transformation_type: str
    perturbation_intensity: float
    baseline_macro_f1: float
    perturbed_macro_f1: float
    performance_drop: float
    resilience_percentage: float
    sample_comparisons: List[Dict[str, Any]]
