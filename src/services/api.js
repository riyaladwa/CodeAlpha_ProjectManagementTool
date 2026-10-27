import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach workspace ID and token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentWorkspaceId = localStorage.getItem('taskflow_active_workspace_id');
    if (currentWorkspaceId && !config.headers['x-workspace-id']) {
      config.headers['x-workspace-id'] = currentWorkspaceId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // If 401 Unauthorized on non-login/register routes, we can handle session expiry
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
      localStorage.removeItem('taskflow_token');
    }

    return Promise.reject({
      ...error,
      userMessage: message,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
