import { useState } from 'react';
import { api } from '../services/api';
import { SingleReviewAnalysis } from '../types';
import {
  ShieldAlert, Cpu, Activity, Info, AlertTriangle, CheckCircle2,
  HelpCircle, Sparkles, Sliders, FileText
} from 'lucide-react';

const PRESETS = [
  {
    title: "Genuine Human Review (TripAdvisor)",
    text: "We booked a king suite on the 14th floor of the Omni hotel. The bathroom shower was hot and clean with marble sinks. The street noise from Michigan Avenue was noticeable at night, but the concierge gave us earplugs and arranged a quick late checkout.",
    rating: 4.0,
    category: "hotels"
  },
  {
    title: "Deceptive Human Opinion Spam (Mechanical Turk)",
    text: "I had the most extraordinary and perfect stay of my entire life! My husband and I were treated like absolute royalty by everyone. The hotel is heavenly and truly the best in Chicago. I urge everyone to book immediately!",
    rating: 5.0,
    category: "hotels"
  },
  {
    title: "AI-Generated Genuine Experience (GPT-3.5)",
    text: "The hotel offers convenient proximity to Millennium Park. Our room on the eighth floor was well-appointed with functional temperature controls, although the elevator experienced delays during peak morning hours. Continental breakfast provided standard selection.",
    rating: 4.0,
    category: "hotels"
  },
  {
    title: "AI-Generated Deceptive Spam (GPT-3.5)",
    text: "An unforgettable paradise with flawless amenities and spectacular views that took my breath away. Every single detail exceeded all conceivable expectations. Words cannot describe how miraculous and perfect this venue is.",
    rating: 5.0,
    category: "hotels"
  }
];

export default function SingleAnalyzerView() {
  const [reviewText, setReviewText] = useState(PRESETS[0].text);
  const [rating, setRating] = useState<number>(4.0);
  const [category, setCategory] = useState("hotels");
  const [method, setMethod] = useState("shap");
  const [analysis, setAnalysis] = useState<SingleReviewAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!reviewText.trim() || reviewText.length < 5) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeReview({
        review_text: reviewText,
        rating: rating,
        product_category: category,
        explanation_method: method
      });
      setAnalysis(res);
    } catch (err: any) {
      console.error("Analysis failure:", err);
      setError("Failed to execute review analysis. Please check backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setReviewText(preset.text);
    setRating(preset.rating);
    setCategory(preset.category);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Single Review Forensics Analyzer</h1>
        <p className="text-slate-400 text-xs mt-1">
          Input review text to evaluate independent deception and authorship signals, token-level SHAP attributions, and behavioral alignment.
        </p>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => loadPreset(p)}
            className="px-2.5 py-1 text-xs bg-navy-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Input Card */}
      <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Review Text Content
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Paste consumer review text here..."
            className="w-full bg-navy-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Star Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value={1.0}>1.0 Star (Critical)</option>
              <option value={2.0}>2.0 Stars (Poor)</option>
              <option value={3.0}>3.0 Stars (Average)</option>
              <option value={4.0}>4.0 Stars (Good)</option>
              <option value={5.0}>5.0 Stars (Positive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Domain Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="hotels">Hotels & Hospitality</option>
              <option value="restaurants">Restaurants & Dining</option>
              <option value="electronics">Electronics & Tech</option>
              <option value="home_kitchen">Home & Kitchen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">XAI Attribution Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="shap">SHAP (Additive Saliency)</option>
              <option value="lime">LIME (Local Surrogate)</option>
              <option value="linear">Linear TF-IDF Attribution</option>
            </select>
          </div>

          <div className="pt-5">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Evaluating Forensics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Dual-Track Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Analysis Output Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Dual-Track Verdict Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branch A: Deception Track */}
            <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">Branch A: Deception Status</h3>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  analysis.deception.label === 'deceptive'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : analysis.deception.label === 'genuine'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {analysis.deception.label.replace('_', ' ')}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Calibrated Deception Probability</span>
                  <span className="font-mono text-slate-200">{(analysis.deception.calibrated_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-navy-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      analysis.deception.calibrated_probability > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${analysis.deception.calibrated_probability * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/50">
                <span>Model Confidence: <strong>{(analysis.deception.confidence * 100).toFixed(1)}%</strong></span>
                <span>Selective Abstention: {analysis.deception.is_abstained ? 'Triggered' : 'None'}</span>
              </div>
            </div>

            {/* Branch B: Authorship Track */}
            <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Branch B: Text Authorship</h3>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  analysis.authorship.label === 'human'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : analysis.authorship.label === 'ai_generated'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {analysis.authorship.label.replace('_', ' ')}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Classification Confidence</span>
                  <span className="font-mono text-slate-200">{(analysis.authorship.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-navy-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-cyan-500 transition-all duration-500"
                    style={{ width: `${analysis.authorship.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {analysis.authorship.probabilities && (
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 text-slate-400 border-t border-slate-700/50">
                  <div>Human: {(analysis.authorship.probabilities.human * 100).toFixed(1)}%</div>
                  <div>AI-Gen: {(analysis.authorship.probabilities.ai_generated * 100).toFixed(1)}%</div>
                  <div>AI-Assisted: {(analysis.authorship.probabilities.ai_assisted * 100).toFixed(1)}%</div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Fusion Synthesis */}
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-5 shadow-lg">
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Evidence Fusion & Synthesis</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {analysis.evidence_fusion_summary}
            </p>
          </div>

          {/* Token-Level SHAP Saliency Heatmap */}
          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Token-Level Saliency Heatmap</h3>
                <p className="text-xs text-slate-400">Additive feature attribution indicating word contributions toward deception or authentic grounding</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500"></span>
                  <span>Deceptive Cues</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500"></span>
                  <span>Authentic Grounding</span>
                </span>
              </div>
            </div>

            <div className="p-4 bg-navy-900 border border-slate-700/70 rounded-lg text-sm leading-loose">
              {analysis.explanation.token_attributions?.map((t, idx) => {
                let badgeClass = "text-slate-200";
                if (t.importance === 'positive_deceptive') {
                  badgeClass = "bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.5 rounded";
                } else if (t.importance === 'negative_genuine') {
                  badgeClass = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 py-0.5 rounded";
                }
                return (
                  <span key={idx} className={`mr-1 inline-block ${badgeClass}`} title={`Saliency: ${t.score}`}>
                    {t.token}
                  </span>
                );
              })}
            </div>

            {/* Positive vs Negative Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Top Deceptive Evidentiary Signals</span>
                <div className="space-y-1.5">
                  {analysis.explanation.top_positive_features.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-navy-900/60 rounded border border-rose-500/20 text-xs">
                      <span className="text-slate-200">{f.feature}</span>
                      <span className="font-mono text-rose-400">+{f.weight}</span>
                    </div>
                  ))}
                  {analysis.explanation.top_positive_features.length === 0 && (
                    <div className="text-xs text-slate-500 italic">No significant deceptive signals observed.</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Top Concrete Grounding Signals</span>
                <div className="space-y-1.5">
                  {analysis.explanation.top_negative_features.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-navy-900/60 rounded border border-emerald-500/20 text-xs">
                      <span className="text-slate-200">{f.feature}</span>
                      <span className="font-mono text-emerald-400">-{f.weight}</span>
                    </div>
                  ))}
                  {analysis.explanation.top_negative_features.length === 0 && (
                    <div className="text-xs text-slate-500 italic">No concrete spatial signals observed.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Linguistic Metrics Card */}
          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-3">Linguistic & Readability Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">Word / Sent Count</div>
                <div className="text-base font-bold text-white mt-1">
                  {analysis.explanation.linguistic_summary.word_count} words / {analysis.explanation.linguistic_summary.sentence_count} sents
                </div>
              </div>

              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">Flesch-Kincaid Grade</div>
                <div className="text-base font-bold text-cyan-400 mt-1">
                  Grade {analysis.explanation.linguistic_summary.flesch_kincaid_grade}
                </div>
              </div>

              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">1st-Person Singulars</div>
                <div className="text-base font-bold text-purple-400 mt-1">
                  {analysis.explanation.linguistic_summary.first_person_pronouns} ({analysis.explanation.linguistic_summary.first_person_ratio * 100}%)
                </div>
              </div>

              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">Spatial / Concrete Nouns</div>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  {analysis.explanation.linguistic_summary.spatial_concrete_terms} terms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
