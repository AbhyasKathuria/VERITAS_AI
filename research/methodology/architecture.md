# VERITAS AI: System Architecture & Theoretical Framework

```
+---------------------------------------------------------------------------------------------------------+
|                                           RAW REVIEW INPUT                                              |
|                               (Text + Optional Metadata + Reviewer History)                             |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                    STAGE 1: PREPROCESSING & SANITIZATION                                |
|          - Language verification (English)           - Unicode normalization (NFC)                      |
|          - Duplicate detection (SHA-256 / SimHash)   - Metadata schema validation                       |
+---------------------------------------------------------------------------------------------------------+
                         |                                                       |
                         v                                                       v
+-----------------------------------------------+       +-----------------------------------------------+
|     STAGE 2A: LINGUISTIC & STYLOMETRIC NLP    |       |      STAGE 2B: BEHAVIORAL & GRAPH ANALYSIS    |
| - TF-IDF n-grams (1-3 word, 3-5 char)         |       | - Reviewer velocity & burst detection         |
| - First/second/third person pronoun density   |       | - Rating deviation & entropy                  |
| - Readability (Flesch-Kincaid, ARI, Coleman)  |       | - Multi-relational graph propagation          |
| - Perplexity & lexical diversity (TTR, MTLD)  |       |   (R-U-R User, R-T-R Temporal, R-S-R Rating)  |
| - POS distribution & affective sentiment      |       | - GraphSAGE / Neighborhood aggregator         |
+-----------------------------------------------+       +-----------------------------------------------+
                         |                                                       |
         +---------------+---------------+                                       |
         |                               |                                       |
         v                               v                                       v
+------------------+           +--------------------+                  +--------------------+
|    BRANCH A:     |           |     BRANCH B:      |                  |     BRANCH C:      |
|    DECEPTION     |           |     AUTHORSHIP     |                  |     BEHAVIORAL     |
|    DETECTION     |           |     DETECTION      |                  |     & GRAPH        |
| - Calibrated LR  |           | - Stylometric GBDT |                  | - SpEagle / GNN    |
| - Random Forest  |           | - DistilBERT head  |                  |   relational embed |
| - DistilBERT head|           |                    |                  |                    |
+------------------+           +--------------------+                  +--------------------+
         |                               |                                       |
         | P(Deceptive | X)              | P(AI | X)                             | P(Anomalous | G)
         +-------------------------------+---------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------------------------------+
|                                  STAGE 3: CALIBRATED EVIDENCE FUSION                                    |
| - Temperature Scaling: z_i / T for ECE minimization                                                     |
| - Multi-modal meta-learner (Logistic / MLP fusion without hardcoded weights)                             |
| - Orthogonal output generation (Deception != Authorship)                                                |
| - Selective classification & abstention threshold (tau = 0.60 -> "Insufficient Evidence")              |
+---------------------------------------------------------------------------------------------------------+
                         |                                                       |
                         v                                                       v
+-----------------------------------------------+       +-----------------------------------------------+
|             STAGE 4: EXPLAINABLE AI           |       |              STAGE 5: INFERENCE API           |
| - SHAP exact feature contributions            |       | - Versioned REST endpoints (/api/v1/analyze)  |
| - Token-level highlight attribution           |       | - Async background worker execution           |
| - Positive vs. Negative evidence breakdown    |       | - SQLAlchemy ORM persistence (SQLite/Postgres)|
| - Contrastive counterfactual indicators       |       | - Research Audit Logging                      |
+-----------------------------------------------+       +-----------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------------------------------+
|                                STAGE 6: VERITAS RESEARCH USER INTERFACE                                 |
| - Executive Dashboard                         - Single & Bulk Review Analyzers                          |
| - Dual-track Deception / Authorship Panels    - Interactive Force-Directed Review Evidence Graph        |
| - SHAP Attribution Heatmaps                   - Adversarial Robustness Lab (Perturbation Stress-Test)   |
| - Model Comparison & Research Reports         - Dataset Manager & Experiment Tracker                    |
+---------------------------------------------------------------------------------------------------------+
```

---

## 1. Feature Engineering Foundations

VERITAS AI extracts a multi-faceted $D$-dimensional feature vector $X_{\text{ling}}$ from each input text:
1. **Pronominal Distributions:**
   - 1st-person singular (*I, me, my*) vs. 1st-person plural (*we, our*) vs. 2nd-person (*you, your*) vs. 3rd-person (*he, she, they*).
   - *Theoretical rationale (Ott et al.):* Deceivers over-index on 1st-person singular to simulate genuine personal experience.
2. **Spatial and Concrete Lexicon Density:**
   - Prepositional density, concrete sensory verbs, and architectural/spatial nouns.
   - *Theoretical rationale:* Fabricators lack visceral spatial memory of physical locations.
3. **Information Density & Diversity:**
   - Type-Token Ratio (TTR), Mean Length of Sentence (MLS), Hapax Legomena frequency.
   - Character count, word count, punctuation ratios (exclamation rate, ellipsis rate).
4. **Readability Metrics:**
   - Flesch Reading Ease, Flesch-Kincaid Grade Level, Automated Readability Index (ARI).
   - *Theoretical rationale:* LLM generated reviews exhibit consistently uniform readability within grade levels 9-11, whereas human reviews exhibit high variance.
5. **Sentiment & Affective Polarity:**
   - Positive/negative lexicon ratios, extreme adjective frequency.

---

## 2. Independent Dual-Track Classification Formulations

Let review $i$ be represented by text $T_i$, metadata $M_i$, and graph neighborhood $\mathcal{N}_i$.

### Branch A: Deception Classification ($Y_{\text{dec}}$)
Predicts the probability that the review expresses a fraudulent or non-genuine experience:
$$P(Y_{\text{dec}} = \text{deceptive} \mid T_i, M_i, \mathcal{N}_i) = \sigma(W_{\text{dec}} \cdot \Phi(T_i, M_i, \mathcal{N}_i) + b_{\text{dec}})$$
Classes:
- `genuine`: Verified authentic consumer experience.
- `deceptive`: Fabricated or manipulated sentiment/experience.
- `insufficient_evidence`: Gated when prediction entropy is high or confidence falls below the abstention threshold $\tau_{\text{abstain}}$.

### Branch B: Authorship Classification ($Y_{\text{auth}}$)
Predicts the origin and mechanical author of the text string:
$$P(Y_{\text{auth}} = k \mid T_i) = \text{softmax}(W_{\text{auth}} \cdot \Psi(T_i) + b_{\text{auth}})_k$$
Classes:
- `human`: Natural human prose without generative machine intervention.
- `ai_generated`: Synthesized primarily by an autoregressive LLM.
- `ai_assisted`: Human-authored draft edited or augmented via AI tools.
- `insufficient_evidence`: Ambiguous stylistic footprint.

---

## 3. Reviewer Behavioral & Graph Relational Engine

When metadata is available, VERITAS AI models reviewer and product interaction patterns:
1. **Temporal Burstiness ($B_{\text{temp}}$):**
   $$B_{\text{temp}}(p, t, \Delta t) = \frac{|\{r \in R_p \mid t - \Delta t \le t_r \le t\}|}{\overline{R}_p}$$
   Detects sudden, uncharacteristic surges in review volume on a target business.
2. **Rating Divergence ($D_{\text{rating}}$):**
   $$D_{\text{rating}}(r) = |y_r - \text{median}(Y_{p(r)})|$$
   Measures deviation from consensus product quality.
3. **Graph Neural Propagation (CARE-GNN / GraphSAGE):**
   Over the heterogeneous graph $\mathcal{G} = (\mathcal{V}, \mathcal{E}_{RUR}, \mathcal{E}_{RTR}, \mathcal{E}_{RSR})$:
   $$h_v^{(l+1)} = \text{ReLU}\left(W \cdot \left[ h_v^{(l)} \,\|\, \sum_{r \in \mathcal{R}} \text{AGGREGATE}_r(\{h_u^{(l)} \mid u \in \mathcal{N}_r(v)\}) \right]\right)$$

---

## 4. Temperature Scaling & Selective Classification

To prevent overconfidence, uncalibrated logit vector $z$ is scaled via learned parameter $T^* > 0$:
$$\hat{p}_k = \frac{\exp(z_k / T^*)}{\sum_j \exp(z_j / T^*)}$$
Where $T^*$ is optimized on the validation set by minimizing negative log-likelihood:
$$T^* = \arg\min_T - \sum_{i=1}^{N_{\text{val}}} \log \sigma(z_i / T)_{y_i}$$

Selective classification decision rule:
$$\hat{Y}_{\text{final}} = \begin{cases} \arg\max_k \hat{p}_k & \text{if } \max_k \hat{p}_k \ge \tau_{\text{abstain}} \\ \text{"insufficient\_evidence"} & \text{otherwise} \end{cases}$$
Default abstention threshold: $\tau_{\text{abstain}} = 0.60$.
