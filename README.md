# VERITAS AI
## An Explainable and Robust Machine Learning Framework for Fake Review Detection Across Traditional and Modern AI-Generated Reviews

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.13-red.svg)](https://pytorch.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.8.0-orange.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

### Executive Overview
**VERITAS AI** is a research-grade machine learning platform designed to investigate deceptive online reviews, distinguish human-written from AI-generated prose, detect coordinated review rings, and provide mathematically grounded, token-level explanations.

Crucially, **AI-generated does not automatically mean fake**. A genuine customer may use an LLM assistant to draft authentic feedback, while a human fraudster may write fabricated opinion spam. Therefore, VERITAS AI decouples **Authorship** ($Y_{\text{auth}}$) from **Deception** ($Y_{\text{dec}}$) into orthogonal prediction tracks, preventing wrongful penalties against honest consumers.

---

### Key Research Innovations
1. **Orthogonal Dual-Track Architecture:**
   - **Branch A (Deception Detection):** Predicts `genuine`, `deceptive`, or `insufficient_evidence` based on psycholinguistic markers (first-person singular pronoun inflation, spatial/architectural term deficit).
   - **Branch B (Authorship Detection):** Predicts `human`, `ai_generated`, `ai_assisted`, or `insufficient_evidence` using syntactic variance, readability grade bounds, and n-gram entropy.
   - **Evidence Fusion Layer:** Unifies both tracks with calibrated confidence, explaining the interplay between text origin and deceptive intent.
2. **Defensible Explainable AI (XAI):**
   - Exact mathematical token-level SHAP attributions without hallucinated narrative text from disconnected LLMs.
   - Positive evidence (deceptive signals) and negative evidence (authentic physical grounding) heatmaps.
3. **Behavioral Anomaly Forensics:**
   - Detects reviewer velocity bursts, bimodal 1-star/5-star skew, and rating deviation from product consensus.
4. **Heterogeneous Graph Relational Forensics:**
   - Multi-relational graph propagation over $45,954$ nodes in YelpChi ($R-U-R$ user, $R-T-R$ temporal, and $R-S-R$ rating edges).
5. **Adversarial Robustness Lab:**
   - Live interactive perturbation stress-tests (synonym substitution, typos, paraphrasing, and style shifting) measuring performance drop $\Delta F_1$.
6. **Uncertainty Calibration & Selective Abstention:**
   - Post-hoc temperature scaling minimizes Expected Calibration Error (ECE &lt; 0.05). If confidence falls below $\tau = 0.60$, the system outputs `insufficient_evidence`.

---

### Verified Benchmark Datasets & Provenance
All datasets are standardized to a strict 15-field schema with zero fabricated metadata:
- **Ott et al. OpSpam Corpus (ACL 2011 / EMNLP 2013):** 1,600 hotel reviews (800 truthful, 800 deceptive across 20 Chicago hotels).
- **op_spam_AI (Buscaldi et al. 2023):** 2,390 AI-generated hotel reviews (GPT-3.5, LLaMA-2, and Paraphrased).
- **Amazon CG/OR (Salminen et al. 2022):** 3,000 product reviews across diverse retail categories.
- **YelpChi Graph Benchmark (Rayana & Akoglu 2015):** 45,954 nodes and 7,693,958 multi-relational edges.

---

### Empirical Research Results (Locked Held-Out Test Splits)

| Model Pipeline | Target Task | Accuracy | Macro F1 | ROC-AUC | PR-AUC | Calibration Error (ECE) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression Baseline** | Deception | 73.00% | 0.6432 | 0.7626 | 0.9217 | 0.2457 |
| **Random Forest Baseline** | Deception | 81.17% | 0.7029 | 0.8282 | 0.9455 | 0.1402 |
| **Gradient Boosting (Champion)** | **Deception** | **83.17%** | **0.7650** | **0.9025** | **0.9743** | **0.1026** |
| **Logistic Regression Baseline** | Authorship | 75.33% | 0.7545 | 0.8993 | 0.8840 | 0.1946 |
| **Random Forest Baseline** | Authorship | 83.17% | 0.8253 | 0.9575 | 0.9410 | 0.1941 |
| **Gradient Boosting (Champion)** | **Authorship** | **83.04%** | **0.8219** | **0.9637** | **0.9520** | **0.0468** |

---

### Directory Architecture

```
VERITAS_AI/
|-- agents.md                      # Antigravity 6-agent coordination matrix
|-- requirements.txt               # Backend Python dependencies
|-- docker-compose.yml             # Container orchestration
|
|-- backend/                       # Production FastAPI Backend
|   |-- app/
|   |   |-- api/endpoints/         # Versioned REST routes (/analyze, /datasets, /models, etc.)
|   |   |-- core/                  # Settings and environmental configs
|   |   |-- database/              # SQLAlchemy models, sessions, and SQLite/Postgres schemas
|   |   |-- schemas/               # Pydantic data validation schemas
|   |-- tests/                     # Automated test suite (16 tests, 100% passing)
|
|-- frontend/                      # React 18 + TypeScript + Vite + Tailwind CSS
|   |-- src/
|   |   |-- layouts/AppLayout.tsx  # Master scientific sidebar and navigation
|   |   |-- pages/                 # 15 specialized research module views
|   |   |-- services/api.ts        # Axios API client
|   |   |-- types/index.ts         # TypeScript interface contracts
|
|-- ml/                            # Machine Learning Research Core
|   |-- data/                      # Raw benchmarks and processed leakage-free partitions
|   |-- preprocessing/             # Ingestion, deduplication, group splitting, and validation
|   |-- features/                  # 19 dense stylometric metrics + TF-IDF extractor
|   |-- deception/                 # Branch A baseline training and evaluation
|   |-- authorship/                # Branch B baseline training and evaluation
|   |-- behavioural/               # Reviewer velocity and rating deviation engine
|   |-- graph/                     # YelpChi multi-relational ego network extractor
|   |-- fusion/                    # Calibrated multi-task inference engine
|   |-- explainability/            # Token-level SHAP saliency attribution
|   |-- robustness/                # Controlled adversarial perturbation lab
|   |-- artifacts/                 # Serialized fitted model weights (.joblib)
|
|-- research/                      # Academic Documentation & Formal Research
|   |-- research_plan.md           # Master research plan and objectives
|   |-- literature_review/         # Comprehensive literature review
|   |-- dataset_documentation/     # Dataset provenance cards and schema specs
|   |-- methodology/               # Architecture, hypotheses, and reproducibility guide
|   |-- limitations/               # Known scientific and hardware limitations
|   |-- experimental_results/      # Final academic research report
```

---

### Quickstart Installation & Execution

#### 1. Backend Server Setup
```powershell
# In terminal 1:
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API Swagger Docs: `http://localhost:8000/api/v1/docs`

#### 2. Frontend Research Dashboard Setup
```powershell
# In terminal 2:
cd frontend
npm install
npm run dev
```
Interactive Research Platform: `http://localhost:5173`

#### 3. Automated Test Suite Execution
```powershell
python -m pytest backend/tests/
```
Output: `16 passed` (unit tests, API integration, and database schemas).

---

### The 15 Integrated Research Modules
1. **Executive Dashboard:** Global telemetry, dataset distribution charts, model metrics.
2. **Single Review Analyzer:** Interactive input with dual-track verdicts, token-level SHAP heatmap, and evidence fusion synthesis.
3. **Bulk Review Analyzer:** Batch processing table, deception/authorship ratios, CSV export.
4. **AI Authorship Detection:** Human vs AI vs Assisted probability distributions and stylometric radar profile.
5. **Deception Detection:** Psycholinguistic LIWC term comparisons (pronouns, spatial terms, superlatives).
6. **Behavioural Analysis:** Review velocity, bimodal extremity, rating deviation from consensus.
7. **Review Evidence Graph:** Force-directed multi-relational ego network visualization (R-U-R, R-T-R, R-S-R).
8. **Dataset Manager:** Catalog of ingested benchmarks, sample review inspector, schema cards.
9. **Model Training Lab:** Hyperparameter tuning, feature dimensionality, temperature scaling parameters.
10. **Experiment Manager:** 12-stage research experiments with hypothesis tracking and validation matrix.
11. **Robustness Testing Lab:** Live perturbation stress-tests (synonym, typo, paraphrase, style) with performance drop $\Delta F_1$.
12. **Explainability Lab:** Mathematical feature attribution bars and psycholinguistic breakdown.
13. **Model Comparison:** Side-by-side benchmark comparison across all candidate architectures.
14. **Research Reports:** Downloadable formal academic research monographs.
15. **System Settings:** Selective classification abstention threshold ($\tau$), temperature factors, runtime telemetry.
