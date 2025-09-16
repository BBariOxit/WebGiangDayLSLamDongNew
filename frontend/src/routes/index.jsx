// routes/index.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../features/auth/pages/Home.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import MainLayout from '../layouts/MainLayout';

const NotFound = () => <div style={{ padding: 24 }}>Không tìm thấy trang</div>;

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <MainLayout>
          <Home />
        </MainLayout>
      }
    />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
