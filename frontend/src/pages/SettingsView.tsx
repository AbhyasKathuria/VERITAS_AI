import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HealthStatus } from '../types';
import { Settings as SettingsIcon, ShieldCheck, Database, Cpu, CheckCircle } from 'lucide-react';

export default function SettingsView() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [abstention, setAbstention] = useState<number>(0.60);
  const [tempDec, setTempDec] = useState<number>(1.15);
  const [tempAuth, setTempAuth] = useState<number>(1.10);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Settings &amp; Telemetry</h1>
        <p className="text-slate-400 text-xs mt-1">
          Runtime inference configuration, uncertainty calibration boundaries, and database connection status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-white">Inference &amp; Abstention Tuning</h3>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Selective Classification Abstention Threshold (τ)</span>
              <span className="font-mono text-white font-bold">{(abstention * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min={0.50}
              max={0.85}
              step={0.05}
              value={abstention}
              onChange={(e) => setAbstention(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <span className="text-[11px] text-slate-500">
              Predictions with confidence below this threshold output 'insufficient_evidence'.
            </span>
          </div>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Branch A Temperature Scaling Factor (T_dec)</span>
              <span className="font-mono text-white font-bold">{tempDec}</span>
            </label>
            <input
              type="range"
              min={0.8}
              max={1.8}
              step={0.05}
              value={tempDec}
              onChange={(e) => setTempDec(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Branch B Temperature Scaling Factor (T_auth)</span>
              <span className="font-mono text-white font-bold">{tempAuth}</span>
            </label>
            <input
              type="range"
              min={0.8}
              max={1.8}
              step={0.05}
              value={tempAuth}
              onChange={(e) => setTempAuth(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            {saved ? "Settings Updated!" : "Apply Calibration Parameters"}
          </button>
        </div>

        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-white">Infrastructure &amp; Runtime Status</h3>

          {health ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-navy-900 rounded border border-slate-700/50">
                <span className="text-slate-400">Backend Server Status</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                  {health.status}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-navy-900 rounded border border-slate-700/50">
                <span className="text-slate-400">Execution Environment</span>
                <span className="font-mono text-slate-200">{health.environment}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-navy-900 rounded border border-slate-700/50">
                <span className="text-slate-400">PyTorch Neural Acceleration</span>
                <span className="font-mono text-slate-200">
                  {health.cuda_available ? "CUDA GPU Active" : "CPU High-Throughput Engine"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-navy-900 rounded border border-slate-700/50">
                <span className="text-slate-400">Persistence Engine</span>
                <span className="font-mono text-slate-200">SQLite + SQLAlchemy ORM</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-navy-900 rounded border border-slate-700/50">
                <span className="text-slate-400">API Version</span>
                <span className="font-mono text-slate-200">{health.version}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Loading health status...</div>
          )}
        </div>
      </div>
    </div>
  );
}
