import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create Express App
    const app = createApp();

    // 3. Listen on Port
    const server = app.listen(env.PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 TaskFlow AI Backend running on port ${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 API Base: http://localhost:${env.PORT}/api`);
      console.log(`🩺 Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`=============================================`);
    });

    // Handle Unhandled Rejections & Uncaught Exceptions
    process.on('unhandledRejection', (err) => {
      console.error('[Unhandled Rejection]', err);
    });

    process.on('uncaughtException', (err) => {
      console.error('[Uncaught Exception]', err);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
