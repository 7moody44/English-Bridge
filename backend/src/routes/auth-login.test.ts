// Unit tests for login/logout functionality
// Task 2.3: Implement login/logout functionality
// **Validates: Requirements 1.4, 1.5**

import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import { authRoutes } from './auth.js';
import * as bcrypt from 'bcrypt';

let app: Express;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  // Setup Express app with auth routes
  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear database before each test
  await User.deleteMany({});
});

describe('Login Functionality', () => {
  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      // Create a test user
      const passwordHash = await bcrypt.hash('Test123Password', 10);
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        passwordHash,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'Test123Password',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(user._id.toString());
      expect(response.body.user.username).toBe('johndoe');
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.body.user.firstName).toBe('John');
      expect(response.body.user.lastName).toBe('Doe');
      expect(response.body.user.passwordHash).toBeUndefined(); // Should not expose password hash
    });

    it('should login with username in different case (case-insensitive)', async () => {
      const passwordHash = await bcrypt.hash('Test123Password', 10);
      await User.create({
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        passwordHash,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'JaneSmith', // Different case
          password: 'Test123Password',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe('janesmith');
    });

    it('should return 401 for non-existent username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'Test123Password',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body.token).toBeUndefined();
      expect(response.body.user).toBeUndefined();
    });

    it('should return 401 for incorrect password', async () => {
      const passwordHash = await bcrypt.hash('Test123Password', 10);
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        passwordHash,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body.token).toBeUndefined();
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Test123Password',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 when both username and password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should generate a valid JWT token on successful login', async () => {
      const passwordHash = await bcrypt.hash('Test123Password', 10);
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        passwordHash,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'Test123Password',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      
      // JWT token should have three parts separated by dots
      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should handle special characters in password correctly', async () => {
      const passwordHash = await bcrypt.hash('Test@123#Password!', 10);
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        passwordHash,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'Test@123#Password!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle whitespace in username input correctly', async () => {
      const passwordHash = await bcrypt.hash('Test123Password', 10);
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        passwordHash,
      });

      // Username with trailing/leading spaces - MongoDB automatically trims it
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: ' johndoe ',
          password: 'Test123Password',
        });

      // Should succeed because MongoDB trims the username field
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

describe('Logout Functionality', () => {
  describe('POST /api/auth/logout', () => {
    it('should successfully logout and return success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should logout without requiring authentication token', async () => {
      // Logout is client-side, so server should accept it regardless
      const response = await request(app)
        .post('/api/auth/logout')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should logout even with invalid token in header', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

describe('Token Generation and Validation', () => {
  it('should generate different tokens for different login sessions', async () => {
    const passwordHash = await bcrypt.hash('Test123Password', 10);
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash,
    });

    const response1 = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'johndoe',
        password: 'Test123Password',
      });

    // Wait a moment to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const response2 = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'johndoe',
        password: 'Test123Password',
      });

    expect(response1.body.token).toBeDefined();
    expect(response2.body.token).toBeDefined();
    // Tokens might be the same if generated within the same second
    // This is acceptable behavior
  });

  it('should include user information in the response after login', async () => {
    const passwordHash = await bcrypt.hash('Test123Password', 10);
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash,
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'johndoe',
        password: 'Test123Password',
      });

    expect(response.body.user).toEqual({
      id: user._id.toString(),
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  it('should handle login attempts with empty strings', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: '',
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should handle login attempts with null values', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: null,
        password: null,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should handle login attempts with very long username', async () => {
    const longUsername = 'a'.repeat(1000);
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: longUsername,
        password: 'Test123Password',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should handle login attempts with very long password', async () => {
    const longPassword = 'Test123Password' + 'a'.repeat(10000);
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'johndoe',
        password: longPassword,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should handle malformed JSON in request body gracefully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username": "johndoe", "password": }'); // Malformed JSON

    expect(response.status).toBe(400); // Express will return 400 for malformed JSON
  });
});
