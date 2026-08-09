import express from 'express';
import { config } from './config/config.js';
import { DatabaseManager } from './config/database.js';
import { corsMiddleware } from './middleware/cors.js';
import { securityMiddleware, compressionMiddleware, requestLogger, healthCheck } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/index.js';

class Server {
  private app: express.Application;
  private dbManager: DatabaseManager;

  constructor() {
    this.app = express();
    this.dbManager = DatabaseManager.getInstance();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Health check middleware (before other middleware)
    this.app.use(healthCheck);

    // Security middleware
    this.app.use(securityMiddleware);
    this.app.use(compressionMiddleware);

    // CORS middleware
    this.app.use(corsMiddleware);

    // Body parsing middleware with error handling
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true,
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Handle JSON parsing errors
    this.app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({
          success: false,
          message: 'Invalid JSON',
          error: 'Request body contains malformed JSON',
        });
        return;
      }
      next(err);
    });

    // Request logging middleware
    if (config.nodeEnv === 'development') {
      this.app.use(requestLogger);
    }

    // Trust proxy (important for rate limiting and getting real IP addresses)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', apiRoutes);

    // Database status endpoint
    this.app.get('/db-status', async (req, res) => {
      try {
        const health = await this.dbManager.healthCheck();
        const collections = await this.dbManager.verifyCollections();
        res.json({
          success: health.status === 'healthy',
          database: health,
          collections: collections.collections,
        });
      } catch {
        res.status(500).json({
          success: false,
          error: 'Failed to check database status',
        });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'English Bridge API Server',
        data: {
          version: '1.0.0',
          environment: config.nodeEnv,
          api: '/api',
          health: '/health',
          dbStatus: '/db-status',
          documentation: '/api/docs',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      console.log('🔌 Connecting to database...');
      await this.dbManager.connect();

      // Start server
      const server = this.app.listen(config.port, () => {
        console.log(`🚀 Server started successfully!`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`🌐 Server URL: http://localhost:${config.port}`);
        console.log(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
        console.log(`❤️  Health Check: http://localhost:${config.port}/health`);
        console.log(`🔗 API Base URL: http://localhost:${config.port}/api`);
      });

      // Graceful shutdown handling
      const gracefulShutdown = async (signal: string) => {
        console.log(`\\n🛑 Received ${signal}. Starting graceful shutdown...`);
        
        server.close(async () => {
          console.log('📡 HTTP server closed');
          
          try {
            await this.dbManager.disconnect();
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
          } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
          }
        });

        // Force close after 10 seconds
        setTimeout(() => {
          console.error('❌ Forceful shutdown after timeout');
          process.exit(1);
        }, 10000);
      };

      // Handle shutdown signals
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      // Handle uncaught exceptions
      process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async getDatabaseStatus(): Promise<{ status: string; message: string }> {
    return this.dbManager.healthCheck();
  }
}

// Start server if this file is run directly (and not in test environment)
if (process.env.NODE_ENV !== 'test') {
  const server = new Server();
  server.start().catch((error) => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  });
}

export { Server };