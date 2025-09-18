import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  errors?: any[];
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(`Error ${err.statusCode || 500}: ${err.message}`);
  if (!env.isProduction) {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { ...error, statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = { ...error, statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = { ...error, statusCode: 400, message };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { ...error, statusCode: 401, message };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { ...error, statusCode: 401, message };
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if ((err as any).code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Too many files or unexpected field name';
    }
    error = { ...error, statusCode: 400, message };
  }

  // Sequelize errors (PostgreSQL)
  if (err.name === 'SequelizeValidationError') {
    const message = (err as any).errors.map((e: any) => e.message).join(', ');
    error = { ...error, statusCode: 400, message };
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = { ...error, statusCode: 400, message };
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference to another resource';
    error = { ...error, statusCode: 400, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      ...(!env.isProduction && { stack: err.stack }),
      ...(error.errors && { details: error.errors })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};
