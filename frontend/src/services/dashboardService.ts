import api from './api';
import type { ApiResponse, DashboardStats, TeamAppraisal, AnalyticsData } from '@/types/index';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data.data;
  },

  async getTeamAppraisals(): Promise<TeamAppraisal[]> {
    const res = await api.get('/dashboard/team');
    return res.data.data;
  },

  async getTeamAnalytics(): Promise<AnalyticsData> {
    const res = await api.get<ApiResponse<any>>('/dashboard/analytics');
    const raw = res.data.data;
    // Backend returns averageRatings as an object; normalize to array
    const averageRatings = raw.averageRatings && !Array.isArray(raw.averageRatings)
      ? Object.entries(raw.averageRatings).map(([category, average]) => ({ category, average: average as number }))
      : (raw.averageRatings ?? []);
    return { ...raw, averageRatings };
  },
};
