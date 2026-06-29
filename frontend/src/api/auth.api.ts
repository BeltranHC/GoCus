// ============================================
// GOCus — API: Auth Endpoints
// ============================================

import api from './axios';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<{ data: LoginResponse }>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get('/auth/profile'),
};
