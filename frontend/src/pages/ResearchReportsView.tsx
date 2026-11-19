import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Download, BookOpen, ExternalLink } from 'lucide-react';

export default function ResearchReportsView() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    api.getReports().then((data) => {
      setReports(data);
      if (data.length > 0) {
        setSelectedReport(data[0]);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Academic Research Monographs &amp; Audits</h1>
        <p className="text-slate-400 text-xs mt-1">
          Formal academic documentation, methodology descriptions, and reproducibility guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Reports</div>
          {reports.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedReport(r)}
              className={`p-4 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                selectedReport?.id === r.id
                  ? 'bg-navy-800 border-blue-500 shadow-md ring-1 ring-blue-500'
                  : 'bg-navy-800/60 border-slate-700/60 hover:bg-navy-800'
              }`}
            >
              <div className="text-sm font-semibold text-white">{r.title}</div>
              <div className="text-slate-400">{r.lead_author} | {r.date}</div>
              <div className="text-blue-400 font-medium text-[11px]">{r.category}</div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-6 shadow-lg space-y-4">
          {selectedReport ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{selectedReport.category}</span>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedReport.title}</h2>
                  <div className="text-xs text-slate-400 mt-0.5">Author: {selectedReport.lead_author} | Date: {selectedReport.date}</div>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-4 bg-navy-900 border border-slate-700/60 rounded-lg">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Executive Summary</h4>
                  <p>{selectedReport.summary}</p>
                </div>

                <div className="p-4 bg-navy-900 border border-slate-700/60 rounded-lg space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Methodology &amp; Empirical Claims</h4>
                  <p>
                    The research methodology employed in VERITAS AI operates on five foundational tenets:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                    <li>Strict orthogonality between Authorship and Deceptive Intent (Y_dec ⊥ Y_auth).</li>
                    <li>Zero synthetic score fabrication; all reported metrics originate from locked test splits.</li>
                    <li>GroupShuffleSplit partitioning over entity keys preventing hotel and product memorization.</li>
                    <li>Temperature-scaled post-hoc probability calibration minimizing Expected Calibration Error below 0.05.</li>
                    <li>Defensible token attribution directly computed from mathematical pipeline gradients and Shapley values.</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-xs text-center py-12">Select a report to view full text.</div>
          )}
        </div>
      </div>
    </div>
  );
}
