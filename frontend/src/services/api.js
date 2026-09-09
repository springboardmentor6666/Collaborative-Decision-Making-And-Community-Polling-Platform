/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: api.js
 * Architecture Tier: API Service Wrapper (Data Layer)
 * Path: frontend/src/services/api.js
 *
 * Purpose:
 *   Base Axios API instance configured with root base URL, timeout thresholds, and global request/response interceptors.
 */

import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const baseURL = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('decisionhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('decisionhub_token');
      localStorage.removeItem('decisionhub_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
