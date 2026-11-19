import { useState } from 'react';
import AppLayout from './layouts/AppLayout';
import DashboardView from './pages/DashboardView';
import SingleAnalyzerView from './pages/SingleAnalyzerView';
import BulkAnalyzerView from './pages/BulkAnalyzerView';
import AuthorshipLabView from './pages/AuthorshipLabView';
import DeceptionLabView from './pages/DeceptionLabView';
import BehavioralView from './pages/BehavioralView';
import EvidenceGraphView from './pages/EvidenceGraphView';
import DatasetManagerView from './pages/DatasetManagerView';
import TrainingLabView from './pages/TrainingLabView';
import ExperimentManagerView from './pages/ExperimentManagerView';
import RobustnessLabView from './pages/RobustnessLabView';
import ExplainabilityLabView from './pages/ExplainabilityLabView';
import ModelComparisonView from './pages/ModelComparisonView';
import ResearchReportsView from './pages/ResearchReportsView';
import SettingsView from './pages/SettingsView';

export default function App() {
  const [currentModule, setCurrentModule] = useState<string>('dashboard');

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardView onNavigate={(m) => setCurrentModule(m)} />;
      case 'single_analyzer':
        return <SingleAnalyzerView />;
      case 'bulk_analyzer':
        return <BulkAnalyzerView />;
      case 'authorship_detection':
        return <AuthorshipLabView />;
      case 'deception_detection':
        return <DeceptionLabView />;
      case 'behavioral_analysis':
        return <BehavioralView />;
      case 'evidence_graph':
        return <EvidenceGraphView />;
      case 'dataset_manager':
        return <DatasetManagerView />;
      case 'training_lab':
        return <TrainingLabView />;
      case 'experiment_manager':
        return <ExperimentManagerView />;
      case 'robustness_lab':
        return <RobustnessLabView />;
      case 'explainability_lab':
        return <ExplainabilityLabView />;
      case 'model_comparison':
        return <ModelComparisonView />;
      case 'research_reports':
        return <ResearchReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(m) => setCurrentModule(m)} />;
    }
  };

  return (
    <AppLayout currentModule={currentModule} onSelectModule={(m) => setCurrentModule(m)}>
      {renderModule()}
    </AppLayout>
  );
}
