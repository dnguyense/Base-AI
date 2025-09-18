import express from 'express';
import { errorTrackingService } from '../services/errorTrackingService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Log an error
router.post('/log', async (req, res) => {
  try {
    const {
      level,
      message,
      stack,
      userId,
      userAgent,
      url,
      method,
      statusCode,
      metadata
    } = req.body;

    // Validate required fields
    if (!level || !message) {
      return res.status(400).json({
        success: false,
        error: 'Level and message are required'
      });
    }

    const errorId = await errorTrackingService.logError({
      level,
      message,
      stack,
      userId,
      userAgent: userAgent || req.get('User-Agent'),
      url: url || req.originalUrl,
      method: method || req.method,
      statusCode,
      metadata
    });

    return res.status(201).json({
      success: true,
      message: 'Error logged successfully',
      data: { errorId }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to log error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Submit user feedback
router.post('/feedback', async (req, res) => {
  try {
    const {
      userId,
      email,
      type,
      subject,
      description,
      severity,
      metadata
    } = req.body;

    // Validate required fields
    if (!type || !subject || !description || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Type, subject, description, and severity are required'
      });
    }

    const feedbackId = await errorTrackingService.submitFeedback({
      userId,
      email,
      type,
      subject,
      description,
      severity,
      metadata
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedbackId }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get error logs (admin only)
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const {
      level,
      limit,
      since,
      userId
    } = req.query;

    const options: any = {};
    
    if (level) options.level = level as string;
    if (limit) options.limit = parseInt(limit as string);
    if (since) options.since = new Date(since as string);
    if (userId) options.userId = userId as string;

    const logs = errorTrackingService.getErrorLogs(options);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get error logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get feedback entries (admin only)
router.get('/feedback', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      status,
      severity,
      limit,
      since
    } = req.query;

    const options: any = {};
    
    if (type) options.type = type as string;
    if (status) options.status = status as string;
    if (severity) options.severity = severity as string;
    if (limit) options.limit = parseInt(limit as string);
    if (since) options.since = new Date(since as string);

    const feedback = errorTrackingService.getFeedback(options);

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get error statistics (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const stats = errorTrackingService.getErrorStats(days);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get error statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update feedback status (admin only)
router.put('/feedback/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (open, in_progress, resolved, closed)'
      });
    }

    const updated = await errorTrackingService.updateFeedbackStatus(id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Feedback entry not found'
      });
    }

    return res.json({
      success: true,
      message: 'Feedback status updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update feedback status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user-friendly error message
router.post('/friendly-message', async (req, res) => {
  try {
    const { error, context } = req.body;

    if (!error || !error.message) {
      return res.status(400).json({
        success: false,
        error: 'Error object with message is required'
      });
    }

    const friendlyMessage = errorTrackingService.getUserFriendlyMessage(error, context);
    const suggestions = errorTrackingService.getRecoverySuggestions(error, context);

    return res.json({
      success: true,
      data: {
        message: friendlyMessage,
        suggestions
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get friendly error message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for error tracking service
router.get('/health', async (req, res) => {
  try {
    // Check if service is operational by getting recent stats
    const stats = errorTrackingService.getErrorStats(1);
    
    res.json({
      success: true,
      message: 'Error tracking service is operational',
      data: {
        status: 'healthy',
        recentErrors: stats.totalErrors,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error tracking service health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;