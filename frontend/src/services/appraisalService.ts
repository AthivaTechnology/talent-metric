import api from './api';
import type {
  Appraisal,
  Comment,
  RatingCategory,
  CreateAppraisalPayload,
  UpdateAppraisalPayload,
} from '@/types/index';

export interface AppraisalListParams {
  status?: string;
  year?: number;
  page?: number;
  limit?: number;
}

export interface AppraisalListResponse {
  appraisals: Appraisal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const appraisalService = {
  async getAppraisals(params?: AppraisalListParams): Promise<AppraisalListResponse> {
    const res = await api.get('/appraisals', { params });
    return {
      appraisals: res.data.data,
      ...res.data.pagination,
    };
  },

  async getAppraisalById(id: string): Promise<Appraisal> {
    const res = await api.get(`/appraisals/${id}`);
    return res.data.data;
  },

  async createAppraisal(payload: CreateAppraisalPayload): Promise<Appraisal> {
    const res = await api.post('/appraisals', payload);
    return res.data.data;
  },

  async updateAppraisal(id: string, payload: UpdateAppraisalPayload): Promise<Appraisal> {
    const res = await api.put(`/appraisals/${id}`, payload);
    return res.data.data;
  },

  async submitAppraisal(id: string): Promise<Appraisal> {
    const res = await api.post(`/appraisals/${id}/submit`);
    return res.data.data;
  },

  async addComment(id: string, comment: string): Promise<Comment> {
    const res = await api.post(`/appraisals/${id}/comments`, { comment });
    return res.data.data;
  },

  async getComments(id: string): Promise<Comment[]> {
    const res = await api.get(`/appraisals/${id}/comments`);
    return res.data.data;
  },

  async saveReviewerRatings(id: string, ratings: Array<{ category: RatingCategory; rating: number }>): Promise<void> {
    await api.put(`/appraisals/${id}/reviewer-ratings`, { ratings });
  },

  async saveManagerFeedback(id: string, feedback: string): Promise<void> {
    await api.put(`/appraisals/${id}/manager-feedback`, { feedback });
  },

  async bulkCreate(payload: { year: number; deadline?: string }): Promise<{ created: number; skipped: number; message: string }> {
    const res = await api.post('/appraisals/bulk', payload);
    return { ...res.data.data, message: res.data.message };
  },
};
