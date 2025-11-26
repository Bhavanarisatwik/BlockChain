import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { EventIndexer } from './indexer';
import { createApiServer } from './api';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const {
  MONGODB_URI = 'mongodb://localhost:27017/supply-chain',
  RPC_URL = 'http://127.0.0.1:8545',
  CONTRACT_ADDRESS,
  PORT = '4000',
  START_BLOCK = '0',
  BATCH_SIZE = '1000',
  POLLING_INTERVAL = '5000',
} = process.env;

async function main() {
  // Validate required environment variables
  if (!CONTRACT_ADDRESS) {
    logger.error('CONTRACT_ADDRESS is required');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    logger.info(`Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Create and start event indexer
    const indexer = new EventIndexer(
      RPC_URL,
      CONTRACT_ADDRESS,
      parseInt(POLLING_INTERVAL),
      parseInt(BATCH_SIZE)
    );

    // Start indexer
    indexer.start(parseInt(START_BLOCK));

    // Create and start API server
    const app = createApiServer();
    const port = parseInt(PORT);
    
    app.listen(port, () => {
      logger.info(`API server running on http://localhost:${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down...');
      indexer.stop();
      await mongoose.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error('Failed to start:', error);
    process.exit(1);
  }
}

main();
