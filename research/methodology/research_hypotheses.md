# VERITAS AI: Formal Research Hypotheses & Verification Metrics

Each hypothesis in VERITAS AI is mathematically framed with pre-specified validation metrics and falsification criteria to ensure rigorous scientific validation.

---

### Hypothesis 1 (H1): Decoupled Dual-Track Specificity
- **Formal Statement:** Decoupling deception detection ($Y_{\text{dec}}$) from authorship detection ($Y_{\text{auth}}$) significantly reduces the false positive rate on benign AI-assisted reviews compared to monolithic fake-detection classifiers.
- **Null Hypothesis ($H_{1,0}$):** A monolithic model assigning $\text{fake}$ to any AI-generated review achieves equal or lower False Positive Rate ($\text{FPR}$) on genuine AI reviews than a decoupled dual-track architecture.
- **Evaluation Metric:** $\text{FPR}_{\text{benign\_AI}} = \frac{\text{FP}}{\text{FP} + \text{TN}}$ evaluated on the paired $AI_{\text{genuine}}$ subset.
- **Falsification Threshold:** Falsified if decoupled architecture does not achieve at least a $30\%$ relative reduction in $\text{FPR}_{\text{benign\_AI}}$ compared to the monolithic baseline.

---

### Hypothesis 2 (H2): Psycholinguistic Term Discrepancy in Human Deception
- **Formal Statement:** Human-authored deceptive reviews exhibit statistically significant elevations in first-person singular pronouns ($p < 0.01$) and a statistically significant deficit in spatial/concrete nouns ($p < 0.01$) compared to truthful human reviews.
- **Null Hypothesis ($H_{2,0}$):** The distribution of first-person pronouns and spatial terms is identical between truthful and deceptive human reviews in the Ott OpSpam corpus.
- **Evaluation Metric:** Two-sample Kolmogorov-Smirnov test and Student's $t$-test statistic between feature vectors of truthful positive vs. deceptive positive subsets.
- **Falsification Threshold:** Falsified if $p$-value $\ge 0.05$ for either pronoun elevation or spatial deficit.

---

### Hypothesis 3 (H3): Syntactic & Readability Uniformity in AI Text
- **Formal Statement:** AI-generated reviews (GPT-3.5, LLaMA) exhibit a significantly narrower variance in readability grade levels (Flesch-Kincaid Grade Level) and higher lexical redundancy compared to human-authored reviews.
- **Null Hypothesis ($H_{3,0}$):** The variance of readability scores $\sigma^2(\text{FKGL}_{\text{AI}}) \ge \sigma^2(\text{FKGL}_{\text{human}})$.
- **Evaluation Metric:** Levene's test for equality of variances across human and AI corpora.
- **Falsification Threshold:** Falsified if $F$-statistic is not significant at $\alpha = 0.01$.

---

### Hypothesis 4 (H4): Relational Graph & Behavioral Fusion Gain
- **Formal Statement:** Combining textual stylometric representations with multi-relational graph neighborhood embeddings ($R-U-R$, $R-T-R$, $R-S-R$) yields superior Precision-Recall AUC ($\text{PR-AUC}$) and Macro $F_1$ on YelpChi compared to isolated text-only classifiers.
- **Null Hypothesis ($H_{4,0}$):** $\text{PR-AUC}_{\text{fusion}} \le \text{PR-AUC}_{\text{text-only}}$.
- **Evaluation Metric:** Area Under the Precision-Recall Curve ($\text{PR-AUC}$) on the held-out YelpChi test set.
- **Falsification Threshold:** Falsified if $\text{PR-AUC}_{\text{fusion}} - \text{PR-AUC}_{\text{text-only}} \le 0.03$.

---

### Hypothesis 5 (H5): Adversarial Paraphrase Decay & Robustness Drop
- **Formal Statement:** Applying controlled paraphrasing transformations to review text degrades text-only deception classifier Macro $F_1$ by $> 15\%$, but integrating behavioral/graph metadata mitigates this degradation by $\ge 50\%$.
- **Null Hypothesis ($H_{5,0}$):** Paraphrasing causes $\le 5\%$ decline in Macro $F_1$, or metadata integration provides no mitigating effect.
- **Evaluation Metric:** Robustness Drop: $\Delta F_1 = F_{1,\text{original}} - F_{1,\text{paraphrased}}$.
- **Falsification Threshold:** Falsified if text models are unaffected by adversarial paraphrasing, or if metadata fusion fails to cushion the performance drop.

---

### Hypothesis 6 (H6): Temperature Scaling & ECE Minimization
- **Formal Statement:** Post-hoc temperature scaling reduces Expected Calibration Error ($\text{ECE}$) below $0.05$ across both deception and authorship heads, preventing overconfident classifications on out-of-distribution reviews.
- **Null Hypothesis ($H_{6,0}$):** Uncalibrated softmax probabilities achieve $\text{ECE} \le 0.05$, or temperature scaling fails to reduce $\text{ECE}$.
- **Evaluation Metric:** 10-bin Expected Calibration Error ($\text{ECE}$) and Brier Score on validation and test partitions.
- **Falsification Threshold:** Falsified if $\text{ECE}_{\text{calibrated}} \ge 0.08$.
