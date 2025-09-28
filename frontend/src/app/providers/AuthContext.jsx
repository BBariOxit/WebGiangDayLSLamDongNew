import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const authToken = localStorage.getItem('authToken');
        
        if (savedUser && authToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    // Simulate network delay for realistic loading
    setTimeout(checkAuthStatus, 500);
  }, []);

  const login = async (userData, token = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate token if not provided
      const authToken = token || `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add additional user properties
      const enrichedUser = {
        ...userData,
        id: userData.id || Date.now(),
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=667eea&color=fff&size=128`,
        loginTime: new Date().toISOString(),
        isActive: true,
      };
      
      setUser(enrichedUser);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      localStorage.setItem('authToken', authToken);
      
      return { success: true, user: enrichedUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock Google user data
      const googleUser = {
        id: `google_${Date.now()}`,
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'student',
        provider: 'google',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=ea4335&color=fff&size=128',
        verified: true,
      };
      
      return await login(googleUser, `google_token_${Date.now()}`);
    } catch (error) {
      setError('Google login failed');
      return { success: false, error: 'Google login failed' };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Check if email already exists (mock check)
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (existingUsers.find(u => u.email === userData.email)) {
        throw new Error('Email already exists');
      }
      
      // Create new user
      const newUser = {
        ...userData,
        id: Date.now(),
        role: userData.role || 'student',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=764ba2&color=fff&size=128`,
        createdAt: new Date().toISOString(),
        verified: false,
      };
      
      // Save to mock database
      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      return await login(newUser);
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      setError(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const updateProgress = (lessonId, progress) => {
    // Mock function to update lesson progress
    console.log(`Updated lesson ${lessonId} progress to ${progress}%`);
    // In real app, this would call an API to save progress
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    clearError,
    updateProgress,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
