import type { Request, Response, NextFunction } from 'express';
import LogHandler from '../app/logHandler';

const logger = new LogHandler('ErrorMiddleware');

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new AppError(404, `Route ${req.originalUrl} not found`);
  next(error);
}

export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  logger.error('Request error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode
      }
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: err.message
      }
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        message: 'Unauthorized access'
      }
    });
  }

  // Default error
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(status).json({
    error: {
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.message 
      })
    }
  });
}