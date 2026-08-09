import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse, ValidationError } from '../types/index.js';
import { ApplicationError } from './errorHandler.js';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      const errorResponse: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: 'Invalid input data',
        data: validationErrors,
      };

      res.status(400).json(errorResponse);
      return;
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Common validation schemas
export const validationSchemas = {
  // User registration validation
  userRegistration: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z\s-']+$/)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
        'any.required': 'First name is required',
      }),

    lastName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .pattern(/^[a-zA-Z\s-']+$/)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
        'any.required': 'Last name is required',
      }),

    username: Joi.string()
      .min(3)
      .max(30)
      .trim()
      .lowercase()
      .pattern(/^[a-z0-9_-]+$/)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 30 characters',
        'string.pattern.base': 'Username can only contain lowercase letters, numbers, underscores, and hyphens',
        'any.required': 'Username is required',
      }),

    email: Joi.string()
      .email({ tlds: { allow: true } })
      .trim()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
  }),

  // User login validation
  userLogin: Joi.object({
    username: Joi.string()
      .trim()
      .required()
      .messages({
        'any.required': 'Username is required',
      }),

    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // Progress update validation
  lessonProgress: Joi.object({
    levelId: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required(),

    courseId: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required(),

    lessonId: Joi.number()
      .integer()
      .min(1)
      .max(8)
      .required(),

    score: Joi.number()
      .min(0)
      .max(100)
      .required(),

    timeSpent: Joi.number()
      .min(0)
      .required(),
  }),

  // Course completion validation
  courseProgress: Joi.object({
    levelId: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required(),

    courseId: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required(),

    finalExamScore: Joi.number()
      .min(0)
      .max(100)
      .required(),
  }),

  // MongoDB ObjectId validation
  mongoId: Joi.string()
    .length(24)
    .hex()
    .required()
    .messages({
      'string.length': 'Invalid ID format',
      'string.hex': 'Invalid ID format',
      'any.required': 'ID is required',
    }),
};