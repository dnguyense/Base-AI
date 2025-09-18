import express from 'express';
import { Request, Response } from 'express';
import { sequelize } from '../models';
import { env } from '../config/env';

const router = express.Router();

const checkDatabase = async () => {
  try {
    await sequelize.authenticate({ logging: false });
    return { status: 'ok' as const };
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
};

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  const database = await checkDatabase();

  const healthCheck = {
    status: database.status === 'ok' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
    version: '1.0.0',
    services: {
      database,
    },
    memory: {
      usedMB: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      totalMB: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    },
  };

  res.status(database.status === 'ok' ? 200 : 503).json(healthCheck);
});

// Detailed health check with service breakdown
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const database = await checkDatabase();

    const healthCheck = {
      status: database.status === 'ok' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      services: {
        api: 'ok' as const,
        database,
        redis: 'not_configured' as const,
        fileSystem: 'ok' as const,
      },
      performance: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };

    res.status(database.status === 'ok' ? 200 : 503).json({
      success: true,
      data: healthCheck,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
