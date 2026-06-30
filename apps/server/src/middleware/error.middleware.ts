import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}

/**
 * Global Express Error Handling Middleware
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error via Winston
  logger.error(`${req.method} ${req.originalUrl} - Error ${statusCode}: ${message}`, {
    stack: err.stack,
    details: err.details,
    body: req.body,
    query: req.query,
    user: req.user,
  });

  const responseBody: Record<string, any> = {
    success: false,
    error: message,
  };

  if (err.details) {
    responseBody.details = err.details;
  }

  // Include stack trace only in development
  if (env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}
