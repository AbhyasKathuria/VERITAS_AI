import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ExperimentItem } from '../types';
import { FlaskConical, CheckCircle2, ChevronRight, Award, Activity } from 'lucide-react';

export default function ExperimentManagerView() {
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [selectedExp, setSelectedExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExperiments().then((data) => {
      setExperiments(data);
      if (data.length > 0) {
        loadDetail(data[0].id);
      }
    }).finally(() => setLoading(false));
  }, []);

  const loadDetail = async (id: string) => {
    try {
      const d = await api.getExperimentDetail(id);
      setSelectedExp(d);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <Activity className="w-5 h-5 animate-spin mr-2 text-blue-500" />
        Loading research experiment suite...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Academic Experiment Manager</h1>
        <p className="text-slate-400 text-xs mt-1">
          Tracking the 12 formal research experiments mandated in Section 7 with real registered benchmarks, F1/AUC scores, and calibration metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Experiments List */}
        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              onClick={() => loadDetail(exp.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                selectedExp?.id === exp.id
                  ? 'bg-navy-800 border-blue-500 shadow-md ring-1 ring-blue-500'
                  : 'bg-navy-800/60 border-slate-700/60 hover:bg-navy-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate max-w-[200px]">{exp.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">
                  {exp.hypothesis}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Macro F1: <strong className="text-emerald-400">{(exp.macro_f1 * 100).toFixed(1)}%</strong></span>
                <span>ROC-AUC: <strong className="text-cyan-400">{(exp.roc_auc * 100).toFixed(1)}%</strong></span>
                <span>ECE: <strong className="text-purple-400">{exp.ece.toFixed(4)}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Experiment Detail */}
        <div className="lg:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-5">
          {selectedExp ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div>
                  <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider">{selectedExp.hypothesis} Hypothesis Target</div>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedExp.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {selectedExp.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Test Macro F1</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{(selectedExp.macro_f1 * 100).toFixed(2)}%</div>
                </div>
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Test ROC-AUC</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">{(selectedExp.roc_auc * 100).toFixed(2)}%</div>
                </div>
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Calibration Error (ECE)</div>
                  <div className="text-lg font-bold text-purple-400 mt-1">{selectedExp.ece.toFixed(4)}</div>
                </div>
              </div>

              {selectedExp.detailed_results?.validation_results && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Candidate Model Validation Benchmark</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-navy-900 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-2">Model Architecture</th>
                          <th className="p-2">Val Accuracy</th>
                          <th className="p-2">Macro F1</th>
                          <th className="p-2">ROC-AUC</th>
                          <th className="p-2">ECE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {Object.entries(selectedExp.detailed_results.validation_results).map(([mName, mVal]: any) => (
                          <tr key={mName} className="hover:bg-slate-800/40 font-mono">
                            <td className="p-2 font-sans font-semibold text-white">{mName}</td>
                            <td className="p-2">{(mVal.accuracy * 100).toFixed(1)}%</td>
                            <td className="p-2 text-emerald-400">{(mVal.macro_f1 * 100).toFixed(1)}%</td>
                            <td className="p-2 text-cyan-400">{(mVal.roc_auc * 100).toFixed(1)}%</td>
                            <td className="p-2 text-purple-400">{mVal.ece.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="p-3 bg-navy-900/80 border border-slate-700/60 rounded-lg text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200">Reproducibility Metadata:</div>
                <div>Random Seed: <code>42</code> | Partition Split: <code>Train (80%) / Val (8.6%) / Locked Test (11.4%)</code></div>
                <div>Evaluation Protocol: <code>GroupShuffleSplit (zero entity overlap)</code></div>
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-xs text-center py-12">Select an experiment to view telemetry.</div>
          )}
        </div>
      </div>
    </div>
  );
}
