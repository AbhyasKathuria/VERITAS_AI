# VERITAS AI: Dataset Strategy, Provenance & Schema Specification

## 1. Unified Schema Specification

To ensure total scientific integrity, every review sample across all ingested datasets is mapped to a strict, standardized 15-field schema. If a specific metadata field is not provided by the originating corpus (for instance, Ott et al. OpSpam does not include timestamps or reviewer IDs), the field is strictly recorded as `null`. **Fabricating metadata is prohibited under the VERITAS AI Research Directives.**

| Field Name | Type | Description | Permitted Values / Constraints |
| :--- | :--- | :--- | :--- |
| `review_id` | String | Unique deterministic identifier | UUID or standardized string (*e.g., `ott_d_pos_001`*) |
| `review_text` | String | Raw, un-truncated review content | Non-empty UTF-8 string |
| `deception_label` | String | Primary deception status | `genuine`, `deceptive`, `unknown` |
| `authorship_label` | String | Text origin / authorship status | `human`, `ai_generated`, `ai_assisted`, `unknown` |
| `source_dataset` | String | Benchmark corpus origin | `ott_opspam`, `opspam_ai`, `amazon_cgor`, `yelp_chi` |
| `generator_model` | String / Null | Generative LLM architecture if AI | `gpt-3.5`, `llama-2`, `salminen_gpt2`, `null` |
| `product_category` | String | Commercial domain of the reviewed entity | `hotels`, `restaurants`, `electronics`, `home_kitchen`, etc. |
| `rating` | Float / Null | Numerical rating awarded | $1.0$ to $5.0$, or `null` if unavailable |
| `reviewer_id` | String / Null | Unique author account ID | Originating string ID or `null` |
| `product_id` | String / Null | Unique business or item ID | Hotel name, ASIN, Yelp business ID, or `null` |
| `timestamp` | String / Null | Date and time of review publication | ISO 8601 string or `null` |
| `prompt_id` | String / Null | Generation prompt identifier | Hash of generation prompt or `null` |
| `edit_type` | String / Null | Post-generation editing applied | `none`, `paraphrased`, `adversarial_synonym`, `null` |
| `provenance` | String | Academic origin & citation handle | Formal academic citation key (*e.g., `ott2011finding`*) |
| `split_group` | String | Leakage-prevention partition key | Hotel name, reviewer ID, or domain cluster |

---

## 2. Ingested Benchmark Datasets

### 2.1 Ott et al. Deceptive Opinion Spam Corpus (v1.4)
- **Source:** Cornell NLP Group / Myle Ott (`https://myleott.com/op_spam_v1.4.zip`).
- **Citation:** Ott, M., Choi, Y., Cardie, C., & Hancock, J. T. (2011). *Finding Deceptive Opinion Spam by Any Stretch of the Imagination*. ACL 2011.
- **Sample Count:** 1,600 reviews across 20 Chicago hotels.
  - 400 truthful positive (TripAdvisor, verified 5-star).
  - 400 deceptive positive (Mechanical Turk simulated positive 5-star).
  - 400 truthful negative (Expedia/TripAdvisor/Yelp, verified 1-2 star).
  - 400 deceptive negative (Mechanical Turk simulated negative 1-2 star).
- **Labels:** `deception_label`: `genuine` / `deceptive`. `authorship_label`: strictly `human`.
- **License & Use:** Academic open research license.

### 2.2 op_spam_AI Corpus (Buscaldi et al. 2023)
- **Source:** University of Paris Nanterre / GitHub (`dbuscaldi/op_spam_AI`).
- **Citation:** Buscaldi, D. et al. (2023). *Detecting AI-generated text in opinion spam*.
- **Sample Count:** 1,600 generated reviews + paraphrased sets.
  - 400 GPT-3 positive hotel reviews (seeded from Ott Chicago hotel prompts).
  - 400 GPT-3 negative hotel reviews.
  - 400 LLaMA positive hotel reviews.
  - 400 LLaMA negative hotel reviews.
  - Adversarially paraphrased subsets for robustness testing.
- **Labels:** `authorship_label`: `ai_generated`. `generator_model`: `gpt-3` / `llama`.
- **Deception Pairing:** Provides directly aligned comparisons against Ott human reviews on the exact same 20 hotels.

### 2.3 Amazon Computer-Generated vs. Original Reviews (Salminen et al. 2022)
- **Source:** Salminen et al. / Hugging Face (`debojit01/fake-review-dataset`).
- **Citation:** Salminen, J. et al. (2022). *Creating and detecting fake reviews on e-commerce platforms*. Journal of Retailing and Consumer Services.
- **Sample Count:** 40,432 product reviews (20,216 original human OR reviews, 20,216 computer-generated CG reviews).
- **Metadata:** Product categories (`Home_and_Kitchen_5`, `Sports_and_Outdoors_5`, `Clothing_Shoes_and_Jewelry_5`), ratings ($1.0 - 5.0$).
- **Role:** High-volume evaluation for cross-domain product generalization.

### 2.4 YelpChi Graph Anomaly Corpus (Rayana & Akoglu 2015 / Dou et al. 2020)
- **Source:** Stony Brook ODDS / CARE-GNN benchmark (`YelpChi.mat`).
- **Citation:** Rayana, S., & Akoglu, L. (2015). *Collective Opinion Spam Detection: Bridging Review, Reviewer and Product Factors*. ACM KDD 2015.
- **Graph Structure:**
  - $45,954$ review nodes.
  - $32$ engineered behavioral/textual features.
  - 3 relational graphs:
    - $R-U-R$ ($49,315$ edges: reviews written by the same user).
    - $R-T-R$ ($573,616$ edges: reviews posted in the same 30-day window).
    - $R-S-R$ ($3,402,743$ edges: reviews with identical star ratings for the same product).
    - Homogeneous graph ($3,894,066$ edges).
  - Ground Truth Labels: Yelp recommendation filter binary labels ($0$: recommended/genuine, $1$: filtered/deceptive).
- **Role:** Heterogeneous graph neural network training and reviewer behavioral anomaly modeling.

---

## 3. Data Leakage Prevention & Stratification Protocol

To guarantee valid generalisation estimates and prevent inflated test scores:
1. **Grouped Partitioning:** Partitioning for the hotel domain is grouped strictly by `product_id` (the 20 hotels). Models are evaluated on hotels never seen during training, preventing memorisation of hotel-specific amenities (*e.g., "The Talbott's concierge", "Omni rooftop"*).
2. **Reviewer Grouping:** In metadata-rich datasets (YelpChi), all reviews authored by a single reviewer are assigned exclusively to either Train, Validation, or Test.
3. **Prompt Leakage Prevention:** For AI-generated reviews, prompt templates used to synthesize evaluation sets are strictly excluded from training.
4. **Partition Ratios:**
   - **Training Set:** $70\%$ (used exclusively for model fitting and feature extractor vocabulary construction).
   - **Validation Set:** $15\%$ (used exclusively for hyperparameter tuning, temperature scaling calibration, and early stopping).
   - **Final Test Set:** $15\%$ (locked; evaluated strictly once per model iteration to produce unbiased academic benchmarks).
