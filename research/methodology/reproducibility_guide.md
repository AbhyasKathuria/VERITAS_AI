# VERITAS AI: Academic Reproducibility Protocol

To reproduce all experimental results, model weights, and benchmark evaluation scores reported in the VERITAS AI Research Platform, follow the deterministic execution instructions below:

---

### 1. Environment & Deterministic Seeds
All randomized procedures (train-test splitting, cross-validation folds, feature sampling, classifier bootstrapping) fix random seeds to `42`:
- NumPy: `np.random.seed(42)`
- Scikit-learn: `random_state=42`
- PyTorch: `torch.manual_seed(42)`

---

### 2. Step-by-Step Reproduction Sequence

#### Step A: Raw Dataset Download & Harmonization
Executes automatic download, verification, cleaning, and schema mapping:
```powershell
python -m ml.preprocessing.ingest
```
- Ingests Myle Ott OpSpam (1,600 reviews from `https://myleott.com/op_spam_v1.4.zip`).
- Ingests Buscaldi et al. AI OpSpam (2,390 reviews from `dbuscaldi/op_spam_AI`).
- Ingests Salminen et al. Amazon CG/OR (3,000 product reviews from HuggingFace).
- Downloads YelpChi graph benchmark (45,954 nodes from CARE-GNN repository).
- Outputs master file: `ml/data/processed/veritas_master_reviews.csv` (6,985 deduplicated samples).

#### Step B: Leakage-Free Group Partitioning & DB Synchronization
```powershell
python -m ml.preprocessing.split
python -m ml.preprocessing.validate
```
- Executes `GroupShuffleSplit` across `product_id` ensuring zero cross-entity leakage.
- Validates that text overlap is strictly $0$ between Train, Val, and Test.
- Synchronizes sample reviews into the SQLite database (`veritas_ai.db`).

#### Step C: Train Champion Branch A (Deception Detection)
```powershell
python -m ml.deception.train_baselines
```
- Compares Logistic Regression, Random Forest, and HistGradientBoosting.
- Selects champion model based on validation Macro F1.
- Evaluates champion on locked held-out test set:
  - **Test Accuracy:** $83.17\%$
  - **Macro F1:** $0.7650$
  - **ROC-AUC:** $0.9025$
  - **PR-AUC:** $0.9743$
  - **Expected Calibration Error (ECE):** $0.1026$
- Serializes artifact: `ml/artifacts/deception/deception_gradient_boosting.joblib`.

#### Step D: Train Champion Branch B (Authorship Detection)
```powershell
python -m ml.authorship.train_baselines
```
- Evaluates multi-class origin: Human vs AI-Generated vs AI-Assisted.
- Selects champion model based on validation Macro F1.
- Evaluates champion on locked held-out test set:
  - **Test Accuracy:** $83.04\%$
  - **Macro F1:** $0.8219$
  - **Multi-class ROC-AUC:** $0.9637$
  - **Expected Calibration Error (ECE):** $0.0468$
- Serializes artifact: `ml/artifacts/authorship/authorship_gradient_boosting.joblib`.

#### Step E: Execute Automated Test Suite
```powershell
python -m pytest backend/tests/
```
- Executes 16 automated tests across unit models, API endpoints, and database schemas.
- Expected outcome: `16 passed`.

#### Step F: Launch Backend API and Frontend Dashboard
```powershell
# In terminal 1 (Backend):
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

# In terminal 2 (Frontend):
cd frontend
npm run dev
```
Open browser to `http://localhost:5173` to explore all 15 operational modules.
