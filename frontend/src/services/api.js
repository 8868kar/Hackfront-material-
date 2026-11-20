import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getReadiness = async () => {
  const response = await api.get('/readiness');
  return response.data;
};

export const predictADHD = async (data) => {
  const response = await api.post('/predict', data);
  return response.data;
};

export const getRecommendations = async (data) => {
  const response = await api.post('/recommend', data);
  return response.data;
};

export const getCopilotBrief = async (data) => {
  const response = await api.post('/copilot/brief', data);
  return response.data;
};

// ── Auth APIs ───────────────────────────────────────────────────────────

export const authLogin = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getUser = async (email) => {
  const response = await api.get(`/auth/user/${encodeURIComponent(email)}`);
  return response.data;
};

// ── Report APIs ─────────────────────────────────────────────────────────

export const saveReport = async (email, predictionResult, inputData = {}) => {
  const response = await api.post('/reports/save', {
    email,
    prediction_result: predictionResult,
    input_data: inputData,
  });
  return response.data;
};

export const getUserReports = async (email) => {
  const response = await api.get(`/reports/${encodeURIComponent(email)}`);
  return response.data;
};

// ── Admin APIs ──────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getAdminUserReports = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/reports`);
  return response.data;
};

export const getAdminAssessments = async () => {
  const response = await api.get('/admin/assessments');
  return response.data;
};

export default api;
