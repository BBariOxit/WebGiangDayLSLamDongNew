import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { registerThunk, loginThunk, googleLoginThunk, loadStoredSession } from '../authThunks';
import { logout, clearError } from '../authSlice';

/**
 * Custom hook for authentication
 * Provides all auth-related functions and state
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, refreshToken, loading, error, hydrated } = useSelector(
    (state) => state.auth
  );

  // Load stored session on mount
  useEffect(() => {
    if (!hydrated) {
      dispatch(loadStoredSession());
    }
  }, [dispatch, hydrated]);

  // Login with email/password
  const login = async (credentials) => {
    try {
      const result = await dispatch(loginThunk(credentials)).unwrap();
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const result = await dispatch(googleLoginThunk()).unwrap();
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      const result = await dispatch(registerThunk(userData)).unwrap();
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Logout user
  const handleLogout = () => {
    dispatch(logout());
    return { success: true };
  };

  // Update user profile (if needed later)
  const updateUser = async (userData) => {
    // TODO: Implement updateUserThunk when backend is ready
    console.log('Update user:', userData);
    return { success: true };
  };

  return {
    // State
    user,
    token: accessToken,
    loading,
    error,
    hydrated,

    // Computed values
    isAuthenticated: !!user && !!accessToken,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',

    // Actions
    login,
    loginWithGoogle,
    register,
    logout: handleLogout,
    updateUser,
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth;
