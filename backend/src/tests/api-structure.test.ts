import request from 'supertest';
import { Server } from '../server.js';
import { DatabaseManager } from '../config/database.js';

describe('Task 1.2: Backend API Structure', () => {
  let server: Server;
  let app: any;

  beforeAll(async () => {
    // Initialize server without starting it (to avoid port conflicts)
    server = new Server();
    app = server.getApp();
    
    // Connect to database manually for testing
    const dbManager = DatabaseManager.getInstance();
    try {
      await dbManager.connect();
    } catch (error) {
      // Database may already be connected, ignore error
      console.log('Database connection skipped (may already be connected)');
    }
  });

  afterAll(async () => {
    // Close database connection
    const dbManager = DatabaseManager.getInstance();
    try {
      await dbManager.disconnect();
    } catch (error) {
      // Ignore disconnection errors
      console.log('Database disconnection skipped');
    }
  });

  describe('Server Configuration', () => {
    it('should have Express app initialized', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should respond to root endpoint', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('English Bridge API Server');
    });

    it('should have health check endpoint', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is healthy');
    });

    it('should have database status endpoint', async () => {
      const response = await request(app).get('/db-status');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('Middleware Configuration', () => {
    it('should parse JSON bodies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'test' })
        .set('Content-Type', 'application/json');
      
      // Should not get 400 for parsing error, but for invalid credentials (401) or other
      expect(response.status).not.toBe(415); // Not unsupported media type
    });

    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:5173');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should apply security headers', async () => {
      const response = await request(app).get('/');
      
      // Helmet should add security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('API Routes Structure', () => {
    it('should have /api root endpoint', async () => {
      const response = await request(app).get('/api');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('English Bridge API is running');
    });

    it('should have API documentation endpoint', async () => {
      const response = await request(app).get('/api/docs');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('endpoints');
      expect(response.body.data.endpoints).toHaveProperty('auth');
      expect(response.body.data.endpoints).toHaveProperty('progress');
      expect(response.body.data.endpoints).toHaveProperty('lessons');
    });

    describe('Authentication Routes', () => {
      it('should have POST /api/auth/register/step1 endpoint', async () => {
        const response = await request(app)
          .post('/api/auth/register/step1')
          .send({});
        
        // Should respond (not 404), even if validation fails
        expect(response.status).not.toBe(404);
      });

      it('should have POST /api/auth/register/step2 endpoint', async () => {
        const response = await request(app)
          .post('/api/auth/register/step2')
          .send({});
        
        // Should respond (not 404), even if validation fails
        expect(response.status).not.toBe(404);
      });

      it('should have POST /api/auth/login endpoint', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({});
        
        // Should respond (not 404), even if validation fails
        expect(response.status).not.toBe(404);
      });

      it('should have POST /api/auth/logout endpoint', async () => {
        const response = await request(app)
          .post('/api/auth/logout');
        
        // Should respond (not 404)
        expect(response.status).not.toBe(404);
      });
    });

    describe('Progress Routes', () => {
      it('should have GET /api/progress endpoint', async () => {
        const response = await request(app)
          .get('/api/progress');
        
        // Should respond (not 404), may be 401 unauthorized
        expect(response.status).not.toBe(404);
      });

      it('should have PUT /api/progress endpoint', async () => {
        const response = await request(app)
          .put('/api/progress')
          .send({});
        
        // Should respond (not 404), may be 401 unauthorized
        expect(response.status).not.toBe(404);
      });
    });

    describe('Lesson Routes', () => {
      it('should have GET /api/lessons/courses endpoint', async () => {
        const response = await request(app)
          .get('/api/lessons/courses');
        
        // Should respond (not 404), may be 401 unauthorized
        expect(response.status).not.toBe(404);
      });

      it('should have GET /api/lessons/:levelId/:courseId/:lessonNumber endpoint', async () => {
        const response = await request(app)
          .get('/api/lessons/1/1/1');
        
        // Should respond (not 404), may be 401 unauthorized
        expect(response.status).not.toBe(404);
      });

      it('should have POST /api/lessons/:levelId/:courseId/:lessonNumber/complete endpoint', async () => {
        const response = await request(app)
          .post('/api/lessons/1/1/1/complete')
          .send({});
        
        // Should respond (not 404), may be 401 unauthorized
        expect(response.status).not.toBe(404);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return proper error format', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json');
      
      // Should handle the error gracefully
      expect(response.status).toBe(400);
    });
  });

  describe('Response Format', () => {
    it('should return consistent API response format', async () => {
      const response = await request(app).get('/api');
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
    });

    it('should include data field when appropriate', async () => {
      const response = await request(app).get('/api/docs');
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Database Integration', () => {
    it('should have database manager instance', async () => {
      const dbManager = DatabaseManager.getInstance();
      expect(dbManager).toBeDefined();
    });

    it('should report database status', async () => {
      const status = await server.getDatabaseStatus();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('message');
    });
  });
});
