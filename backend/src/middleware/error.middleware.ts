import { Request, Response, NextFunction } from 'express';
import { Logger } from '../services/Logger';

const logger = new Logger('ErrorMiddleware');

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  logger.error('Request error:', err);

  const status = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(status).json({
    error: {
      message: err.message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
