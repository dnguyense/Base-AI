import express from 'express';
import type { Response } from 'express';
import { fileCleanupService } from '../services/fileCleanupService';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { auditLogService } from '../services/auditLogService';

const router = express.Router();

const recordAdminAction = async (
  req: AuthRequest,
  metadata: { actionName: string; details?: Record<string, any> },
  success: boolean,
  errorMessage?: string
) => {
  await auditLogService.logAdminAction({
    userId: (req.user as any)?.id,
    actorEmail: (req.user as any)?.email,
    success,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
    userAgent: typeof req.get === 'function' ? req.get('User-Agent') || null : null,
    metadata: {
      actionName: metadata.actionName,
      route: req.originalUrl,
      entityType: 'cleanup',
      ...('details' in metadata && metadata.details ? { details: metadata.details } : {}),
      ...(errorMessage ? { error: errorMessage } : {}),
    },
  }).catch(() => {});
};

// Get cleanup service status
router.get('/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const status = fileCleanupService.getStatus();
    const storageInfo = await fileCleanupService.getStorageInfo();
    
    await recordAdminAction(req, { actionName: 'CLEANUP_STATUS' }, true);

    res.json({
      success: true,
      data: {
        ...status,
        storage: storageInfo
      }
    });
  } catch (error) {
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_STATUS' },
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    res.status(500).json({
      success: false,
      error: 'Failed to get cleanup status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cleanup history
router.get('/history', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = fileCleanupService.getCleanupHistory(limit);
    
    await recordAdminAction(req, { actionName: 'CLEANUP_HISTORY', details: { limit } }, true);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_HISTORY' },
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    res.status(500).json({
      success: false,
      error: 'Failed to get cleanup history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Run manual cleanup
router.post('/run', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const force = req.body.force === true;
    const stats = await fileCleanupService.runCleanup(force);
    
    await recordAdminAction(req, { actionName: 'CLEANUP_RUN', details: { force } }, true);

    res.json({
      success: true,
      message: 'Cleanup completed successfully',
      data: stats
    });
  } catch (error) {
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_RUN' },
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    res.status(500).json({
      success: false,
      error: 'Failed to run cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Run emergency cleanup
router.post('/emergency', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const maxAgeHours = req.body.maxAgeHours || 1;
    const stats = await fileCleanupService.emergencyCleanup(maxAgeHours);
    
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_EMERGENCY', details: { maxAgeHours } },
      true
    );

    res.json({
      success: true,
      message: 'Emergency cleanup completed successfully',
      data: stats
    });
  } catch (error) {
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_EMERGENCY' },
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    res.status(500).json({
      success: false,
      error: 'Failed to run emergency cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update cleanup configuration
router.put('/config', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const config = req.body;
    fileCleanupService.updateConfig(config);
    
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_UPDATE_CONFIG', details: { config } },
      true
    );

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: fileCleanupService.getStatus().config
    });
  } catch (error) {
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_UPDATE_CONFIG' },
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get storage information
router.get('/storage', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const storageInfo = await fileCleanupService.getStorageInfo();
    
    await recordAdminAction(req, { actionName: 'CLEANUP_STORAGE' }, true);

    res.json({
      success: true,
      data: storageInfo
    });
  } catch (error) {
    await recordAdminAction(
      req,
      { actionName: 'CLEANUP_STORAGE' },
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    res.status(500).json({
      success: false,
      error: 'Failed to get storage information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
