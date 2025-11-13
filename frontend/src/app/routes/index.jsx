import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

// Import pages
import Home from '../../pages/Home';
import MyLearning from '../../pages/MyLearning';
import Lessons from '../../pages/Lessons';
import LessonDetail from '../../pages/LessonDetail';
// Legacy Quiz page kept for lesson-tied quizzes; new quiz hub below
import QuizzesIndex from '../../pages/quizzes/QuizzesIndex';
import TakeQuiz from '../../pages/quizzes/TakeQuiz';
import QuizResults from '../../pages/quizzes/QuizResults';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import AppLayout from '../../shared/layouts/AppLayout';
import TeacherQuizzes from '../../pages/teacher/TeacherQuizzes';
import AdminQuizzes from '../../pages/admin/AdminQuizzes';
import AdminCreateQuiz from '../../pages/admin/AdminCreateQuiz';
import Analytics from '../../pages/Analytics';

// Management pages
import LessonsManagement from '../../features/admin/pages/LessonsManagement';
import QuizzesManagement from '../../features/admin/pages/QuizzesManagement';
import TeacherLessons from '../../pages/teacher/TeacherLessons';
import MyQuizzes from '../../features/teacher/pages/MyQuizzes';

import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// 404 Component
const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      p: 3,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Không tìm thấy trang
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/')}
        sx={{
          bgcolor: 'white',
          color: '#667eea',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.9)'
          }
        }}
      >
        Về trang chủ
      </Button>
    </Box>
  );
};

const AppRoutes = () => {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          p: 3,
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: 'white',
            mb: 3,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Đang khởi tạo ứng dụng...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Vui lòng chờ trong giây lát
        </Typography>
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes without layout */}
      <Route path="/" element={<Home />} />
      <Route path="/lesson/:slug" element={<LessonDetail />} />
      
      {/* Auth routes - redirect to my-learning if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/my-learning" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/my-learning" replace /> : <Register />} 
      />
      
      {/* Routes with AppLayout */}
      <Route element={<AppLayout />}>
  {/* Public route with layout */}
  <Route path="/lessons" element={<Lessons />} />
  <Route path="/lessons/:sectionId" element={<Lessons />} />
        
        {/* Quizzes hub (requires auth) */}
        <Route 
          path="/quizzes" 
          element={
            <ProtectedRoute>
              <QuizzesIndex />
            </ProtectedRoute>
          } 
        />

        {/* Teacher routes */}
        <Route 
          path="/teacher/lessons" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherLessons />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/teacher/quizzes" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <MyQuizzes />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route 
          path="/admin/lessons" 
          element={
            <ProtectedRoute requiredRole="admin">
              <LessonsManagement />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/quizzes" 
          element={
            <ProtectedRoute requiredRole="admin">
              <QuizzesManagement />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/create-quiz" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminCreateQuiz />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/quizzes/take/:id" 
          element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quizzes/results/:attemptId" 
          element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes with layout */}
        <Route 
          path="/my-learning" 
          element={
            <ProtectedRoute>
              <MyLearning />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        
        {/* Legacy single lesson quiz path remains for backward compatibility */}
      </Route>
      
      {/* Legacy route redirect */}
      <Route path="/lessons/:id" element={<Navigate to="/lesson/not-found" replace />} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
