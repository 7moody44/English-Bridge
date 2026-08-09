import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export interface AuthRequest extends Request {
  user?: { userId: string; username: string; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      username: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token has expired',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
      });
    }
  }
};

export const isAuthenticated = (req: AuthRequest): boolean => {
  return !!req.user;
};

export const getCurrentUserId = (req: AuthRequest): string | null => {
  return req.user?.userId || null;
};
