import { useState } from 'react';
import { api } from '../services/api';
import { SingleReviewAnalysis } from '../types';
import { Upload, FileSpreadsheet, Activity, Download, CheckCircle, ShieldAlert } from 'lucide-react';

const SAMPLE_BATCH = [
  { review_text: "The Omni Chicago hotel was magnificent. The bathroom had heated tiles and spacious robes. Room service arrived promptly at 8 PM.", rating: 5.0 },
  { review_text: "Truly the best hotel experience on earth! Everyone must book this instant. Words cannot describe the celestial perfection.", rating: 5.0 },
  { review_text: "Our stay on the tenth floor was satisfactory. The air conditioner was somewhat noisy at night, but breakfast was adequate.", rating: 3.0 },
  { review_text: "The concierge refused to assist with our luggage and the sheets smelled damp. Would strongly discourage booking here.", rating: 1.0 },
  { review_text: "This accommodation exhibits strategic proximity to downtown attractions. Rooms are designed with standard contemporary finishes.", rating: 4.0 }
];

export default function BulkAnalyzerView() {
  const [reviewsInput, setReviewsInput] = useState(JSON.stringify(SAMPLE_BATCH, null, 2));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SingleReviewAnalysis[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const handleRunBatch = async () => {
    try {
      setLoading(true);
      const parsed = JSON.parse(reviewsInput);
      const res = await api.analyzeBatch(parsed);
      setResults(res.results);
      setSummary(res.summary);
    } catch (e) {
      alert("Invalid JSON format. Please provide an array of objects with review_text and optional rating.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!results.length) return;
    const headers = "review_id,review_text,deception_label,deception_prob,authorship_label,authorship_conf\n";
    const rows = results.map(r =>
      `"${r.review_id}","${r.explanation.token_attributions?.map(t => t.token).join(' ').replace(/"/g, '""')}","${r.deception.label}",${r.deception.calibrated_probability},"${r.authorship.label}",${r.authorship.confidence}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veritas_batch_analysis_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Bulk Review Forensics Analyzer</h1>
          <p className="text-slate-400 text-xs mt-1">
            Batch evaluate multiple consumer reviews simultaneously with aggregated deception, authorship, and abstention metrics.
          </p>
        </div>
        {results.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition border border-slate-600"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Batch JSON Input (Array of Review Objects)
          </label>
          <textarea
            value={reviewsInput}
            onChange={(e) => setReviewsInput(e.target.value)}
            rows={6}
            className="w-full bg-navy-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleRunBatch}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg text-sm font-semibold transition flex items-center space-x-2"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Execute Batch Analysis</span>
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase">Processed Reviews</div>
            <div className="text-2xl font-bold text-white mt-1">{summary.total}</div>
          </div>
          <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4">
            <div className="text-xs text-rose-400 uppercase">Deceptive Reviews</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{summary.deceptive_count} ({summary.deceptive_percentage}%)</div>
          </div>
          <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4">
            <div className="text-xs text-cyan-400 uppercase">AI-Authored Reviews</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{summary.ai_count} ({summary.ai_percentage}%)</div>
          </div>
          <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4">
            <div className="text-xs text-amber-400 uppercase">Abstained (Low Certainty)</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{summary.abstained_count} ({summary.abstained_percentage}%)</div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-700/60 font-semibold text-sm text-white">
            Individual Review Breakdown
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-900 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Review Snippet</th>
                  <th className="p-3">Deception Status</th>
                  <th className="p-3">Deception Prob</th>
                  <th className="p-3">Authorship Status</th>
                  <th className="p-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 font-sans">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-500">{i + 1}</td>
                    <td className="p-3 max-w-md truncate">
                      {r.explanation.token_attributions?.map(t => t.token).join(' ')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.deception.label === 'deceptive' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {r.deception.label}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{(r.deception.calibrated_probability * 100).toFixed(1)}%</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-400">
                        {r.authorship.label}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{(r.authorship.confidence * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
