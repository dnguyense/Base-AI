import express from 'express';
import { fileCleanupService } from '../services/fileCleanupService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get cleanup service status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = fileCleanupService.getStatus();
    const storageInfo = await fileCleanupService.getStorageInfo();
    
    res.json({
      success: true,
      data: {
        ...status,
        storage: storageInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cleanup status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cleanup history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = fileCleanupService.getCleanupHistory(limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cleanup history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Run manual cleanup
router.post('/run', authenticateToken, async (req, res) => {
  try {
    const force = req.body.force === true;
    const stats = await fileCleanupService.runCleanup(force);
    
    res.json({
      success: true,
      message: 'Cleanup completed successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to run cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Run emergency cleanup
router.post('/emergency', authenticateToken, async (req, res) => {
  try {
    const maxAgeHours = req.body.maxAgeHours || 1;
    const stats = await fileCleanupService.emergencyCleanup(maxAgeHours);
    
    res.json({
      success: true,
      message: 'Emergency cleanup completed successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to run emergency cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update cleanup configuration
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const config = req.body;
    fileCleanupService.updateConfig(config);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: fileCleanupService.getStatus().config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get storage information
router.get('/storage', authenticateToken, async (req, res) => {
  try {
    const storageInfo = await fileCleanupService.getStorageInfo();
    
    res.json({
      success: true,
      data: storageInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get storage information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;