import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import { HTTP_STATUS } from '../config/constants';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Sequelize Validation Error
  if (err instanceof ValidationError) {
    const message = err.errors.map((e) => e.message).join(', ');
    error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error = new AppError('Duplicate field value entered', HTTP_STATUS.CONFLICT);
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new AppError('Invalid reference to related entity', HTTP_STATUS.BAD_REQUEST);
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED);
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED);
  }

  // Cast Error (invalid ID format)
  if (err.name === 'CastError') {
    error = new AppError('Invalid resource ID format', HTTP_STATUS.BAD_REQUEST);
  }

  const statusCode = (error as AppError).statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND);
  next(error);
};

export default {
  errorHandler,
  asyncHandler,
  notFound,
  AppError
};
