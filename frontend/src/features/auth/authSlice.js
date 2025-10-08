// features/auth/authSlice.js (refactored for thunks)
import { createSlice } from '@reduxjs/toolkit';
import { registerThunk, loginThunk, googleLoginThunk, loadStoredSession } from './authThunks';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  hydrated: false,
};

function persist(state) {
  const minimal = { user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken };
  localStorage.setItem('authState', JSON.stringify(minimal));
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action) => {
      if (action.payload.accessToken) state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      persist(state);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const fulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload || 'Request failed'; };

    builder
      .addCase(registerThunk.pending, pending)
      .addCase(registerThunk.fulfilled, fulfilled)
      .addCase(registerThunk.rejected, rejected)
      .addCase(loginThunk.pending, pending)
      .addCase(loginThunk.fulfilled, fulfilled)
      .addCase(loginThunk.rejected, rejected)
      .addCase(googleLoginThunk.pending, pending)
      .addCase(googleLoginThunk.fulfilled, fulfilled)
      .addCase(googleLoginThunk.rejected, rejected)
      .addCase(loadStoredSession.fulfilled, (state, action) => {
        state.hydrated = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      });
  }
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
