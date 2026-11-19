import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HealthStatus, DatasetItem, ModelItem, ExperimentItem } from '../types';
import {
  ShieldAlert, Cpu, Database, FlaskConical, Activity, ArrowRight,
  TrendingUp, Award, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (module: string) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [h, d, m, e] = await Promise.all([
          api.getHealth(),
          api.getDatasets(),
          api.getModels(),
          api.getExperiments()
        ]);
        setHealth(h);
        setDatasets(d);
        setModels(m);
        setExperiments(e);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalReviews = datasets.reduce((acc, curr) => acc + curr.sample_count, 0);

  const datasetChartData = datasets.map(d => ({
    name: d.name.replace(" Dataset", "").replace("Corpus", ""),
    count: d.sample_count
  }));

  const experimentDistribution = [
    { name: 'Deception & NLP', value: 4, color: '#3b82f6' },
    { name: 'AI Authorship', value: 3, color: '#06b6d4' },
    { name: 'Graph & Anomaly', value: 2, color: '#10b981' },
    { name: 'Robustness & XAI', value: 3, color: '#8b5cf6' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3 text-slate-400">
          <Activity className="w-5 h-5 animate-spin text-blue-500" />
          <span>Synchronizing system telemetry from backend...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-700/80 border border-slate-700/60 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Research Intelligence Platform</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">VERITAS AI System Control</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Orthogonal dual-track detection distinguishing review deception from text authorship, backed by
              temperature-scaled calibration and graph forensics.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('single_analyzer')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/30 flex items-center space-x-2"
            >
              <span>Analyze Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('robustness_lab')}
              className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-600/50"
            >
              Robustness Lab
            </button>
          </div>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Verified Corpus</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalReviews.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Samples across {datasets.length} benchmark sources</div>
        </div>

        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Champion Deception F1</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">76.5%</div>
          <div className="text-xs text-slate-400 mt-1">ROC-AUC: 90.3% | PR-AUC: 97.4%</div>
        </div>

        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Authorship ROC-AUC</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">96.4%</div>
          <div className="text-xs text-slate-400 mt-1">Macro F1: 82.2% | Multi-class</div>
        </div>

        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Calibration Error (ECE)</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">0.0468</div>
          <div className="text-xs text-slate-400 mt-1">Post-hoc temperature scaled (&lt; 0.05)</div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Distribution */}
        <div className="lg:col-span-2 bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Ingested Dataset Portfolio</h2>
              <p className="text-xs text-slate-400">Sample distribution across standardized research benchmarks</p>
            </div>
            <button
              onClick={() => onNavigate('dataset_manager')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View Datasets →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datasetChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experiment Domains */}
        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">12-Stage Experiment Suite</h2>
              <p className="text-xs text-slate-400">Status across formal research hypotheses</p>
            </div>
            <button
              onClick={() => onNavigate('experiment_manager')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={experimentDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {experimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {experimentDistribution.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('deception_detection')}
          className="bg-navy-800/70 hover:bg-navy-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-5 cursor-pointer transition group"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Branch A: Deception Detection</h3>
          </div>
          <p className="text-xs text-slate-400">
            Psycholinguistic stylometry targeting 1st-person pronoun elevation and spatial/architectural deficits.
          </p>
        </div>

        <div
          onClick={() => onNavigate('authorship_detection')}
          className="bg-navy-800/70 hover:bg-navy-800 border border-slate-700/60 hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition group"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Branch B: Authorship Detection</h3>
          </div>
          <p className="text-xs text-slate-400">
            Multi-class text origin modeling separating Human, AI-Generated (GPT, LLaMA), and AI-Assisted drafts.
          </p>
        </div>

        <div
          onClick={() => onNavigate('evidence_graph')}
          className="bg-navy-800/70 hover:bg-navy-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer transition group"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Branch D: Graph Forensics</h3>
          </div>
          <p className="text-xs text-slate-400">
            Multi-relational graph propagation across 45,954 nodes to unmask temporal and co-review fraud clusters.
          </p>
        </div>
      </div>
    </div>
  );
}
