// routes/index.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Lessons from '../pages/Lessons.jsx';
import Quizzes from '../pages/Quizzes.jsx';
import Analytics from '../pages/Analytics.jsx';

const NotFound = () => (
  <div style={{ 
    padding: 48, 
    textAlign: 'center',
    fontSize: 18,
    color: '#666'
  }}>
    <h2>404 - Không tìm thấy trang</h2>
    <p>Trang bạn đang tìm kiếm không tồn tại.</p>
  </div>
);

// Tạm thời trang Login/Register đơn giản
const Login = () => (
  <div style={{ padding: 48, textAlign: 'center' }}>
    <h2>Đăng nhập</h2>
    <p>Trang đăng nhập sẽ được phát triển sau</p>
  </div>
);

const Register = () => (
  <div style={{ padding: 48, textAlign: 'center' }}>
    <h2>Đăng ký</h2>
    <p>Trang đăng ký sẽ được phát triển sau</p>
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* Main App Routes with Layout */}
    <Route path="/" element={<AppLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="lessons" element={<Lessons />} />
      <Route path="quizzes" element={<Quizzes />} />
      <Route path="analytics" element={<Analytics />} />
    </Route>
    
    {/* Auth Routes (without layout) */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* 404 Route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
