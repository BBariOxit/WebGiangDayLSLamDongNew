import axios from 'axios';
import store from '../../app/store';
import { logout } from '../../features/auth/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

const forceLogout = () => {
  store.dispatch(logout());
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const getAccessToken = () => {
  try {
    const stateToken = store.getState().auth?.accessToken;
    return stateToken || localStorage.getItem('authToken');
  } catch {
    return localStorage.getItem('authToken');
  }
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
  pendingQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const hasAuthHeader = Boolean(originalRequest.headers?.Authorization);
    const isAuthRoute = typeof originalRequest.url === 'string' && originalRequest.url.includes('/auth/');

    // Attempt refresh on 401 once (only for requests that included auth header)
    if (status === 401 && hasAuthHeader && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        // queue the request until refresh completes
        try {
          const newToken = await new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (e) {
          return Promise.reject(e);
        }
      }

      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        if (!res.data?.success) throw new Error('Refresh failed');
        const { accessToken, refreshToken: newRefresh, user } = res.data.data;
        localStorage.setItem('authToken', accessToken);
        if (newRefresh) {
          localStorage.setItem('refreshToken', newRefresh);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        processQueue(null, accessToken);
        // retry original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        forceLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && hasAuthHeader && !originalRequest._retry) {
      forceLogout();
    }

    if (status === 403) {
      console.error('Access denied');
    }
    if (status >= 500) {
      console.error('Server error:', error.response?.data?.message || 'Internal server error');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
