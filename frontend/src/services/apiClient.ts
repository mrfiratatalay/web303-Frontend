import axios from 'axios';
import { AUTH_TOKEN_KEY, clearAuth } from '../utils/storage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isAuthEndpoint =
      error?.config?.url?.includes('/auth/login') ||
      error?.config?.url?.includes('/auth/register') ||
      error?.config?.url?.includes('/auth/verify-email') ||
      error?.config?.url?.includes('/auth/forgot-password') ||
      error?.config?.url?.includes('/auth/reset-password');

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default apiClient;
