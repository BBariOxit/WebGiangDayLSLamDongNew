import apiClient from './apiClient';

// Auth service - connects to backend API
const authService = {
  // Register new user
  async register({ email, password, name, role = 'Student' }) {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name,
        role
      });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        // Store tokens
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, accessToken };
      }
      
      return { success: false, error: response.data.error || 'Registration failed' };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Registration failed';
      return { success: false, error: errorMsg };
    }
  },

  // Login with email/password
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        // Store tokens and user
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, accessToken };
      }
      
      return { success: false, error: response.data.error || 'Login failed' };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Login failed';
      return { success: false, error: errorMsg };
    }
  },

  // Login with Google OAuth
  async loginWithGoogle(idToken) {
    try {
      const response = await apiClient.post('/auth/google', {
        idToken
      });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, accessToken };
      }
      
      return { success: false, error: response.data.error || 'Google login failed' };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Google login failed';
      return { success: false, error: errorMsg };
    }
  },

  // Refresh access token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { success: false, error: 'No refresh token' };
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken
      });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, accessToken };
      }
      
      return { success: false, error: 'Token refresh failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    
    return { success: true };
  },

  // Get current user from /me endpoint
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, error: 'Failed to get user' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user from localStorage
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};

export default authService;
