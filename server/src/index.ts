import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { 
  paginationMiddleware, 
  etagMiddleware, 
  cacheControlMiddleware, 
  compressionOptimization 
} from './middleware/responseOptimization';

// Import routes
import healthRoutes from './routes/health';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscription';
import pdfRoutes from './routes/pdf';
import cleanupRoutes from './routes/cleanup';
import errorRoutes from './routes/errors';

// Import database
import { initializeDatabase } from './models';

// Import services
import { fileCleanupService } from './services/fileCleanupService';
import { env } from './config/env';

export const app = express();

// Port configuration is derived from validated environment configuration
const PORT = env.app.port;

// Security middleware (disabled in test mode)
if (!env.isTest) {
  app.use(helmet());
}

// CORS configuration
app.use(cors({
  origin: env.isTest ? true : env.app.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Performance optimization middleware
app.use(compressionOptimization());
app.use(etagMiddleware());
app.use(cacheControlMiddleware());

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.isProduction ? Math.min(env.rateLimit.max, 100) : env.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => env.isTest // Skip rate limiting in test environment
});

app.use('/api', limiter);
app.use('/api', paginationMiddleware(20, 100));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/auth', authRoutes); // Direct mount for tests
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/v1/pdf', pdfRoutes);
app.use('/api/v1/cleanup', cleanupRoutes);
app.use('/api/v1/errors', errorRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PDF Compressor Pro API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Initialize file cleanup service
    console.log('🧹 Initializing file cleanup service...');
    fileCleanupService.startScheduler();
    
    // Setup file cleanup service event listeners
    fileCleanupService.on('cleanupCompleted', (stats) => {
      console.log(`🧹 Cleanup completed: ${stats.filesDeleted} files deleted, ${Math.round(stats.spaceFreeKB / 1024)}MB freed`);
    });
    
    fileCleanupService.on('error', (error) => {
      console.error('🧹 File cleanup error:', error);
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${env.nodeEnv}`);
      console.log(`💾 Database: Connected and synchronized`);
      console.log(`🧹 File cleanup service: Active (runs every 1 hour)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in test mode, unless it's E2E testing
if (!env.isTest || process.env.E2E_TEST === 'true') {
  startServer();
}

export default app;
