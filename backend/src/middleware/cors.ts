import cors from 'cors';
import { config } from '../config/config.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];

    // In development, allow all localhost origins
    if (config.nodeEnv === 'development') {
      const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
      if (localhostRegex.test(origin)) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
});