import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import authRoutes from './modules/auth/routes/authRoutes.js';
import lessonRoutes from './modules/lessons/routes/lessonRoutes.js';
import lessonEngagementRoutes from './modules/lessons/routes/lessonEngagementRoutes.js';
import quizRoutes from './modules/quizzes/routes/quizRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './modules/uploads/routes/uploadRoutes.js';
import analyticsRoutes from './modules/analytics/routes/analyticsRoutes.js';
import notificationsRoutes from './modules/notifications/routes/notificationsRoutes.js';
import { ok, fail } from './utils/response.js';

const app = express();
// Allow cross-origin usage of static assets like /uploads when frontend runs on different origin
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));
const origins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*';
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  }
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/health', (req, res) => ok(res, { status: 'ok', timestamp: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/lessons', lessonEngagementRoutes); // nested engagement endpoints
app.use('/api/quizzes', quizRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req, res) => fail(res, 404, 'Endpoint not found', 'NOT_FOUND', { path: req.path }));

// Error handler
app.use(errorHandler);

export default app;
