import mongoose from 'mongoose';
import { config } from './config';
import { seedLessons } from './seedData';
import { User, UserProgress, Lesson } from '../models/index';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private readonly maxRetries: number = 5;
  private readonly retryDelay: number = 5000; // 5 seconds

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      await mongoose.connect(config.mongodbUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      this.retryCount = 0;
      console.log('✅ MongoDB connected successfully');

      // Initialize database (create indexes and seed data)
      await this.initializeDatabase();

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 MongoDB disconnected');
        this.isConnected = false;
        this.handleReconnection();
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
        this.retryCount = 0;
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      this.handleReconnection();
    }
  }
  private async initializeDatabase(): Promise<void> {
    try {
      console.log('🔧 Initializing database...');

      // Create indexes (skip if they already exist)
      console.log('📑 Creating database indexes...');

      try {
        await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
        await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        console.log('  ✅ User indexes created');
      } catch (error: any) {
        if (error.code === 86 || error.codeName === 'IndexKeySpecsConflict') {
          console.log('  ℹ️  User indexes already exist');
        } else {
          throw error;
        }
      }

      try {
        await UserProgress.collection.createIndex({ userId: 1 }, { unique: true, sparse: true });
        await UserProgress.collection.createIndex({ userId: 1, currentLevel: 1 });
        console.log('  ✅ UserProgress indexes created');
      } catch (error: any) {
        if (error.code === 86 || error.codeName === 'IndexKeySpecsConflict') {
          console.log('  ℹ️  UserProgress indexes already exist');
        } else {
          throw error;
        }
      }

      try {
        await Lesson.collection.createIndex(
          { levelId: 1, lessonNumber: 1 },
          { unique: true, sparse: true }
        );
        await Lesson.collection.createIndex({ levelId: 1 });
        console.log('  ✅ Lesson indexes created');
      } catch (error: any) {
        if (error.code === 86 || error.codeName === 'IndexKeySpecsConflict') {
          console.log('  ℹ️  Lesson indexes already exist');
        } else {
          throw error;
        }
      }

      // Seed lesson data
      console.log('📚 Seeding lesson data...');
      await seedLessons();

      console.log('✅ Database initialization complete');

    } catch (error) {
      console.error('❌ Error initializing database:', error);
      // Don't throw - initialization errors shouldn't prevent server startup
    }
  }

  private async handleReconnection(): Promise<void> {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Attempting to reconnect to MongoDB (${this.retryCount}/${this.maxRetries})...`);
      
      setTimeout(async () => {
        try {
          await this.connect();
        } catch (error) {
          console.error(`❌ Reconnection attempt ${this.retryCount} failed:`, error);
        }
      }, this.retryDelay * this.retryCount); // Exponential backoff
    } else {
      console.error('❌ Max reconnection attempts reached. Please check your database connection.');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📡 MongoDB disconnected');
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (!this.getConnectionStatus()) {
        return { status: 'error', message: 'Database not connected' };
      }

      // Simple ping to check database responsiveness
      const db = mongoose.connection.db;
      if (!db) {
        return { status: 'error', message: 'Database connection is not available' };
      }
      await db.admin().ping();
      return { status: 'healthy', message: 'Database connection is healthy' };
    } catch (error) {
      return { status: 'error', message: `Database health check failed: ${error}` };
    }
  }

  /**
   * Verify collections are properly created
   */
  public async verifyCollections(): Promise<{ status: string; collections: Record<string, number> }> {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        return {
          status: 'error',
          collections: {},
        };
      }

      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((col) => col.name);

      const stats: Record<string, number> = {};
      for (const modelName of ['users', 'userprogress', 'lessons']) {
        if (collectionNames.includes(modelName)) {
          const count = await db.collection(modelName).countDocuments();
          stats[modelName] = count;
        }
      }

      return {
        status: 'success',
        collections: stats,
      };
    } catch (error) {
      return {
        status: 'error',
        collections: {},
      };
    }
  }
}