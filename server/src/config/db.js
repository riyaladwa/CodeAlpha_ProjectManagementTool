import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

export const connectDB = async () => {
  try {
    let mongoUri = env.MONGODB_URI;

    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/taskflow_ai') {
      try {
        // Try connecting to local mongodb first
        if (mongoUri) {
          const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
          console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
          return conn;
        }
      } catch (localErr) {
        console.log('[Database] Local MongoDB unreachable, launching in-memory database instance...');
      }

      // Boot in-memory MongoDB server for immediate seamless experience
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log(`[Database] In-memory MongoDB initialized at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    
    // As last resort, try memory server
    if (!memoryServer) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const fallbackUri = memoryServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`[Database] Connected to fallback In-Memory MongoDB: ${conn.connection.host}`);
        return conn;
      } catch (memErr) {
        console.error(`[Database Error] Fallback memory server failed: ${memErr.message}`);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (error) {
    console.error('[Database Error] Disconnection error:', error);
  }
};
