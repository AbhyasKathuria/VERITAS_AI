# Antigravity Multi-Agent Organisation: VERITAS AI
## Project Coordination & Responsibility Matrix

VERITAS AI operates as a collaborative multi-disciplinary research team consisting of six specialised agents, coordinated by the **Research Architect**. Each agent adheres to explicit interface contracts, rigorous scientific methodologies, and reproducible engineering standards.

---

### Agent 1: Research Architect (Coordinator)
- **Primary Mandate:** System architecture, cross-agent coordination, experimental methodology, and scientific integrity.
- **Responsibilities:**
  - Defines shared schema contracts between NLP, Graph, Backend, and Frontend modules.
  - Ensures research hypotheses are rigorously tested without circular reasoning or metric fabrication.
  - Reviews output artifacts and audit reports from the QA agent.
  - Arbitrates engineering trade-offs regarding computational feasibility and domain validity.
- **Key Deliverables:** `research_plan.md`, `architecture.md`, `agents.md`.

---

### Agent 2: ML / NLP Engineer
- **Primary Mandate:** Dual-track text classification (Deception Detection vs. Authorship Detection) and feature engineering.
- **Responsibilities:**
  - Implements lexical, syntactic, LIWC-style, readability, and statistical text feature extractors.
  - Trains and calibrates baseline models (Logistic Regression, Multinomial Naive Bayes, Random Forest, Gradient Boosting).
  - Implements Transformer-based sequence classification (DistilBERT / RoBERTa) with frozen/fine-tuned inference.
  - Formulates the orthogonal dual-track classification pipelines:
    - Branch A: Deception ($\text{Genuine} \mid \text{Deceptive} \mid \text{Insufficient Evidence}$)
    - Branch B: Authorship ($\text{Human} \mid \text{AI-Generated} \mid \text{AI-Assisted} \mid \text{Insufficient Evidence}$)
  - Implements temperature scaling and probability calibration.
- **Key Deliverables:** `ml/features/`, `ml/deception/`, `ml/authorship/`, `ml/fusion/`.

---

### Agent 3: Graph & Robustness Engineer
- **Primary Mandate:** Reviewer-product graph modeling, reviewer behavioral anomaly detection, and adversarial robustness testing.
- **Responsibilities:**
  - Constructs multi-relational graphs (Reviewer-Product, Reviewer-Time-Reviewer, Rating co-occurrence).
  - Implements behavioral anomaly indicators (review velocity, temporal burstiness, rating entropy, duplicate content vectors).
  - Implements GNN / GraphSAGE feature propagation and graph-derived representations.
  - Builds the Adversarial Robustness Lab: synonym replacement, character perturbation, paraphrasing, and style transformation.
  - Measures empirical performance degradation under controlled perturbations ($\Delta F_1$, $\Delta \text{AUC}$).
- **Key Deliverables:** `ml/behavioural/`, `ml/graph/`, `ml/robustness/`.

---

### Agent 4: Backend Engineer
- **Primary Mandate:** Production REST API, model inference pipeline, database ORM, and background execution services.
- **Responsibilities:**
  - Implements FastAPI endpoints according to the versioned REST specification (`/api/v1/...`).
  - Manages SQLite / PostgreSQL schemas for datasets, models, predictions, explanations, and audit logs.
  - Implements asynchronous task queues and job managers for long-running training and batch evaluation tasks.
  - Manages model artifact serialization (`joblib`, `torch.save`, ONNX/safetensors) and versioning.
  - Implements input sanitization, safe file uploading, and error-handling middleware.
- **Key Deliverables:** `backend/app/`, `backend/tests/`, `configs/`.

---

### Agent 5: Frontend Engineer & UI/UX Designer
- **Primary Mandate:** Responsive, scientific research interface with real-time data visualisations and explainability views.
- **Responsibilities:**
  - Implements the React + TypeScript + Vite + Tailwind CSS interface following the deep-navy / slate / scientific design palette.
  - Builds the 15 core application modules: Executive Dashboard, Single Review Analyzer, Bulk Review Analyzer, AI Authorship Detection, Deception Detection, Behavioural Analysis, Review Evidence Graph, Dataset Manager, Model Training Lab, Experiment Manager, Robustness Testing Lab, Explainability Lab, Model Comparison, Research Reports, System Settings.
  - Implements interactive token-level SHAP/saliency heatmaps, confusion matrices, ROC/PR curves, and NetworkX/force-directed graph visualisations.
  - Connects strictly to backend REST endpoints with live state, skeleton loaders, and zero fabricated/hardcoded mock metrics.
- **Key Deliverables:** `frontend/src/`.

---

### Agent 6: QA & Research Auditor
- **Primary Mandate:** Code quality, automated testing, metric verification, data leakage auditing, and ethical compliance.
- **Responsibilities:**
  - Validates that training, validation, and test splits are strictly partitioned (no reviewer, product, or prompt leakage).
  - Executes unit, integration, and end-to-end API tests.
  - Audits experimental claims against reproducible logs and confusion matrices.
  - Verifies that uncertainty is preserved and no uncalibrated probability is presented as factual truth.
  - Ensures compliance with dataset licenses and anonymization of reviewer personally identifiable information.
- **Key Deliverables:** `research/experimental_results/`, `backend/tests/`, audit checklists.

---

## Inter-Agent Operational Protocols
1. **Interface Contract Primacy:** Changes to API schemas (`backend/app/schemas/`) or feature extraction formats (`ml/features/`) require sign-off before downstream implementation.
2. **Reproducibility Mandate:** Random seeds (`seed=42`), library versions, hardware specs, and split indices must be recorded for every experiment.
3. **No Metric Hallucination:** Under no circumstance may an agent report synthetic or simulated metrics in research documentation or production UI. Unfinished runs are marked `PENDING` or `UNAVAILABLE`.
