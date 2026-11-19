import { useState } from 'react';
import { api } from '../services/api';
import { RobustnessEvalResult } from '../types';
import { ShieldCheck, Sliders, Activity, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

export default function RobustnessLabView() {
  const [transformType, setTransformType] = useState('synonym');
  const [intensity, setIntensity] = useState<number>(0.25);
  const [sampleCount, setSampleCount] = useState<number>(30);
  const [evalResult, setEvalResult] = useState<RobustnessEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunRobustness = async () => {
    setLoading(true);
    try {
      const res = await api.evaluateRobustness({
        transformation_type: transformType,
        perturbation_intensity: intensity,
        test_samples_count: sampleCount
      });
      setEvalResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Adversarial Robustness &amp; Generalization Lab</h1>
        <p className="text-slate-400 text-xs mt-1">
          Innovation 5: Stress-test trained models against controlled perturbations (synonym replacement, paraphrasing, typos, and style evasion).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-white">Perturbation Parameters</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Adversarial Transformation</label>
            <select
              value={transformType}
              onChange={(e) => setTransformType(e.target.value)}
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="synonym">Synonym Substitution (WordNet / Contextual)</option>
              <option value="spelling">Character Swaps &amp; Spelling Typos</option>
              <option value="paraphrase">Sentence Restructuring / Paraphrasing</option>
              <option value="style">Stylistic Evasion (Punctuation / Pronoun Lowering)</option>
            </select>
          </div>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Perturbation Intensity</span>
              <span className="font-mono text-white">{(intensity * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min={0.05}
              max={0.50}
              step={0.05}
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Evaluation Sample Size</span>
              <span className="font-mono text-white">{sampleCount} reviews</span>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={10}
              value={sampleCount}
              onChange={(e) => setSampleCount(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <button
            onClick={handleRunRobustness}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/30"
          >
            {loading ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Simulating Adversarial Attack...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute Robustness Stress Test</span>
              </>
            )}
          </button>
        </div>

        {/* Results Overview */}
        <div className="lg:col-span-2 space-y-4">
          {evalResult ? (
            <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h3 className="text-sm font-semibold text-white">Stress-Test Empirical Outcomes</h3>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-blue-500/20 text-blue-400">
                  {evalResult.transformation_type} @ {(evalResult.perturbation_intensity * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Baseline Macro F1</div>
                  <div className="text-base font-bold text-white mt-1">{(evalResult.baseline_macro_f1 * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Perturbed Macro F1</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">{(evalResult.perturbed_macro_f1 * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Performance Drop (ΔF1)</div>
                  <div className={`text-base font-bold mt-1 ${evalResult.performance_drop > 0.05 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(evalResult.performance_drop * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Model Resilience</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">{evalResult.resilience_percentage}%</div>
                </div>
              </div>

              {/* Side-by-Side Comparisons */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Side-by-Side Adversarial Samples</h4>
                <div className="space-y-2.5">
                  {evalResult.sample_comparisons?.map((s, idx) => (
                    <div key={idx} className="p-3 bg-navy-900 border border-slate-700/60 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-mono text-[11px]">Sample #{idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.original_prediction === 'deceptive' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            Original: {s.original_prediction} ({(s.original_confidence * 100).toFixed(0)}%)
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.perturbed_prediction === 'deceptive' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            Perturbed: {s.perturbed_prediction} ({(s.perturbed_confidence * 100).toFixed(0)}%)
                          </span>
                          {s.prediction_flipped && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white uppercase">
                              FLIPPED
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-slate-300">
                        <div className="p-2 bg-navy-950/60 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block mb-0.5">Original Text:</span>
                          <p>{s.original_text}</p>
                        </div>
                        <div className="p-2 bg-navy-950/60 rounded border border-slate-800">
                          <span className="text-[10px] text-cyan-500 block mb-0.5">Perturbed Text:</span>
                          <p>{s.perturbed_text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-navy-800/60 border border-slate-700/60 rounded-xl p-12 text-center text-slate-400 text-xs">
              Configure perturbation parameters on the left and click "Execute Robustness Stress Test" to measure model degradation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
