"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileCleanupService_1 = require("../services/fileCleanupService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const status = fileCleanupService_1.fileCleanupService.getStatus();
        const storageInfo = await fileCleanupService_1.fileCleanupService.getStorageInfo();
        res.json({
            success: true,
            data: {
                ...status,
                storage: storageInfo
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get cleanup status',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/history', auth_1.authenticateToken, async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const history = fileCleanupService_1.fileCleanupService.getCleanupHistory(limit);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get cleanup history',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/run', auth_1.authenticateToken, async (req, res) => {
    try {
        const force = req.body.force === true;
        const stats = await fileCleanupService_1.fileCleanupService.runCleanup(force);
        res.json({
            success: true,
            message: 'Cleanup completed successfully',
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to run cleanup',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/emergency', auth_1.authenticateToken, async (req, res) => {
    try {
        const maxAgeHours = req.body.maxAgeHours || 1;
        const stats = await fileCleanupService_1.fileCleanupService.emergencyCleanup(maxAgeHours);
        res.json({
            success: true,
            message: 'Emergency cleanup completed successfully',
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to run emergency cleanup',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/config', auth_1.authenticateToken, async (req, res) => {
    try {
        const config = req.body;
        fileCleanupService_1.fileCleanupService.updateConfig(config);
        res.json({
            success: true,
            message: 'Configuration updated successfully',
            data: fileCleanupService_1.fileCleanupService.getStatus().config
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update configuration',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/storage', auth_1.authenticateToken, async (req, res) => {
    try {
        const storageInfo = await fileCleanupService_1.fileCleanupService.getStorageInfo();
        res.json({
            success: true,
            data: storageInfo
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get storage information',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=cleanup.js.map