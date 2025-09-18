import express from 'express';
import { Request, Response } from 'express';
import downloadRoutes from './download';
import authRoutes from './auth';
import { env } from '../config/env';

const router = express.Router();

// API root endpoint with documentation
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'PDF Compressor Pro API v1',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth (Active)',
      pdf: '/api/v1/pdf (Active)',
      user: '/api/v1/user (Coming soon)',
      subscription: '/api/v1/subscription (Coming soon)'
    },
    documentation: 'API documentation will be available soon',
    timestamp: new Date().toISOString()
  });
});

// Placeholder routes for future implementation
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv
  });
});

// Test endpoint for development
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// TODO: Add PDF processing routes
// router.use('/pdf', pdfRoutes);

// TODO: Add user management routes
// router.use('/user', userRoutes);

// TODO: Add subscription management routes
// router.use('/subscription', subscriptionRoutes);

// Download routes
router.use('/download', downloadRoutes);

export default router;
