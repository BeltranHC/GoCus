// ============================================
// GOCus — API: Axios Instance
// ============================================

import axios from 'axios';
import { API_URL, STORAGE_KEYS } from '../utils/constants';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Agregar token ──
api.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor: Auto-refresh de token ──
api.interceptors.response.use(
  (response) => {
    // Si la respuesta viene envuelta por TransformInterceptor del backend
    if (response.data && response.data.success !== undefined && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, clear tokens
          storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
          storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
