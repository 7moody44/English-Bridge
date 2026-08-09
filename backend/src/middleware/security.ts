import helmet from 'helmet';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config.js';

// Security headers middleware
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Compression middleware
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress files larger than 1KB
});

// Rate limiting configuration (placeholder for future implementation)
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  
  // Log response time on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      console.error(`❌ ${logMessage}`);
    } else {
      console.log(`✅ ${logMessage}`);
    }
  });
  
  next();
};

// Health check middleware
export const healthCheck = (req: Request, res: Response, next: NextFunction): void => {
  if (req.url === '/health' && req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: '1.0.0',
      },
    });
    return;
  }
  next();
};