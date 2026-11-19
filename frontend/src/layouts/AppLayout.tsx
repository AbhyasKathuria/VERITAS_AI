import { ReactNode } from 'react';
import {
  LayoutDashboard, Search, FileSpreadsheet, Cpu, ShieldAlert,
  Activity, Network, Database, Sliders, FlaskConical, Zap, Sparkles,
  Award, FileText, Settings as SettingsIcon, CheckCircle2
} from 'lucide-react';

interface AppLayoutProps {
  currentModule: string;
  onSelectModule: (module: string) => void;
  children: ReactNode;
}

export default function AppLayout({ currentModule, onSelectModule, children }: AppLayoutProps) {
  const navSections = [
    {
      title: "Core Analysis",
      items: [
        { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
        { id: "single_analyzer", label: "Single Review Analyzer", icon: Search },
        { id: "bulk_analyzer", label: "Bulk Review Analyzer", icon: FileSpreadsheet },
      ]
    },
    {
      title: "Detection Branches",
      items: [
        { id: "deception_detection", label: "Branch A: Deception", icon: ShieldAlert },
        { id: "authorship_detection", label: "Branch B: Authorship", icon: Cpu },
        { id: "behavioral_analysis", label: "Branch C: Behavioral", icon: Activity },
        { id: "evidence_graph", label: "Branch D: Evidence Graph", icon: Network },
      ]
    },
    {
      title: "Research Laboratories",
      items: [
        { id: "robustness_lab", label: "Robustness Testing Lab", icon: Zap },
        { id: "explainability_lab", label: "Explainability (XAI) Lab", icon: Sparkles },
        { id: "experiment_manager", label: "12-Stage Experiments", icon: FlaskConical },
        { id: "model_comparison", label: "Model Comparison", icon: Award },
      ]
    },
    {
      title: "Data & Systems",
      items: [
        { id: "dataset_manager", label: "Dataset Manager", icon: Database },
        { id: "training_lab", label: "Training & Calibration", icon: Sliders },
        { id: "research_reports", label: "Research Monographs", icon: FileText },
        { id: "settings", label: "System Settings", icon: SettingsIcon },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#0a0f1d] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-navy-800/95 border-r border-slate-700/60 flex flex-col justify-between shrink-0">
        <div className="p-4 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center space-x-2.5 px-2 py-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center space-x-1">
                <span>VERITAS</span>
                <span className="text-blue-400">AI</span>
              </div>
              <div className="text-[10px] text-slate-400">Forensic ML Research</div>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-5">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectModule(item.id)}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-700/60 bg-navy-900/60 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>API Online</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v1.0.0</span>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1d]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-700/60 bg-navy-800/60 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>VERITAS AI</span>
            <span>/</span>
            <span className="text-slate-200 font-medium capitalize">
              {currentModule.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-2.5 py-1 bg-navy-900 border border-slate-700 rounded-full text-[11px] text-slate-300 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Dual-Track Active: Deception ⊥ Authorship</span>
            </div>
            <div className="px-2.5 py-1 bg-navy-900 border border-slate-700 rounded-full text-[11px] text-purple-300 font-mono">
              τ_abstain: 0.60
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
