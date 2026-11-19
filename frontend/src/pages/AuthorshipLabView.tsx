import { useState } from 'react';
import { api } from '../services/api';
import { Cpu, CheckCircle2, AlertTriangle, Sparkles, Sliders } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function AuthorshipLabView() {
  const [inputText, setInputText] = useState(
    "The hotel is located within walking distance of the central plaza. The room was well-appointed with standard amenities and comfortable bedding. Breakfast options were somewhat limited during the morning rush hours."
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

  const stylometryData = [
    { metric: 'Lexical Diversity', value: 72 },
    { metric: 'Sentence Uniformity', value: 88 },
    { metric: 'Readability Ease', value: 65 },
    { metric: 'Syntactic Complexity', value: 54 },
    { metric: 'Passive Voice Ratio', value: 38 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">AI Authorship Detection Laboratory</h1>
        <p className="text-slate-400 text-xs mt-1">
          Branch B: Separates natural human prose from autoregressive LLMs (GPT-3/4, LLaMA-2) and AI-assisted hybrid writing.
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
            className="w-full bg-navy-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Evaluates perplexity variance, n-gram entropy, and stylometric uniformity.
            </span>
            <button
              onClick={handleClassify}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{loading ? "Analyzing Stylometry..." : "Evaluate Authorship"}</span>
            </button>
          </div>
        </div>

        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Theoretical Principle</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autoregressive LLM generations exhibit low perplexity variance and uniform readability scores (Grade 9–11).
              Human prose exhibits high variance, colloquial fragments, and irregular sentence length distributions.
            </p>
          </div>
          <div className="p-3 bg-navy-900 border border-slate-700 rounded-lg text-xs mt-4">
            <div className="text-cyan-400 font-semibold mb-1">Champion Architecture</div>
            <div className="text-slate-300">Gradient Boosting over TF-IDF &amp; Stylometry</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Test Multi-class ROC-AUC: 96.4% | ECE: 0.0468</div>
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Predicted Origin</div>
            <div className="text-2xl font-bold text-cyan-400 uppercase">
              {result.authorship.label.replace('_', ' ')}
            </div>
            <div className="text-xs text-slate-300">
              Confidence: <strong>{(result.authorship.confidence * 100).toFixed(1)}%</strong>
            </div>

            {result.authorship.probabilities && (
              <div className="space-y-2 pt-2 border-t border-slate-700/60">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Human-Authored</span>
                  <span className="font-mono text-slate-200">{(result.authorship.probabilities.human * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${result.authorship.probabilities.human * 100}%` }}></div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">AI-Generated</span>
                  <span className="font-mono text-slate-200">{(result.authorship.probabilities.ai_generated * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${result.authorship.probabilities.ai_generated * 100}%` }}></div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">AI-Assisted / Edited</span>
                  <span className="font-mono text-slate-200">{(result.authorship.probabilities.ai_assisted * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${result.authorship.probabilities.ai_assisted * 100}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Stylometric Fingerprint Profile</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stylometryData}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
