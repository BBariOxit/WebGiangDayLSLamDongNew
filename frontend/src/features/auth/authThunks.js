import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../shared/services/apiClient';
import mockAuthService from '../../shared/services/mockAuthService';

// Toggle this to switch between mock and real API
const USE_MOCK_AUTH = true; // Set to false when backend is ready

export const registerThunk = createAsyncThunk('auth/register', async (form, { rejectWithValue }) => {
  try {
    if (USE_MOCK_AUTH) {
      const payload = {
        email: form.email,
        password: form.password,
        name: form.name || form.fullName,
        role: form.role || 'student',
      };
      const response = await mockAuthService.register(payload);
      return response.data;
    }
    
    // Real API call
    const payload = { email: form.email, password: form.password, name: form.name, role: form.role === 'teacher' ? 'Teacher' : 'Student' };
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const loginThunk = createAsyncThunk('auth/login', async (form, { rejectWithValue }) => {
  try {
    if (USE_MOCK_AUTH) {
      const response = await mockAuthService.login(form.email, form.password);
      return response.data;
    }
    
    // Real API call
    const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const googleLoginThunk = createAsyncThunk('auth/google', async ({ idToken }, { rejectWithValue }) => {
  try {
    if (USE_MOCK_AUTH) {
      const response = await mockAuthService.loginWithGoogle(idToken);
      return response.data;
    }
    
    // Real API call
    const { data } = await api.post('/auth/google', { idToken });
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const loadStoredSession = createAsyncThunk('auth/loadStored', async () => {
  const raw = localStorage.getItem('authState');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
});