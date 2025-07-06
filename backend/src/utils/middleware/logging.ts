import type { Request, Response, NextFunction } from 'express';
import LogHandler from '../app/logHandler';

const logger = new LogHandler('HTTP');

export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const { method, originalUrl } = req;
  const clientIp = req.header('X-Real-IP') || req.connection.remoteAddress;

  // Log request
  logger.info(`${method} ${originalUrl} - ${clientIp}`);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(`${method} ${originalUrl} ${statusCode} ${duration}ms - ${clientIp}`);
  });

  next();
}