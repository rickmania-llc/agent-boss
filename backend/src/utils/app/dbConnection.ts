import { DataSource } from 'typeorm';
import LogHandler from './logHandler';

const logger = new LogHandler('Database');

let dataSource: DataSource | null = null;

export async function initializeDatabase(): Promise<DataSource> {
  try {
    // For now, we'll use SQLite
    dataSource = new DataSource({
      type: 'sqlite',
      database: process.env.DATABASE_URL || ':memory:',
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      entities: [],
      migrations: [],
    });

    await dataSource.initialize();
    logger.info('Database connection established');
    return dataSource;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export function getDataSource(): DataSource {
  if (!dataSource) {
    throw new Error('Database connection not initialized');
  }
  return dataSource;
}