import apiClient from '../shared/services/apiClient';

export const quizApi = {
  async listPublicQuizzes(params = {}) {
    const res = await apiClient.get('/quizzes/public/list', { params });
    return res.data?.data || [];
  },
  async getPublicQuizById(quizId) {
    const res = await apiClient.get(`/quizzes/public/${quizId}`);
    return res.data?.data || null;
  },
  async getQuizQuestionsByQuizId(quizId) {
    const res = await apiClient.get(`/quizzes/by-id/${quizId}`);
    return res.data?.data || null;
  },
  async getQuizByLesson(lessonId) {
    const res = await apiClient.get(`/quizzes/${lessonId}`);
    return res.data?.data || null;
  },
  async submitAttempt(lessonId, answers) {
    const res = await apiClient.post(`/quizzes/${lessonId}/submit`, { answers });
    return res.data?.data || null;
  },
  async submitAttemptByQuizId(quizId, answers) {
    const res = await apiClient.post(`/quizzes/by-id/${quizId}/submit`, { answers });
    return res.data?.data || null;
  }
};

export default quizApi;
