"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredTokens = exports.getDownloadAuditTrail = exports.getDownloadAnalytics = exports.secureDownload = exports.generateDownloadToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const User_1 = __importDefault(require("../models/User"));
const subscription_1 = require("../middleware/subscription");
const subscriptionService_1 = require("../services/subscriptionService");
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const downloadAttempts = [];
const downloadTokens = new Map();
const generateDownloadToken = async (req, res) => {
    try {
        const { fileId, fileName, filePath } = req.body;
        if (!fileId || !fileName || !filePath) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: fileId, fileName, filePath',
            });
            return;
        }
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const subscription = await subscriptionService_1.subscriptionService.getCurrentSubscription(user.id);
        const currentPlan = subscription_1.SUBSCRIPTION_LIMITS[user.subscriptionPlan] || subscription_1.SUBSCRIPTION_LIMITS.free;
        if (user.subscriptionPlan === 'free') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayAttempts = downloadAttempts.filter(attempt => attempt.userId === user.id &&
                attempt.success &&
                attempt.timestamp >= today).length;
            if (todayAttempts >= currentPlan.dailyCompressions) {
                res.status(403).json({
                    success: false,
                    message: 'Daily download limit exceeded. Please upgrade your subscription.',
                    code: 'DAILY_LIMIT_EXCEEDED',
                    currentUsage: todayAttempts,
                    limit: currentPlan.dailyCompressions,
                });
                return;
            }
        }
        const hasActiveSubscription = subscription && subscription.isActive();
        if (user.subscriptionPlan !== 'free' && !hasActiveSubscription) {
            res.status(403).json({
                success: false,
                message: 'Active subscription required for download access',
                code: 'SUBSCRIPTION_REQUIRED',
            });
            return;
        }
        try {
            await promises_1.default.access(filePath);
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: 'File not found',
            });
            return;
        }
        const tokenData = {
            userId: user.id,
            fileId,
            fileName,
            filePath,
            expiresAt: Date.now() + (60 * 60 * 1000),
        };
        const token = jsonwebtoken_1.default.sign(tokenData, JWT_SECRET, { expiresIn: '1h' });
        downloadTokens.set(token, tokenData);
        console.log(`Download token generated for user ${user.id}, file ${fileId}`);
        res.json({
            success: true,
            data: {
                downloadToken: token,
                expiresAt: tokenData.expiresAt,
                fileName,
                fileId,
            },
        });
    }
    catch (error) {
        console.error('Generate download token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate download token',
        });
    }
};
exports.generateDownloadToken = generateDownloadToken;
const secureDownload = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Download token required',
            });
            return;
        }
        let tokenData;
        try {
            tokenData = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (jwtError) {
            const attempt = {
                userId: 0,
                fileId: 'unknown',
                fileName: 'unknown',
                success: false,
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                timestamp: new Date(),
                subscriptionPlan: 'unknown',
            };
            downloadAttempts.push(attempt);
            res.status(401).json({
                success: false,
                message: 'Invalid or expired download token',
                code: 'TOKEN_INVALID',
            });
            return;
        }
        if (Date.now() > tokenData.expiresAt) {
            res.status(401).json({
                success: false,
                message: 'Download token has expired',
                code: 'TOKEN_EXPIRED',
            });
            return;
        }
        const user = await User_1.default.findByPk(tokenData.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        let fileStats;
        try {
            fileStats = await promises_1.default.stat(tokenData.filePath);
        }
        catch (error) {
            const attempt = {
                userId: user.id,
                fileId: tokenData.fileId,
                fileName: tokenData.fileName,
                success: false,
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                timestamp: new Date(),
                subscriptionPlan: user.subscriptionPlan,
            };
            downloadAttempts.push(attempt);
            res.status(404).json({
                success: false,
                message: 'File no longer available',
            });
            return;
        }
        const subscription = await subscriptionService_1.subscriptionService.getCurrentSubscription(user.id);
        const hasActiveSubscription = subscription && subscription.isActive();
        if (user.subscriptionPlan !== 'free' && !hasActiveSubscription) {
            res.status(403).json({
                success: false,
                message: 'Active subscription required',
                code: 'SUBSCRIPTION_EXPIRED',
            });
            return;
        }
        const successfulAttempt = {
            userId: user.id,
            fileId: tokenData.fileId,
            fileName: tokenData.fileName,
            success: true,
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            timestamp: new Date(),
            subscriptionPlan: user.subscriptionPlan,
            downloadSize: fileStats.size,
        };
        downloadAttempts.push(successfulAttempt);
        downloadTokens.delete(token);
        const fileName = path_1.default.basename(tokenData.fileName);
        const fileExtension = path_1.default.extname(fileName).toLowerCase();
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', fileExtension === '.pdf' ? 'application/pdf' : 'application/octet-stream');
        res.setHeader('Content-Length', fileStats.size);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const fileBuffer = await promises_1.default.readFile(tokenData.filePath);
        res.send(fileBuffer);
        console.log(`File downloaded successfully: ${tokenData.fileName} by user ${user.id}`);
    }
    catch (error) {
        console.error('Secure download error:', error);
        res.status(500).json({
            success: false,
            message: 'Download failed due to server error',
        });
    }
};
exports.secureDownload = secureDownload;
const getDownloadAnalytics = async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const userAttempts = downloadAttempts.filter(attempt => attempt.userId === user.id);
        const totalDownloads = userAttempts.filter(a => a.success).length;
        const failedAttempts = userAttempts.filter(a => !a.success).length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayDownloads = userAttempts.filter(a => a.success && a.timestamp >= today).length;
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const monthlyDownloads = userAttempts.filter(a => a.success && a.timestamp >= thisMonth).length;
        const totalDataTransferred = userAttempts
            .filter(a => a.success && a.downloadSize)
            .reduce((sum, a) => sum + (a.downloadSize || 0), 0);
        const currentPlan = subscription_1.SUBSCRIPTION_LIMITS[user.subscriptionPlan] || subscription_1.SUBSCRIPTION_LIMITS.free;
        const analytics = {
            user: {
                id: user.id,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
            },
            usage: {
                daily: {
                    downloaded: todayDownloads,
                    limit: currentPlan.dailyCompressions,
                    remaining: Math.max(0, currentPlan.dailyCompressions - todayDownloads),
                },
                monthly: {
                    downloaded: monthlyDownloads,
                    limit: currentPlan.monthlyCompressions,
                    remaining: Math.max(0, currentPlan.monthlyCompressions - monthlyDownloads),
                },
            },
            statistics: {
                totalDownloads,
                failedAttempts,
                totalDataTransferred: Math.round(totalDataTransferred / (1024 * 1024)),
                averageFileSize: totalDownloads > 0 ? Math.round(totalDataTransferred / totalDownloads / (1024 * 1024)) : 0,
            },
            recentActivity: userAttempts
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 10)
                .map(attempt => ({
                fileName: attempt.fileName,
                success: attempt.success,
                timestamp: attempt.timestamp,
                fileSize: attempt.downloadSize ? Math.round(attempt.downloadSize / (1024 * 1024)) : null,
            })),
        };
        res.json({
            success: true,
            data: analytics,
        });
    }
    catch (error) {
        console.error('Get download analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch download analytics',
        });
    }
};
exports.getDownloadAnalytics = getDownloadAnalytics;
const getDownloadAuditTrail = async (req, res) => {
    try {
        const { userId, startDate, endDate, limit = 100 } = req.query;
        let filteredAttempts = downloadAttempts;
        if (userId) {
            filteredAttempts = filteredAttempts.filter(a => a.userId === parseInt(userId));
        }
        if (startDate) {
            const start = new Date(startDate);
            filteredAttempts = filteredAttempts.filter(a => a.timestamp >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            filteredAttempts = filteredAttempts.filter(a => a.timestamp <= end);
        }
        const auditTrail = filteredAttempts
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, parseInt(limit))
            .map(attempt => ({
            userId: attempt.userId,
            fileId: attempt.fileId,
            fileName: attempt.fileName,
            success: attempt.success,
            timestamp: attempt.timestamp,
            ipAddress: attempt.ipAddress,
            userAgent: attempt.userAgent,
            subscriptionPlan: attempt.subscriptionPlan,
            downloadSize: attempt.downloadSize,
        }));
        const summary = {
            totalAttempts: filteredAttempts.length,
            successfulDownloads: filteredAttempts.filter(a => a.success).length,
            failedAttempts: filteredAttempts.filter(a => !a.success).length,
            uniqueUsers: new Set(filteredAttempts.map(a => a.userId)).size,
            totalDataTransferred: Math.round(filteredAttempts
                .filter(a => a.success && a.downloadSize)
                .reduce((sum, a) => sum + (a.downloadSize || 0), 0) / (1024 * 1024)),
        };
        res.json({
            success: true,
            data: {
                summary,
                auditTrail,
            },
        });
    }
    catch (error) {
        console.error('Get download audit trail error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit trail',
        });
    }
};
exports.getDownloadAuditTrail = getDownloadAuditTrail;
const cleanupExpiredTokens = () => {
    const now = Date.now();
    const expiredTokens = [];
    downloadTokens.forEach((tokenData, token) => {
        if (now > tokenData.expiresAt) {
            expiredTokens.push(token);
        }
    });
    expiredTokens.forEach(token => {
        downloadTokens.delete(token);
    });
    if (expiredTokens.length > 0) {
        console.log(`Cleaned up ${expiredTokens.length} expired download tokens`);
    }
};
exports.cleanupExpiredTokens = cleanupExpiredTokens;
setInterval(exports.cleanupExpiredTokens, 30 * 60 * 1000);
exports.default = {
    generateDownloadToken: exports.generateDownloadToken,
    secureDownload: exports.secureDownload,
    getDownloadAnalytics: exports.getDownloadAnalytics,
    getDownloadAuditTrail: exports.getDownloadAuditTrail,
    cleanupExpiredTokens: exports.cleanupExpiredTokens,
};
//# sourceMappingURL=download.js.map