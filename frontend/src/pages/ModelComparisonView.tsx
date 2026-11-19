import { useState } from 'react';
import { Award, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ModelComparisonView() {
  const comparisonData = [
    { architecture: 'Logistic Regression', MacroF1: 71.8, ROCAUC: 83.0, ECE: 12.5 },
    { architecture: 'Random Forest', MacroF1: 70.3, ROCAUC: 82.8, ECE: 14.0 },
    { architecture: 'Gradient Boosting (Veritas)', MacroF1: 76.5, ROCAUC: 90.3, ECE: 4.6 },
    { architecture: 'Relational Graph (YelpChi)', MacroF1: 83.4, ROCAUC: 94.8, ECE: 3.8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Model Benchmark &amp; Ablation Comparison</h1>
        <p className="text-slate-400 text-xs mt-1">
          Comparative empirical performance of baseline and proposed models on locked, held-out test benchmarks.
        </p>
      </div>

      <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-semibold text-white">Macro F1 &amp; ROC-AUC Across Architectures</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <XAxis dataKey="architecture" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Bar dataKey="MacroF1" fill="#3b82f6" name="Macro F1 (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ROCAUC" fill="#06b6d4" name="ROC-AUC (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-700/60 font-semibold text-sm text-white">
          Comprehensive Evaluation Matrix
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-navy-900 text-slate-400 uppercase text-[11px]">
            <tr>
              <th className="p-3">Model Architecture</th>
              <th className="p-3">Feature Space</th>
              <th className="p-3">Macro F1</th>
              <th className="p-3">ROC-AUC</th>
              <th className="p-3">ECE (Calibration Error)</th>
              <th className="p-3">Inference Speed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40 font-mono">
            <tr className="hover:bg-slate-800/40">
              <td className="p-3 font-sans font-semibold text-white">Logistic Regression</td>
              <td className="p-3 font-sans">TF-IDF + Stylometry</td>
              <td className="p-3">71.8%</td>
              <td className="p-3">83.0%</td>
              <td className="p-3 text-rose-400">0.1254</td>
              <td className="p-3 text-emerald-400">&lt; 5ms</td>
            </tr>
            <tr className="hover:bg-slate-800/40">
              <td className="p-3 font-sans font-semibold text-white">Random Forest (100 trees)</td>
              <td className="p-3 font-sans">TF-IDF + Stylometry</td>
              <td className="p-3">70.3%</td>
              <td className="p-3">82.8%</td>
              <td className="p-3 text-rose-400">0.1402</td>
              <td className="p-3">18ms</td>
            </tr>
            <tr className="hover:bg-slate-800/40 bg-blue-950/20 font-bold">
              <td className="p-3 font-sans font-bold text-emerald-400 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Gradient Boosting (Champion)</span>
              </td>
              <td className="p-3 font-sans">TF-IDF + 19 Stylometrics</td>
              <td className="p-3 text-emerald-400">76.5%</td>
              <td className="p-3 text-cyan-400">90.3%</td>
              <td className="p-3 text-emerald-400">0.0468</td>
              <td className="p-3">12ms</td>
            </tr>
            <tr className="hover:bg-slate-800/40">
              <td className="p-3 font-sans font-semibold text-white">CARE-GNN Relational</td>
              <td className="p-3 font-sans">Multi-relational Graph</td>
              <td className="p-3 text-emerald-400">83.4%</td>
              <td className="p-3 text-cyan-400">94.8%</td>
              <td className="p-3 text-emerald-400">0.0380</td>
              <td className="p-3">45ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
