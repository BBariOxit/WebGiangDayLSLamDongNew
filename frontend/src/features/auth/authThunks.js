import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../shared/services/authService';

// Now using real backend API via authService

export const registerThunk = createAsyncThunk('auth/register', async (form, { rejectWithValue }) => {
  try {
    const payload = {
      email: form.email,
      password: form.password,
      name: form.name || form.fullName,
      role: form.role || 'Student',
    };
    
    const result = await authService.register(payload);
    
    if (result.success) {
      return result; // { success: true, user, accessToken }
    } else {
      return rejectWithValue(result.error || 'Registration failed');
    }
  } catch (e) {
    return rejectWithValue(e.message || 'Registration failed');
  }
});

export const loginThunk = createAsyncThunk('auth/login', async (form, { rejectWithValue }) => {
  try {
    const result = await authService.login({
      email: form.email,
      password: form.password
    });
    
    if (result.success) {
      return result; // { success: true, user, accessToken }
    } else {
      return rejectWithValue(result.error || 'Login failed');
    }
  } catch (e) {
    return rejectWithValue(e.message || 'Login failed');
  }
});

export const googleLoginThunk = createAsyncThunk('auth/google', async ({ idToken }, { rejectWithValue }) => {
  try {
    const result = await authService.loginWithGoogle(idToken);
    
    if (result.success) {
      return result; // { success: true, user, accessToken }
    } else {
      return rejectWithValue(result.error || 'Google login failed');
    }
  } catch (e) {
    return rejectWithValue(e.message || 'Google login failed');
  }
});

export const loadStoredSession = createAsyncThunk('auth/loadStored', async () => {
  const raw = localStorage.getItem('authState');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
});