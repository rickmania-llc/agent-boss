import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export async function getConfig(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      environment: config.nodeEnv,
      port: config.port,
      version: '1.0.0',
    });
  } catch (error) {
    next(error);
  }
}
