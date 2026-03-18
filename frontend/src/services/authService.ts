import api from './api';
import type { ApiResponse, User, LoginCredentials, LoginResponse } from '@/types/index';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  async verifyInvite(token: string): Promise<{ name: string; email: string }> {
    const res = await api.get(`/auth/verify-invite/${token}`);
    return res.data.data;
  },

  async acceptInvite(token: string, password: string): Promise<LoginResponse> {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/accept-invite', { token, password });
    return res.data.data;
  },
};
