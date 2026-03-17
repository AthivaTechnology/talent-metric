import api from './api';
import type {
  Appraisal,
  Comment,
  PeerFeedback,
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

  async addComment(id: string, comment: string, questionId?: string): Promise<Comment> {
    const payload: Record<string, unknown> = { comment };
    if (questionId) payload.questionId = questionId;
    const res = await api.post(`/appraisals/${id}/comments`, payload);
    return res.data.data;
  },

  async getComments(id: string): Promise<Comment[]> {
    const res = await api.get(`/appraisals/${id}/comments`);
    return res.data.data;
  },

  async saveReviewerRatings(id: string, ratings: Array<{ category: RatingCategory; rating: number }>): Promise<void> {
    await api.put(`/appraisals/${id}/reviewer-ratings`, { ratings });
  },

  async saveManagerFeedback(id: string, feedback: string, consolidatedRating?: number | null): Promise<void> {
    await api.put(`/appraisals/${id}/manager-feedback`, { feedback, consolidatedRating });
  },

  async bulkCreate(payload: { year: number; deadline?: string }): Promise<{ created: number; skipped: number; message: string }> {
    const res = await api.post('/appraisals/bulk', payload);
    return { ...res.data.data, message: res.data.message };
  },

  async returnAppraisal(id: string, reason?: string): Promise<Appraisal> {
    const res = await api.post(`/appraisals/${id}/return`, { reason });
    return res.data.data;
  },

  async exportAppraisals(params?: { year?: number }): Promise<Blob> {
    const res = await api.get('/appraisals/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  async getPeerOverview(): Promise<Array<{
    user: { id: string; name: string; email: string; role: string };
    appraisal: { id: string; status: string; year: number } | null;
    myFeedback: Pick<PeerFeedback, 'id' | 'appraisalId' | 'didWell' | 'canImprove' | 'createdAt' | 'updatedAt'> | null;
  }>> {
    const res = await api.get('/peer-feedback/overview');
    return res.data.data;
  },

  async getPeerFeedback(id: string): Promise<PeerFeedback[]> {
    const res = await api.get(`/appraisals/${id}/peer-feedback`);
    return res.data.data;
  },

  async addPeerFeedback(id: string, didWell: string, canImprove: string): Promise<PeerFeedback> {
    const res = await api.post(`/appraisals/${id}/peer-feedback`, { didWell, canImprove });
    return res.data.data;
  },

  async updatePeerFeedback(id: string, feedbackId: string, didWell: string, canImprove: string): Promise<PeerFeedback> {
    const res = await api.put(`/appraisals/${id}/peer-feedback/${feedbackId}`, { didWell, canImprove });
    return res.data.data;
  },

  async deletePeerFeedback(id: string, feedbackId: string): Promise<void> {
    await api.delete(`/appraisals/${id}/peer-feedback/${feedbackId}`);
  },
};
