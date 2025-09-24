import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const LoadingScreen = () => (
  <Box 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}
  >
    <Fade in timeout={500}>
      <Box textAlign="center">
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'white',
            mb: 3,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          🎓 Đang tải hệ thống...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Giảng dạy Lịch sử Lâm Đồng
        </Typography>
      </Box>
    </Fade>
  </Box>
);

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have required role, redirect to home or show error
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
