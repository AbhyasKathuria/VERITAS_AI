import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DatasetItem } from '../types';
import { Database, FileText, CheckCircle2, Shield, ExternalLink, Activity } from 'lucide-react';

export default function DatasetManagerView() {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDatasets().then((data) => {
      setDatasets(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
        loadDetail(data[0].id);
      }
    }).finally(() => setLoading(false));
  }, []);

  const loadDetail = async (id: string) => {
    setSelectedId(id);
    try {
      const d = await api.getDatasetDetail(id);
      setSelectedDetail(d);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <Activity className="w-5 h-5 animate-spin mr-2 text-blue-500" />
        Loading dataset registry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Dataset Manager &amp; Provenance Registry</h1>
        <p className="text-slate-400 text-xs mt-1">
          Catalog of standardized academic benchmarks. All datasets strictly adhere to the 15-field VERITAS AI schema with documented provenance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datasets List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingested Benchmark Sources</div>
          {datasets.map((d) => (
            <div
              key={d.id}
              onClick={() => loadDetail(d.id)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedId === d.id
                  ? 'bg-navy-800 border-blue-500 shadow-lg ring-1 ring-blue-500'
                  : 'bg-navy-800/60 border-slate-700/60 hover:bg-navy-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">{d.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">
                  {d.domain}
                </span>
              </div>
              <div className="text-xs text-slate-400 line-clamp-2 mt-1">{d.description}</div>
              <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-700/50">
                <span>{d.sample_count?.toLocaleString()} samples</span>
                <span>{d.license}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Dataset Detail & Samples */}
        <div className="lg:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
          {selectedDetail ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDetail.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Origin: {selectedDetail.source_type} | License: {selectedDetail.license}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase">Total Samples</div>
                  <div className="text-lg font-bold text-white">{selectedDetail.sample_count?.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Ingested Sample Reviews</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {selectedDetail.sample_reviews?.map((r: any, idx: number) => (
                    <div key={idx} className="p-3 bg-navy-900 border border-slate-700/50 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-500 text-[11px]">{r.review_id}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                            r.deception === 'deceptive' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {r.deception}
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-400">
                            {r.authorship}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-300">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-slate-300">
                <strong>Leakage Prevention Guarantee:</strong> Samples from this benchmark are split using GroupShuffleSplit over fine-grained entity IDs. No hotel or merchant reviews in the training split exist in validation or test partitions.
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-xs text-center py-12">Select a dataset to view schema and samples.</div>
          )}
        </div>
      </div>
    </div>
  );
}
