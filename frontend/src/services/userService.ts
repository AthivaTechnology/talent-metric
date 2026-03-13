import api from './api';
import type { User, CreateUserPayload, UpdateUserPayload } from '@/types/index';

export interface UserListParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userService = {
  async getUsers(params?: UserListParams): Promise<UserListResponse> {
    const res = await api.get('/users', { params });
    return {
      users: res.data.data,
      ...res.data.pagination,
    };
  },

  async getUserById(id: number | string): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const res = await api.post('/users', payload);
    return res.data.data;
  },

  async updateUser(id: number | string, payload: UpdateUserPayload): Promise<User> {
    const res = await api.put(`/users/${id}`, payload);
    return res.data.data;
  },

  async deleteUser(id: number | string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getTechLeads(): Promise<User[]> {
    const res = await api.get('/users/tech-leads');
    return res.data.data;
  },

  async getManagers(): Promise<User[]> {
    const res = await api.get('/users/managers');
    return res.data.data;
  },

  async deactivateUser(id: number | string): Promise<void> {
    await api.patch(`/users/${id}/deactivate`);
  },

  async activateUser(id: number | string): Promise<void> {
    await api.patch(`/users/${id}/activate`);
  },
};
