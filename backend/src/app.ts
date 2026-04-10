import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './config';
import { requestId } from './middlewares/requestId';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — configured origin, NOT wildcard in production
  app.use(cors({ origin: config.corsOrigin, credentials: true }));

  // Parse JSON bodies
  app.use(express.json({ limit: '1mb' }));

  // Request ID for tracing
  app.use(requestId);

  // Structured request logging
  app.use(pinoHttp({ logger }));

  // Health endpoint — no auth required
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api', taskRoutes);

  // 404 catch-all
  app.use((_req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
