import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosClient';

export const registerThunk = createAsyncThunk('auth/register', async (form, { rejectWithValue }) => {
  try {
    const payload = { email: form.email, password: form.password, name: form.name, role: form.role === 'teacher' ? 'Teacher' : 'Student' };
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const loginThunk = createAsyncThunk('auth/login', async (form, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const googleLoginThunk = createAsyncThunk('auth/google', async ({ idToken }, { rejectWithValue }) => {
  try {
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