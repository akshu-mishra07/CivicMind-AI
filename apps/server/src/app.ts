import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import apiRouter from './routes/index';

// Initialize Express app
const app = express();

// Apply security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to load cross-origin in dev
}));

// Apply CORS policy
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Apply gzip compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup HTTP request logging via Winston
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Serve local uploads folder statically (fallback for local dev)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route (unrestricted)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Mount main API router
app.use('/api', apiRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Bootstrap Server
async function startServer() {
  try {
    // 1. Connect database
    await connectDatabase();

    // 2. Listen on Port
    const port = env.PORT;
    const server = app.listen(port, () => {
      logger.info(`🚀 CivicMind AI server running in [${env.NODE_ENV}] mode on port [${port}]`);
    });

    // Graceful shutdown handling
    const closeServer = (signal: string) => {
      logger.info(`${signal} signal received. Closing HTTP server...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => closeServer('SIGTERM'));
    process.on('SIGINT', () => closeServer('SIGINT'));

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Server startup failed: ${msg}`);
    process.exit(1);
  }
}

// Catch Uncaught Exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception details:', error);
  process.exit(1);
});

// Catch Unhandled Rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at promise:', promise, 'reason:', reason);
});

startServer();
