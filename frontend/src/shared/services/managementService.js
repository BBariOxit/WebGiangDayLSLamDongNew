import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
