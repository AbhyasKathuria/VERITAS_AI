import { useState } from 'react';
import { api } from '../services/api';
import { Info, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ExplainabilityLabView() {
  const [reviewText, setReviewText] = useState(
    "I loved my stay at the Chicago hotel. The bedroom was spacious and the bathroom had clean marble sinks. We stayed on the 10th floor and enjoyed the view."
  );
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeReview({ review_text: reviewText, explanation_method: "shap" });
      setExplanation(res.explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const featureBarData = explanation ? [
    ...explanation.top_positive_features.map((f: any) => ({ name: f.feature, weight: f.weight, type: 'Deceptive Signal' })),
    ...explanation.top_negative_features.map((f: any) => ({ name: f.feature, weight: -f.weight, type: 'Authentic Grounding' }))
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Explainable AI (XAI) Attribution Lab</h1>
        <p className="text-slate-400 text-xs mt-1">
          Innovation 2: Inspect additive Shapley value feature contributions, psycholinguistic profiles, and positive/negative evidence breakdowns.
        </p>
      </div>

      <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Review Text for Saliency Attribution
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={3}
          className="w-full bg-navy-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Computes mathematical Shapley contributions across TF-IDF n-grams and dense psycholinguistic features.
          </span>
          <button
            onClick={handleExplain}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            {loading ? "Computing Shapley Values..." : "Compute SHAP Attribution"}
          </button>
        </div>
      </div>

      {explanation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Feature Weight Bars */}
          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-white">Top Positive vs. Negative Feature Attributions</h3>
            <p className="text-xs text-slate-400">Positive weights push classification toward Deceptive; negative weights toward Genuine.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureBarData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="weight" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Linguistic Metrics Table */}
          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-white">Psycholinguistic Profile Breakdown</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">1st-Person Singulars</div>
                <div className="text-lg font-bold text-purple-400 mt-1">{explanation.linguistic_summary.first_person_pronouns}</div>
              </div>
              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">Spatial Architecture Terms</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">{explanation.linguistic_summary.spatial_concrete_terms}</div>
              </div>
              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">Superlatives Frequency</div>
                <div className="text-lg font-bold text-rose-400 mt-1">{explanation.linguistic_summary.superlatives_count}</div>
              </div>
              <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                <div className="text-slate-400">Flesch-Kincaid Grade</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{explanation.linguistic_summary.flesch_kincaid_grade}</div>
              </div>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-slate-300">
              <strong>Defensible XAI Guarantee:</strong> VERITAS AI strictly rejects hallucinated narrative rationales generated by disconnected LLMs. All token highlights are mathematically derived from exact pipeline weights.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
