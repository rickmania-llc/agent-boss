import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import { initializeDatabase } from './utils/app/dbConnection';
import LogHandler from './utils/app/logHandler';

const logger = new LogHandler('Server');
const port = process.env.PORT || 3001;

async function startServer() {
  try {
    await initializeDatabase();
    logger.info('Database connected');

    const server = createServer(app);

    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();