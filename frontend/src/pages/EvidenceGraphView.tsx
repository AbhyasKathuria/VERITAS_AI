import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GraphEgoNetwork } from '../types';
import { Layers, Network, Activity, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EvidenceGraphView() {
  const [nodeId, setNodeId] = useState<number>(100);
  const [graphData, setGraphData] = useState<GraphEgoNetwork | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGraph(nodeId);
    api.getGraphStats().then(setStats).catch(console.error);
  }, []);

  const loadGraph = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getGraphEgoNetwork(id);
      setGraphData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Review Evidence Graph Forensics</h1>
          <p className="text-slate-400 text-xs mt-1">
            Branch D: Multi-relational heterogeneous network analysis over YelpChi ($45,954$ nodes) identifying coordinated astroturfing rings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={0}
            max={45953}
            value={nodeId}
            onChange={(e) => setNodeId(parseInt(e.target.value) || 0)}
            className="w-28 bg-navy-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
            placeholder="Node ID"
          />
          <button
            onClick={() => loadGraph(nodeId)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Inspect Node</span>
          </button>
        </div>
      </div>

      {/* Global Graph Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase">Total Review Nodes</div>
            <div className="text-xl font-bold text-white mt-1">{stats.num_nodes?.toLocaleString()}</div>
          </div>
          {stats.relations?.slice(0, 3).map((r: any, idx: number) => (
            <div key={idx} className="bg-navy-800 border border-slate-700/60 rounded-xl p-4">
              <div className="text-xs text-cyan-400 uppercase truncate">{r.name}</div>
              <div className="text-xl font-bold text-slate-200 mt-1">{r.edges?.toLocaleString()} edges</div>
            </div>
          ))}
        </div>
      )}

      {/* Visual Ego Network Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">1-Hop Multi-Relational Ego Subgraph</h3>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Filtered Fraud</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Recommended Benign</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
              <Activity className="w-5 h-5 animate-spin mr-2 text-blue-500" />
              Loading node relational topology...
            </div>
          ) : graphData ? (
            <div className="h-72 bg-navy-950 border border-slate-700/70 rounded-lg p-4 relative overflow-hidden flex flex-wrap items-center justify-center gap-3">
              {graphData.nodes.map((node) => {
                const isTarget = node.id.includes(String(graphData.node_id));
                return (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center transition-transform hover:scale-105 shadow-md ${
                      isTarget
                        ? 'bg-blue-600/30 border-blue-500 text-white font-bold ring-2 ring-blue-500'
                        : node.is_fraud
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {node.is_fraud ? <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="truncate max-w-[120px]">{node.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Degree: {node.degree}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Relational Links List */}
          {graphData && (
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identified Relational Edges</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {graphData.links.map((link, idx) => (
                  <div key={idx} className="p-2 bg-navy-900 rounded border border-slate-700/60 flex justify-between">
                    <span className="text-slate-300">{link.relation}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{link.target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Forensic Node Inspector Card */}
        {graphData && (
          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Relational Fraud Forensics</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Target Ground-Truth Status</div>
                  <div className={`text-base font-bold mt-1 ${graphData.target_is_fraud ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {graphData.target_is_fraud ? 'YELP FILTERED SPAM' : 'RECOMMENDED BENIGN'}
                  </div>
                </div>

                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Neighbor Spam Ratio</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">
                    {(graphData.neighbor_fraud_ratio * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Fraction of connected reviews flagged as fraudulent.
                  </div>
                </div>

                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Homogeneous Degree Centrality</div>
                  <div className="text-base font-bold text-purple-400 mt-1">
                    {graphData.degree_centrality} Co-edges
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-slate-300 leading-relaxed">
              <strong>CARE-GNN Insight:</strong> Review spammers camouflage behavior by linking with authentic products. Multi-relational propagation isolates edges where temporal and star-rating compatibility diverge from benign baselines.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
