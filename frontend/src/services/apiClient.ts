import axios from 'axios';
import { AUTH_TOKEN_KEY, clearAuth } from '../utils/storage';
import { strings } from '../strings';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const apiBaseUrlMissing = !apiBaseUrl;

if (apiBaseUrlMissing) {
  console.warn('VITE_API_BASE_URL is not defined. Falling back to relative API calls.');
  window.dispatchEvent(new CustomEvent('app:config-error', { detail: strings.errors.missingApiBase }));
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
  timeout: 15000,
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
