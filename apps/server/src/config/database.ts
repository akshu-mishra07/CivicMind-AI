import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
};

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('📦 MongoDB connected successfully');
  });

  mongoose.connection.on('error', (error: Error) => {
    logger.error('❌ MongoDB connection error:', { error: error.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('🔄 MongoDB reconnected');
  });

  // Graceful shutdown handlers
  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Closing MongoDB connection...`);
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing MongoDB connection:', {
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  try {
    const connection = await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);

    logger.info(`📦 MongoDB connected to: ${connection.connection.host}`, {
      database: connection.connection.name,
      readyState: connection.connection.readyState,
    });

    return connection;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to connect to MongoDB: ${message}`);
    process.exit(1);
  }
}

export function getConnectionState(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };

  return states[mongoose.connection.readyState] || 'unknown';
}
