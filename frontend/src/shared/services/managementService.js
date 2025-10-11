import apiClient from './apiClient';

export const lessonService = {
  async list(params = {}) {
    const res = await apiClient.get('/lessons', { params });
    return res.data;
  },
  
  async getById(id) {
    const res = await apiClient.get(`/lessons/${id}`);
    return res.data;
  },
  
  async create(data) {
    const res = await apiClient.post('/lessons', data);
    return res.data;
  },
  
  async update(id, data) {
    const res = await apiClient.put(`/lessons/${id}`, data);
    return res.data;
  },
  
  async delete(id) {
    const res = await apiClient.delete(`/lessons/${id}`);
    return res.data;
  }
};

export const quizManagementService = {
  async list(params = {}) {
    const res = await apiClient.get('/quizzes/manage/list', { params });
    return res.data;
  },
  
  async getById(id) {
    const res = await apiClient.get(`/quizzes/manage/${id}`);
    return res.data;
  },
  
  async create(data) {
    const res = await apiClient.post('/quizzes/manage', data);
    return res.data;
  },
  
  async update(id, data) {
    const res = await apiClient.put(`/quizzes/manage/${id}`, data);
    return res.data;
  },
  
  async delete(id) {
    const res = await apiClient.delete(`/quizzes/manage/${id}`);
    return res.data;
  }
};

export default apiClient;
