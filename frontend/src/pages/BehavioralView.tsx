import { useState } from 'react';
import { api } from '../services/api';
import { Activity, Clock, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function BehavioralView() {
  const [rating, setRating] = useState<number>(5.0);
  const [historyCount, setHistoryCount] = useState<number>(12);
  const [extremeRatio, setExtremeRatio] = useState<number>(85);
  const [burstInterval, setBurstInterval] = useState<number>(1.5);
  const [anomalyResult, setAnomalyResult] = useState<any>(null);

  const calculateAnomaly = () => {
    // Interactive behavioral simulation
    let signals = [];
    if (rating === 1.0 || rating === 5.0) signals.push(0.2);
    if (extremeRatio > 80) signals.push(0.35);
    if (burstInterval < 2.0) signals.push(0.40);
    const score = Math.min(1.0, signals.reduce((a, b) => a + b, 0.15));

    setAnomalyResult({
      score: round(score, 3),
      ratingDev: rating === 5.0 ? 1.8 : 2.5,
      burstFlag: burstInterval < 2.0,
      freqFlag: extremeRatio > 80,
      interpretation: score > 0.60
        ? "High anomaly: Extreme velocity burst with bimodal rating distribution."
        : score > 0.35
        ? "Moderate anomaly: Noticeable burst frequency."
        : "Normal consumer review velocity pattern."
    });
  };

  function round(val: number, dec: number) {
    return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
  }

  const ratingDistData = [
    { stars: '1 Star', count: 18 },
    { stars: '2 Stars', count: 2 },
    { stars: '3 Stars', count: 1 },
    { stars: '4 Stars', count: 3 },
    { stars: '5 Stars', count: 42 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Reviewer Behavioral Analysis</h1>
        <p className="text-slate-400 text-xs mt-1">
          Branch C: Detects non-textual anomalies, temporal review bursts, velocity surges, and bimodal rating divergence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-white">Interactive Behavioral Simulation</h3>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Given Star Rating</span>
              <span className="font-bold text-white">{rating} Stars</span>
            </label>
            <input
              type="range"
              min={1.0}
              max={5.0}
              step={1.0}
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Reviewer History Count</span>
              <span className="font-bold text-white">{historyCount} Reviews</span>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={historyCount}
              onChange={(e) => setHistoryCount(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Bimodal Extremity (1 &amp; 5 Stars)</span>
              <span className="font-bold text-white">{extremeRatio}%</span>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={extremeRatio}
              onChange={(e) => setExtremeRatio(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Min Temporal Interval</span>
              <span className="font-bold text-white">{burstInterval} Hours</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={24.0}
              step={0.5}
              value={burstInterval}
              onChange={(e) => setBurstInterval(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <button
            onClick={calculateAnomaly}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Compute Behavioral Anomaly Score
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {anomalyResult ? (
            <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Composite Anomaly Score</div>
                  <div className={`text-3xl font-bold mt-1 ${
                    anomalyResult.score > 0.6 ? 'text-rose-400' : anomalyResult.score > 0.35 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {anomalyResult.score}
                  </div>
                </div>
                <div className="p-3 bg-navy-900 rounded-lg text-xs text-slate-300 max-w-sm">
                  {anomalyResult.interpretation}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-700/60">
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Rating Deviation</div>
                  <div className="text-sm font-bold text-white mt-1">{anomalyResult.ratingDev} Stars</div>
                </div>
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Burst Flag</div>
                  <div className={`text-sm font-bold mt-1 ${anomalyResult.burstFlag ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {anomalyResult.burstFlag ? 'SURGE DETECTED' : 'NORMAL'}
                  </div>
                </div>
                <div className="p-3 bg-navy-900 rounded border border-slate-700/50">
                  <div className="text-slate-400">Extreme Bias Flag</div>
                  <div className={`text-sm font-bold mt-1 ${anomalyResult.freqFlag ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {anomalyResult.freqFlag ? 'BIMODAL SKEW' : 'BALANCED'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-navy-800/60 border border-slate-700/60 rounded-xl p-6 text-center text-slate-400 text-xs">
              Configure parameters on the left to evaluate behavioral anomaly scoring.
            </div>
          )}

          <div className="bg-navy-800/90 border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Sample Account Rating Distribution</h3>
            <p className="text-xs text-slate-400 mb-3">Noticeable U-shaped bimodal rating distribution characteristic of incentivized astroturfers.</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistData}>
                  <XAxis dataKey="stars" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
