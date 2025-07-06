import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { loggingMiddleware } from './utils/middleware/logging';
import { errorMiddleware, notFoundMiddleware } from './utils/middleware/errorHandler';
import LogHandler from './utils/app/logHandler';

const logger = new LogHandler('App');
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(loggingMiddleware);

// Trust proxy
app.set('trust proxy', true);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes will be added here
// app.use('/api', api);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

logger.info('Express app configured');

export default app;