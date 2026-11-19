export interface HealthStatus {
  status: string;
  project: string;
  environment: string;
  version: string;
  torch_available: boolean;
  cuda_available: boolean;
  timestamp: string;
}

export interface DeceptionResult {
  label: 'genuine' | 'deceptive' | 'insufficient_evidence';
  confidence: number;
  calibrated_probability: number;
  is_abstained: boolean;
  abstention_reason: string | null;
}

export interface AuthorshipResult {
  label: 'human' | 'ai_generated' | 'ai_assisted' | 'insufficient_evidence';
  confidence: number;
  calibrated_probability: number;
  probabilities?: {
    human: number;
    ai_generated: number;
    ai_assisted: number;
  };
  is_abstained: boolean;
  abstention_reason: string | null;
}

export interface BehavioralAnomaly {
  has_metadata: boolean;
  anomaly_score: number | null;
  rating_deviation: number | null;
  temporal_burst_detected: boolean | null;
  review_frequency_flag: boolean | null;
  interpretation: string;
}

export interface TokenAttribution {
  token: string;
  score: number;
  importance: 'positive_deceptive' | 'positive_ai' | 'neutral' | 'negative_genuine';
}

export interface ExplanationDetails {
  explanation_method: string;
  top_positive_features: Array<{ feature: string; weight: number; category: string }>;
  top_negative_features: Array<{ feature: string; weight: number; category: string }>;
  token_attributions?: TokenAttribution[];
  linguistic_summary: {
    word_count: number;
    sentence_count: number;
    flesch_kincaid_grade: number;
    first_person_pronouns: number;
    first_person_ratio: number;
    spatial_concrete_terms: number;
    superlatives_count: number;
    uppercase_letters: number;
  };
}

export interface SingleReviewAnalysis {
  review_id: string;
  deception: DeceptionResult;
  authorship: AuthorshipResult;
  behavioral: BehavioralAnomaly;
  explanation: ExplanationDetails;
  evidence_fusion_summary: string;
  model_version: string;
  analyzed_at: string;
}

export interface DatasetItem {
  id: string;
  name: string;
  description: string;
  source_type: string;
  domain: string;
  license: string;
  sample_count: number;
  created_at: string;
}

export interface ModelItem {
  id: string;
  name: string;
  architecture: string;
  target_task: string;
  is_active: boolean;
  versions_count: number;
  created_at: string;
}

export interface ExperimentItem {
  id: string;
  name: string;
  type: string;
  hypothesis: string;
  status: string;
  champion_model: string;
  macro_f1: number;
  roc_auc: number;
  ece: number;
}

export interface RobustnessEvalResult {
  id: string;
  transformation_type: string;
  perturbation_intensity: number;
  baseline_macro_f1: number;
  perturbed_macro_f1: number;
  performance_drop: number;
  resilience_percentage: number;
  sample_comparisons: Array<{
    original_text: string;
    perturbed_text: string;
    original_prediction: string;
    original_confidence: number;
    perturbed_prediction: string;
    perturbed_confidence: number;
    prediction_flipped: boolean;
  }>;
}

export interface GraphEgoNetwork {
  node_id: number;
  target_is_fraud: boolean;
  total_graph_nodes: number;
  degree_centrality: number;
  neighbor_fraud_ratio: number;
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    is_fraud: boolean;
    degree: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    relation: string;
  }>;
}
