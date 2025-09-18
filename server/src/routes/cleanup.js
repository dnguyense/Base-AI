const express = require('express');
const router = express.Router();
const { fileCleanupService } = require('../services/fileCleanupService');

// Get cleanup service status
router.get('/status', async (req, res) => {
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
    console.error('Error getting cleanup status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cleanup status'
    });
  }
});

// Get storage information
router.get('/storage', async (req, res) => {
  try {
    const storageInfo = await fileCleanupService.getStorageInfo();
    
    res.json({
      success: true,
      data: storageInfo
    });
  } catch (error) {
    console.error('Error getting storage info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get storage information'
    });
  }
});

// Get cleanup history
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const history = fileCleanupService.getCleanupHistory(limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting cleanup history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cleanup history'
    });
  }
});

// Manually trigger cleanup
router.post('/run', async (req, res) => {
  try {
    const { force = false } = req.body;
    const stats = await fileCleanupService.runCleanup(force);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error running cleanup:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run cleanup'
    });
  }
});

// Emergency cleanup
router.post('/emergency', async (req, res) => {
  try {
    const { maxAgeHours = 1 } = req.body;
    const stats = await fileCleanupService.emergencyCleanup(maxAgeHours);
    
    res.json({
      success: true,
      data: stats,
      message: `Emergency cleanup completed: ${stats.filesDeleted} files deleted, ${Math.round(stats.spaceFreeKB / 1024)}MB freed`
    });
  } catch (error) {
    console.error('Error running emergency cleanup:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run emergency cleanup'
    });
  }
});

// Update configuration
router.put('/config', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration provided'
      });
    }
    
    fileCleanupService.updateConfig(config);
    const newStatus = fileCleanupService.getStatus();
    
    res.json({
      success: true,
      data: newStatus,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update configuration'
    });
  }
});

// Start/stop scheduler
router.post('/scheduler/:action', async (req, res) => {
  try {
    const { action } = req.params;
    
    if (action === 'start') {
      fileCleanupService.startScheduler();
      res.json({
        success: true,
        message: 'Cleanup scheduler started'
      });
    } else if (action === 'stop') {
      fileCleanupService.stopScheduler();
      res.json({
        success: true,
        message: 'Cleanup scheduler stopped'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Use "start" or "stop"'
      });
    }
  } catch (error) {
    console.error('Error managing scheduler:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to manage scheduler'
    });
  }
});

module.exports = router;