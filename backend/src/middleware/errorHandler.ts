import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config.js';
import { ApiResponse, AppError } from '../types/index.js';

// Custom application error class
export class ApplicationError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
export const errorHandler = (
  error: Error | ApplicationError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle different types of errors
  if (error instanceof ApplicationError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    details = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
    message = 'Invalid data format';
  } else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    // Duplicate key error
    statusCode = 409;
    message = 'Resource already exists';
    const field = Object.keys((error as any).keyPattern)[0];
    details = `${field} already exists`;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database error';
  }

  // Log error details in development
  if (config.nodeEnv === 'development') {
    console.error('Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  // Construct error response
  const errorResponse: ApiResponse = {
    success: false,
    message,
    error: config.nodeEnv === 'development' ? error.message : message,
  };

  if (details) {
    errorResponse.data = details;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found',
  };

  res.status(404).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};