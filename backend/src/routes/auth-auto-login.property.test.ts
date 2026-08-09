// Feature: english-bridge-app, Property 3: User Creation and Auto-Login
// **Validates: Requirements 1.4**
// For any valid registration data, completing registration should create a user account
// and automatically establish an authenticated session.

import * as fc from 'fast-check';
import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { authRoutes } from './auth.js';
import jwt from 'jsonwebtoken';

let app: Express;
let mongoServer: MongoMemoryServer;

// Mock JWT secret for testing
const TEST_JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';

beforeAll(async () => {
  // Set JWT secret for testing
  process.env.JWT_SECRET = TEST_JWT_SECRET;

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
  await UserProgress.deleteMany({});
});

// Arbitraries for generating valid registration data
// Names must be 2-50 chars AFTER trimming, so generate non-space characters
const validFirstNameArb = fc.stringMatching(/^[a-zA-Z\-']{2,50}$/).map(s => s.trim()).filter(s => s.length >= 2);
const validLastNameArb = fc.stringMatching(/^[a-zA-Z\-']{2,50}$/).map(s => s.trim()).filter(s => s.length >= 2);
const validUsernameArb = fc.stringMatching(/^[a-z0-9_-]{3,30}$/);
const validEmailArb = fc.emailAddress();
const validPasswordArb = fc
  .string({ minLength: 8, maxLength: 50 })
  .filter(s => /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s) && s.trim().length >= 8);

const validRegistrationDataArb = fc.record({
  firstName: validFirstNameArb,
  lastName: validLastNameArb,
  username: validUsernameArb,
  email: validEmailArb,
  password: validPasswordArb,
});

describe('Property 3: User Creation and Auto-Login', () => {
  describe('Registration creates user account', () => {
    it('should create a user account in the database for any valid registration data', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          const response = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          // User account should be created
          const user = await User.findOne({ username: registrationData.username.toLowerCase() });
          expect(user).not.toBeNull();
          expect(user?.firstName).toBe(registrationData.firstName.trim());
          expect(user?.lastName).toBe(registrationData.lastName.trim());
          expect(user?.username).toBe(registrationData.username.toLowerCase());
          expect(user?.email).toBe(registrationData.email.toLowerCase());
        }),
        { numRuns: 20 } // Reduced runs since DB operations are expensive
      );
    }, 120000);

    it('should create a UserProgress record for any valid registration', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          const response = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          // UserProgress should be created
          const user = await User.findOne({ username: registrationData.username.toLowerCase() });
          expect(user).not.toBeNull();

          const userProgress = await UserProgress.findOne({ userId: user!._id });
          expect(userProgress).not.toBeNull();
          expect(userProgress?.currentLevel).toBe(1);
          expect(userProgress?.currentCourse).toBe(1);
          expect(userProgress?.currentLesson).toBe(1);
          expect(userProgress?.completedLessons).toEqual([]);
          expect(userProgress?.completedCourses).toEqual([]);
          expect(userProgress?.completedLevels).toEqual([]);
          expect(userProgress?.totalScore).toBe(0);
        }),
        { numRuns: 20 }
      );
    }, 120000);
  });

  describe('Registration automatically establishes authenticated session', () => {
    it('should return a JWT token for any valid registration', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          const response = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          // Token should be returned
          expect(response.body.token).toBeDefined();
          expect(typeof response.body.token).toBe('string');
          expect(response.body.token.length).toBeGreaterThan(0);

          // Token should have three parts (JWT format)
          const tokenParts = response.body.token.split('.');
          expect(tokenParts).toHaveLength(3);
        }),
        { numRuns: 15 }
      );
    });

    it('should return a valid JWT token that can be decoded', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          const response = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          expect(response.body.success).toBe(true);
          const token = response.body.token;

          // Decode the token
          const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;

          // Token should contain user information
          expect(decoded.userId).toBeDefined();
          expect(decoded.username).toBe(registrationData.username.toLowerCase());
          expect(decoded.email).toBe(registrationData.email.toLowerCase());
          expect(decoded.exp).toBeDefined(); // Expiration time
          expect(decoded.iat).toBeDefined(); // Issued at time
        }),
        { numRuns: 15 }
      );
    });

    it('should return user data along with token for any valid registration', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          const response = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          // User data should be returned
          expect(response.body.user).toBeDefined();
          expect(response.body.user.id).toBeDefined();
          expect(response.body.user.firstName).toBe(registrationData.firstName.trim());
          expect(response.body.user.lastName).toBe(registrationData.lastName.trim());
          expect(response.body.user.username).toBe(registrationData.username.toLowerCase());
          expect(response.body.user.email).toBe(registrationData.email.toLowerCase());
          expect(response.body.user.passwordHash).toBeUndefined(); // Should not expose password
        }),
        { numRuns: 15 }
      );
    });

    it('should return 201 status code for successful registration', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          const response = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          // Should return 201 Created
          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);
          expect(response.body.message).toBe('User registered successfully');
        }),
        { numRuns: 15 }
      );
    });
  });

  describe('Auto-login after registration allows immediate access', () => {
    it('should allow immediate login with returned credentials after registration', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          // Register the user
          const registerResponse = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          expect(registerResponse.status).toBe(201);
          const registrationToken = registerResponse.body.token;

          // Should be able to login immediately with the same credentials
          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              username: registrationData.username,
              password: registrationData.password,
            });

          expect(loginResponse.status).toBe(200);
          expect(loginResponse.body.success).toBe(true);
          expect(loginResponse.body.token).toBeDefined();
          
          // Both tokens should decode to the same user
          const registrationDecoded = jwt.verify(registrationToken, TEST_JWT_SECRET) as any;
          const loginDecoded = jwt.verify(loginResponse.body.token, TEST_JWT_SECRET) as any;
          
          expect(registrationDecoded.userId).toBe(loginDecoded.userId);
          expect(registrationDecoded.username).toBe(loginDecoded.username);
          expect(registrationDecoded.email).toBe(loginDecoded.email);
        }),
        { numRuns: 10 }
      );
    });
  });

  describe('Registration consistency properties', () => {
    it('should normalize username and email to lowercase consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          validFirstNameArb,
          validLastNameArb,
          fc.stringMatching(/^[A-Za-z0-9_-]{3,30}$/), // Mixed case username
          fc.emailAddress(), // Email may have uppercase
          validPasswordArb,
          async (firstName, lastName, username, email, password) => {
            // Clear database for this property run
            await User.deleteMany({});
            await UserProgress.deleteMany({});

            const response = await request(app)
              .post('/api/auth/register/step2')
              .send({
                firstName,
                lastName,
                username,
                email,
                password,
                confirmPassword: password,
              });

            if (response.status === 201) {
              // Username and email should be normalized to lowercase
              expect(response.body.user.username).toBe(username.toLowerCase());
              expect(response.body.user.email).toBe(email.toLowerCase());

              // Verify in database
              const user = await User.findOne({ username: username.toLowerCase() });
              expect(user).not.toBeNull();
              expect(user?.username).toBe(username.toLowerCase());
              expect(user?.email).toBe(email.toLowerCase());
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 60000);

    it('should trim firstName and lastName consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[a-zA-Z\-']{2,48}$/), // Shorter to allow room for spaces
          fc.stringMatching(/^[a-zA-Z\-']{2,48}$/),
          validUsernameArb,
          validEmailArb,
          validPasswordArb,
          async (firstName, lastName, username, email, password) => {
            // Clear database for this property run
            await User.deleteMany({});
            await UserProgress.deleteMany({});

            // Add whitespace to names
            const firstNameWithSpaces = `  ${firstName}  `;
            const lastNameWithSpaces = `  ${lastName}  `;

            const response = await request(app)
              .post('/api/auth/register/step2')
              .send({
                firstName: firstNameWithSpaces,
                lastName: lastNameWithSpaces,
                username,
                email,
                password,
                confirmPassword: password,
              });

            if (response.status === 201) {
              // Names should be trimmed
              expect(response.body.user.firstName).toBe(firstName.trim());
              expect(response.body.user.lastName).toBe(lastName.trim());

              // Verify in database
              const user = await User.findById(response.body.user.id);
              expect(user?.firstName).toBe(firstName.trim());
              expect(user?.lastName).toBe(lastName.trim());
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 60000);
  });

  describe('Token expiration properties', () => {
    it('should generate tokens with expiration time for any valid registration', async () => {
      await fc.assert(
        fc.asyncProperty(validRegistrationDataArb, async (registrationData) => {
          // Clear database for this property run
          await User.deleteMany({});
          await UserProgress.deleteMany({});

          const beforeTime = Math.floor(Date.now() / 1000);

          const response = await request(app)
            .post('/api/auth/register/step2')
            .send({
              ...registrationData,
              confirmPassword: registrationData.password,
            });

          const afterTime = Math.floor(Date.now() / 1000);

          const decoded = jwt.verify(response.body.token, TEST_JWT_SECRET) as any;

          // Token should have issued at time between before and after
          expect(decoded.iat).toBeGreaterThanOrEqual(beforeTime);
          expect(decoded.iat).toBeLessThanOrEqual(afterTime);

          // Token should have expiration time in the future
          expect(decoded.exp).toBeGreaterThan(afterTime);

          // Token should expire in 24 hours (24 * 60 * 60 = 86400 seconds)
          const expirationDuration = decoded.exp - decoded.iat;
          expect(expirationDuration).toBe(86400);
        }),
        { numRuns: 10 }
      );
    }, 60000);
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle registration with minimal valid data', async () => {
      // Minimal valid registration data
      const minimalData = {
        firstName: 'Jo',
        lastName: 'Do',
        username: 'abctest',
        email: 'test@minimal.c',
        password: 'Pass123A',
        confirmPassword: 'Pass123A',
      };

      await User.deleteMany({});
      await UserProgress.deleteMany({});

      const response = await request(app)
        .post('/api/auth/register/step2')
        .send(minimalData);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();

      // Verify user can login immediately
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: minimalData.username,
          password: minimalData.password,
        });

      expect(loginResponse.status).toBe(200);
    }, 15000);

    it('should handle registration with maximum valid name lengths', async () => {
      const maxData = {
        firstName: 'a'.repeat(50),
        lastName: 'b'.repeat(50),
        username: 'd'.repeat(30),
        email: 'testmax@example.com',
        password: 'Pass123A',
        confirmPassword: 'Pass123A',
      };

      await User.deleteMany({});
      await UserProgress.deleteMany({});

      const response = await request(app)
        .post('/api/auth/register/step2')
        .send(maxData);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.firstName).toBe('a'.repeat(50));
      expect(response.body.user.lastName).toBe('b'.repeat(50));
      expect(response.body.user.username).toBe('d'.repeat(30));
    }, 15000);

    it('should prevent duplicate registrations with same username', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe123unique',
        email: 'john123@example.com',
        password: 'Pass123A',
        confirmPassword: 'Pass123A',
      };

      await User.deleteMany({});
      await UserProgress.deleteMany({});

      // First registration should succeed
      const response1 = await request(app)
        .post('/api/auth/register/step2')
        .send(data);

      expect(response1.status).toBe(201);

      // Second registration with same username should fail
      const response2 = await request(app)
        .post('/api/auth/register/step2')
        .send({ ...data, email: 'differentEmail@example.com' });

      expect(response2.status).toBe(409);
      expect(response2.body.success).toBe(false);
      expect(response2.body.error).toBe('Username already exists');
    }, 15000);

    it('should prevent duplicate registrations with same email', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoeuniquename',
        email: 'johnunique@example.com',
        password: 'Pass123A',
        confirmPassword: 'Pass123A',
      };

      await User.deleteMany({});
      await UserProgress.deleteMany({});

      // First registration should succeed
      const response1 = await request(app)
        .post('/api/auth/register/step2')
        .send(data);

      expect(response1.status).toBe(201);

      // Second registration with same email should fail
      const response2 = await request(app)
        .post('/api/auth/register/step2')
        .send({ ...data, username: 'differentuser' });

      expect(response2.status).toBe(409);
      expect(response2.body.success).toBe(false);
      expect(response2.body.error).toBe('Email already exists');
    }, 15000);
  });
});
