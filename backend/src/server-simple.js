import dotenv from 'dotenv';
dotenv.config(); // Load environment variables FIRST

import express from 'express';
import cors from 'cors';
import testRoutes from './routes/test.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'WebGiangDay API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/test/health',
      dbTest: '/api/test/db',
      users: '/api/test/users',
      lessons: '/api/test/lessons',
      tables: '/api/test/tables',
    },
    timestamp: new Date().toISOString(),
  });
});

// Test routes
app.use('/api/test', testRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('📊 Test Endpoints:');
  console.log(`   → http://localhost:${PORT}/`);
  console.log(`   → http://localhost:${PORT}/api/test/health`);
  console.log(`   → http://localhost:${PORT}/api/test/db`);
  console.log(`   → http://localhost:${PORT}/api/test/users`);
  console.log(`   → http://localhost:${PORT}/api/test/lessons`);
  console.log(`   → http://localhost:${PORT}/api/test/tables`);
  console.log('='.repeat(60));
  console.log('💡 pgAdmin: http://localhost:5050');
  console.log('   Login: admin@lamdong.edu.vn / admin123');
  console.log('='.repeat(60));
});

export default app;
