import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import authRoutes from './modules/auth/routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use(errorHandler);

export default app;
