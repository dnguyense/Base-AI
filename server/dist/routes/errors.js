"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorTrackingService_1 = require("../services/errorTrackingService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/log', async (req, res) => {
    try {
        const { level, message, stack, userId, userAgent, url, method, statusCode, metadata } = req.body;
        if (!level || !message) {
            return res.status(400).json({
                success: false,
                error: 'Level and message are required'
            });
        }
        const errorId = await errorTrackingService_1.errorTrackingService.logError({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to log error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/feedback', async (req, res) => {
    try {
        const { userId, email, type, subject, description, severity, metadata } = req.body;
        if (!type || !subject || !description || !severity) {
            return res.status(400).json({
                success: false,
                error: 'Type, subject, description, and severity are required'
            });
        }
        const feedbackId = await errorTrackingService_1.errorTrackingService.submitFeedback({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to submit feedback',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/logs', auth_1.authenticateToken, async (req, res) => {
    try {
        const { level, limit, since, userId } = req.query;
        const options = {};
        if (level)
            options.level = level;
        if (limit)
            options.limit = parseInt(limit);
        if (since)
            options.since = new Date(since);
        if (userId)
            options.userId = userId;
        const logs = errorTrackingService_1.errorTrackingService.getErrorLogs(options);
        res.json({
            success: true,
            data: logs
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get error logs',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/feedback', auth_1.authenticateToken, async (req, res) => {
    try {
        const { type, status, severity, limit, since } = req.query;
        const options = {};
        if (type)
            options.type = type;
        if (status)
            options.status = status;
        if (severity)
            options.severity = severity;
        if (limit)
            options.limit = parseInt(limit);
        if (since)
            options.since = new Date(since);
        const feedback = errorTrackingService_1.errorTrackingService.getFeedback(options);
        res.json({
            success: true,
            data: feedback
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get feedback',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const days = req.query.days ? parseInt(req.query.days) : 7;
        const stats = errorTrackingService_1.errorTrackingService.getErrorStats(days);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get error statistics',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/feedback/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Valid status is required (open, in_progress, resolved, closed)'
            });
        }
        const updated = await errorTrackingService_1.errorTrackingService.updateFeedbackStatus(id, status);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to update feedback status',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/friendly-message', async (req, res) => {
    try {
        const { error, context } = req.body;
        if (!error || !error.message) {
            return res.status(400).json({
                success: false,
                error: 'Error object with message is required'
            });
        }
        const friendlyMessage = errorTrackingService_1.errorTrackingService.getUserFriendlyMessage(error, context);
        const suggestions = errorTrackingService_1.errorTrackingService.getRecoverySuggestions(error, context);
        return res.json({
            success: true,
            data: {
                message: friendlyMessage,
                suggestions
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to get friendly error message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const stats = errorTrackingService_1.errorTrackingService.getErrorStats(1);
        res.json({
            success: true,
            message: 'Error tracking service is operational',
            data: {
                status: 'healthy',
                recentErrors: stats.totalErrors,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error tracking service health check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=errors.js.map