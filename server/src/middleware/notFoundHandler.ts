import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  res.status(404).json({
    success: false,
    message: error.message,
    error: {
      statusCode: 404
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    suggestion: 'Check the API documentation for available endpoints'
  });
};