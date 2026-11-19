import axios from 'axios';
import {
  HealthStatus, SingleReviewAnalysis, DatasetItem, ModelItem,
  ExperimentItem, RobustnessEvalResult, GraphEgoNetwork
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  getHealth: async (): Promise<HealthStatus> => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  analyzeReview: async (payload: {
    review_text: string;
    rating?: number;
    product_category?: string;
    reviewer_id?: string;
    product_id?: string;
    timestamp?: string;
    explanation_method?: string;
  }): Promise<SingleReviewAnalysis> => {
    const res = await axios.post(`${API_BASE}/analyze/review`, payload);
    return res.data;
  },

  analyzeBatch: async (reviews: Array<{ review_text: string; rating?: number }>) => {
    const res = await axios.post(`${API_BASE}/analyze/batch`, { reviews });
    return res.data;
  },

  getDatasets: async (): Promise<DatasetItem[]> => {
    const res = await axios.get(`${API_BASE}/datasets`);
    return res.data;
  },

  getDatasetDetail: async (id: string) => {
    const res = await axios.get(`${API_BASE}/datasets/${id}`);
    return res.data;
  },

  getModels: async (): Promise<ModelItem[]> => {
    const res = await axios.get(`${API_BASE}/models`);
    return res.data;
  },

  getModelDetail: async (id: string) => {
    const res = await axios.get(`${API_BASE}/models/${id}`);
    return res.data;
  },

  getExperiments: async (): Promise<ExperimentItem[]> => {
    const res = await axios.get(`${API_BASE}/experiments`);
    return res.data;
  },

  getExperimentDetail: async (id: string) => {
    const res = await axios.get(`${API_BASE}/experiments/${id}`);
    return res.data;
  },

  evaluateRobustness: async (payload: {
    transformation_type: string;
    perturbation_intensity: number;
    test_samples_count?: number;
  }): Promise<RobustnessEvalResult> => {
    const res = await axios.post(`${API_BASE}/robustness/evaluate`, payload);
    return res.data;
  },

  getRobustnessHistory: async () => {
    const res = await axios.get(`${API_BASE}/robustness/history`);
    return res.data;
  },

  getGraphEgoNetwork: async (nodeId: number = 100): Promise<GraphEgoNetwork> => {
    const res = await axios.get(`${API_BASE}/graph/${nodeId}`);
    return res.data;
  },

  getGraphStats: async () => {
    const res = await axios.get(`${API_BASE}/graph/summary/stats`);
    return res.data;
  },

  getReports: async () => {
    const res = await axios.get(`${API_BASE}/reports`);
    return res.data;
  },

  getReportDetail: async (id: string) => {
    const res = await axios.get(`${API_BASE}/reports/${id}`);
    return res.data;
  }
};
