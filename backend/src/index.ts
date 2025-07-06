import dotenv from 'dotenv';
import { createApp } from './app';
import { Logger } from './services/Logger';

dotenv.config();

const PORT = process.env.PORT || 3001;
const logger = new Logger('Server');

async function startServer() {
  try {
    const { app, server } = await createApp();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().then();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
