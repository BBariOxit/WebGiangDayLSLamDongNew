import axios from 'axios';
import store from '../store';
import { setTokens, logout } from '../features/auth/authSlice';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL, withCredentials: false });

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  queue = [];
}

api.interceptors.request.use(config => {
  const state = store.getState();
  const accessToken = state.auth.accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(r => r, async error => {
  const original = error.config;
  if (error.response && error.response.status === 401 && !original._retry) {
    original._retry = true;
    try {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      isRefreshing = true;
      const state = store.getState();
      const refreshToken = state.auth.refreshToken;
      if (!refreshToken) throw new Error('No refresh token');
      const resp = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefresh } = resp.data;
      store.dispatch(setTokens({ accessToken, refreshToken: newRefresh || refreshToken }));
      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (e) {
      processQueue(e, null);
      store.dispatch(logout());
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
  return Promise.reject(error);
});

export default api;