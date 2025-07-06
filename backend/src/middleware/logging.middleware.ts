import { Request, Response, NextFunction } from 'express';
import { Logger } from '../services/Logger';

const logger = new Logger('HTTP');

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}
