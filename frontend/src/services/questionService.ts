import api from './api';
import type { QuestionSection, Question } from '@/types/index';

export const questionService = {
  async getQuestions(): Promise<QuestionSection[]> {
    const res = await api.get('/questions');
    return res.data.data;
  },

  async getQuestionsBySection(section: string): Promise<QuestionSection> {
    const res = await api.get(`/questions/section/${section}`);
    return res.data.data;
  },

  async getQuestionById(id: string): Promise<Question> {
    const res = await api.get(`/questions/${id}`);
    return res.data.data;
  },
};
