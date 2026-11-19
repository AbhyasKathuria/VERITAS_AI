import { useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Info, Sparkles, Sliders } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DeceptionLabView() {
  const [inputText, setInputText] = useState(
    "I had the most extraordinary and perfect stay of my entire life! My husband and I were treated like absolute royalty by everyone. The hotel is heavenly and truly the best in Chicago. I urge everyone to book immediately!"
  );
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeReview({ review_text: inputText });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ottComparisonData = [
    { feature: '1st-Person Singular ("I", "my")', Truthful: 0.042, Deceptive: 0.088 },
    { feature: 'Spatial Nouns ("room", "window")', Truthful: 0.065, Deceptive: 0.021 },
    { feature: 'Superlatives ("best", "perfect")', Truthful: 0.015, Deceptive: 0.048 },
    { feature: 'Sensory Detail Density', Truthful: 0.052, Deceptive: 0.018 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Deception Detection Laboratory</h1>
        <p className="text-slate-400 text-xs mt-1">
          Branch A: Investigates deceptive opinion spam based on psycholinguistic markers (Ott et al. LIWC paradigm).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Target Review Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            className="w-full bg-navy-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Analyzes spatial deficit, pronoun inflation, and sentiment polarity.
            </span>
            <button
              onClick={handleClassify}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{loading ? "Evaluating Psycholinguistics..." : "Detect Deception"}</span>
            </button>
          </div>
        </div>

        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Psycholinguistic Grounding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ground-truth research (Ott et al. ACL 2011) discovered that human deceivers overcompensate with 1st-person
              pronouns to project personal authenticity, but lack concrete spatial memories of hotel architecture.
            </p>
          </div>
          <div className="p-3 bg-navy-900 border border-slate-700 rounded-lg text-xs mt-4">
            <div className="text-emerald-400 font-semibold mb-1">Champion Architecture</div>
            <div className="text-slate-300">Gradient Boosting over TF-IDF &amp; Stylometry</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Test Accuracy: 83.2% | ROC-AUC: 90.3% | PR-AUC: 97.4%</div>
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Deception Prediction</div>
            <div className={`text-2xl font-bold uppercase ${
              result.deception.label === 'deceptive' ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {result.deception.label}
            </div>
            <div className="text-xs text-slate-300">
              Calibrated Probability: <strong>{(result.deception.calibrated_probability * 100).toFixed(1)}%</strong>
            </div>
            <div className="w-full bg-navy-900 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-2.5 rounded-full ${
                  result.deception.calibrated_probability > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${result.deception.calibrated_probability * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-700/60">
              Selective Abstention: {result.deception.is_abstained ? 'Triggered (Low Confidence)' : 'Passed'}
            </div>
          </div>

          <div className="md:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Psycholinguistic Benchmark Baselines (Ott et al.)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ottComparisonData}>
                  <XAxis dataKey="feature" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="Truthful" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Deceptive" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
