# VERITAS AI: Master Research & Execution Plan
## An Explainable and Robust Machine Learning Framework for Fake Review Detection Across Traditional and Modern AI-Generated Reviews

### 1. Executive Summary & Problem Formulation
Online consumer reviews represent an indispensable pillar of modern digital commerce, directly influencing multi-billion dollar consumer decisions. Consequently, online review systems are subject to aggressive manipulation through two distinct paradigms:
1. **Traditional Human-Crafted Deceptive Opinion Spam:** Astroturfing campaigns, review farm bounties, and merchant-incentivized fraudulent positive or malicious negative reviews.
2. **Modern Generative AI-Synthesized Reviews:** Mass generation of synthetic product reviews using Large Language Models (LLMs) such as GPT-4, LLaMA, and Gemini, characterised by high fluency, syntactic coherence, and zero grammatical anomalies.

Crucially, existing literature and commercial tools frequently suffer from a fatal conceptual flaw: **conflating AI authorship with deceptive intent**. In reality:
- A genuine customer who stayed at a hotel may prompt an LLM to polish their authentic feedback: **AI-authored, yet Genuine**.
- A human fraudster in a review boiler-room writes a completely fabricated review for \$5: **Human-authored, yet Deceptive**.
- A merchant uses an LLM to mass-generate 500 fake 5-star reviews for a competitor's product: **AI-authored and Deceptive**.

**VERITAS AI** introduces an explainable, robust, dual-track machine learning architecture that disentangles **Authorship** from **Deception**, combines multi-modal metadata and heterogeneous graph relational evidence, quantifies epistemic uncertainty, and delivers defensible, token-level explainability without relying on hallucinated narrative explanations.

---

### 2. Research Objectives
1. **O1: Orthogonal Dual-Track Classification:** Formulate and train independent prediction heads for Review Deception ($Y_{dec} \in \{\text{genuine}, \text{deceptive}, \text{abstain}\}$) and Text Authorship ($Y_{auth} \in \{\text{human}, \text{ai}, \text{assisted}, \text{abstain}\}$).
2. **O2: Heterogeneous Evidence Fusion:** Design a calibrated evidence fusion layer incorporating text stylometry, metadata heuristics (burstiness, rating deviation), and relational graph signals (reviewer-user-review, reviewer-temporal-review).
3. **O3: Defensible Explainable AI (XAI):** Deploy token-level SHAP, linear attribution, and linguistic feature contributions to illuminate model decisions without black-box hallucination.
4. **O4: Adversarial & Cross-Domain Robustness:** Benchmark model resilience against intentional evasion (synonym substitution, grammar alteration, paraphrasing) and quantify out-of-domain performance collapse.
5. **O5: Uncertainty Calibration & Selective Prediction:** Integrate temperature scaling to output true posterior confidence, enabling selective abstention on borderline or under-evidenced reviews.
6. **O6: Open Academic Reproducibility:** Deliver an end-to-end reproducible research pipeline backed by open benchmarks (Ott et al. OpSpam, YelpChi, AI-generated OpSpam corpora, Amazon CG/OR).

---

### 3. Phased Implementation Roadmap

| Phase | Milestone | Focus Area | Key Output Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Research & Feasibility | Literature review, hypotheses, dataset audit, architecture design | `research_plan.md`, `literature_review.md`, `dataset_strategy.md`, `architecture.md`, `research_hypotheses.md`, `agents.md` |
| **Phase 2** | Workspace & Infrastructure | Backend & frontend setup, environment config, DB schemas, Docker | `backend/app/`, `frontend/`, `docker/`, SQLite/PG migrations, baseline tests |
| **Phase 3** | Dataset Engineering | Download, clean, standardize schema, prevent leakage, stratified splits | `ml/data/`, `ml/preprocessing/`, ingestion pipelines, dataset cards |
| **Phase 4** | Baseline ML Development | TF-IDF, stylometric feature extractors, Logistic Regression, Naive Bayes, Random Forest, GBDT | `ml/features/`, `ml/deception/`, `ml/authorship/`, baseline artifacts & metrics |
| **Phase 5** | Advanced ML & Deep Learning | Transformer heads, behavioral anomaly scoring, GNN/graph feature propagation, fusion layer | `ml/graph/`, `ml/behavioural/`, `ml/fusion/`, calibrated multi-task heads |
| **Phase 6** | Explainability & Robustness | SHAP/LIME attribution, temperature scaling, adversarial transformations, cross-domain test | `ml/explainability/`, `ml/robustness/`, calibrated confidence engines |
| **Phase 7** | Backend API & Inference Engine | FastAPI REST endpoints (`/analyze`, `/models`, `/experiments`, `/graph`), job queue | Versioned API routes, inference services, async background tasks |
| **Phase 8** | Research Dashboard & Frontend | 15 specialized research views, charts, SHAP heatmaps, graph visualizer | Interactive React + Vite frontend with live backend integration |
| **Phase 9** | QA, Security & Research Audit | Full test suite, leakage audits, security checks, bias and limitation checks | Test reports, audit log, performance benchmarks |
| **Phase 10** | Final Delivery & Documentation | Complete system verification, research paper summary, user guide | Working software, model weights, reproducible run scripts, final report |

---

### 4. Computational Feasibility & Resource Allocation
- **Compute Constraints:** Windows 64-bit host, Python 3.12, CPU execution (PyTorch CPU, no CUDA accelerator).
- **Strategy:**
  1. High-efficiency feature engineering (scikit-learn vectorizers, NLTK POS taggers, readability formulas, SciPy sparse matrix representations).
  2. Optimized tree ensembles (Random Forest, HistGradientBoosting) with sub-second inference.
  3. Pre-trained compact Transformer architectures (DistilBERT-base-uncased) utilized with efficient batching or frozen feature extraction, avoiding multi-hour CPU gradient descent bottlenecks.
  4. Memory-mapped sparse graph processing for YelpChi relational matrices ($45,954$ nodes).
  5. Deterministic random seed management (`seed=42`) across NumPy, PyTorch, and Scikit-learn.
