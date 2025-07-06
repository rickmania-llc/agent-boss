import express, { Application } from 'express';
import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { Database } from './services/Database';
import { AgentManager } from './services/AgentManager';
import { WorkItemService } from './services/WorkItemService';
import { Logger } from './services/Logger';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import routes from './routes';

export async function createApp(): Promise<{ app: Application; server: Server }> {
  const app = express();
  const server = new Server(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  const logger = new Logger('App');

  // Initialize services
  const database = new Database();
  await database.initialize();

  const agentManager = new AgentManager(io);
  const workItemService = new WorkItemService(database, agentManager);

  // Middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(loggingMiddleware);

  // Attach services to request
  app.locals.services = {
    database,
    agentManager,
    workItemService,
    logger,
  };

  // Routes
  app.use('/api', routes);

  // Socket.io connection handling
  io.on('connection', socket => {
    logger.info('Client connected:', socket.id);

    socket.on('disconnect', () => {
      logger.info('Client disconnected:', socket.id);
    });
  });

  // Error handling middleware (must be last)
  app.use(errorMiddleware);

  return { app, server };
}
