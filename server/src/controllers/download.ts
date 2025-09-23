import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';
import { Op } from 'sequelize';
import User from '../models/User';
import { SUBSCRIPTION_LIMITS } from '../middleware/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { env } from '../config/env';
import AuditLog from '../models/AuditLog';
import { auditLogService } from '../services/auditLogService';

const JWT_SECRET = env.jwt.secret;

interface AuthRequest extends Request {
  user?: any;
  subscription?: any;
}

interface DownloadToken {
  userId: number;
  fileId: string;
  fileName: string;
  filePath: string;
  expiresAt: number;
}

const downloadTokens: Map<string, DownloadToken> = new Map();

const resolveClientIp = (req: Request): string => {
  return req.ip || (req.socket && req.socket.remoteAddress) || (req as any).connection?.remoteAddress || 'unknown';
};

const resolveUserAgent = (req: Request): string => {
  if (typeof (req as any).get === 'function') {
    return (req as any).get('User-Agent') || 'unknown';
  }
  return 'unknown';
};

// Generate secure download token
export const generateDownloadToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId, fileName, filePath } = req.body;
    
    if (!fileId || !fileName || !filePath) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: fileId, fileName, filePath',
      });
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check subscription status using optimized service
    const subscription = await subscriptionService.getCurrentSubscription(user.id);

    const currentPlan = SUBSCRIPTION_LIMITS[user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;

    // For free users, check if they've exceeded daily download limits
    if (user.subscriptionPlan === 'free') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayDownloads = await auditLogService.countDownloadAttempts({
        userId: user.id,
        success: true,
        start: today,
      });

      if (todayDownloads >= currentPlan.dailyCompressions) {
        await auditLogService.logDownloadAttempt({
          userId: user.id,
          actorEmail: user.email,
          success: false,
          ipAddress: resolveClientIp(req),
          userAgent: resolveUserAgent(req),
          metadata: {
            fileId,
            fileName,
            subscriptionPlan: user.subscriptionPlan,
            reason: 'DAILY_LIMIT_EXCEEDED',
          },
        });
        res.status(403).json({
          success: false,
          message: 'Daily download limit exceeded. Please upgrade your subscription.',
          code: 'DAILY_LIMIT_EXCEEDED',
          currentUsage: todayDownloads,
          limit: currentPlan.dailyCompressions,
        });
        return;
      }
    }

    // Check if user has active subscription for premium features
    const hasActiveSubscription = subscription && subscription.isActive();
    
    if (user.subscriptionPlan !== 'free' && !hasActiveSubscription) {
      await auditLogService.logDownloadAttempt({
        userId: user.id,
        actorEmail: user.email,
        success: false,
        ipAddress: resolveClientIp(req),
        userAgent: resolveUserAgent(req),
        metadata: {
          fileId,
          fileName,
          subscriptionPlan: user.subscriptionPlan,
          reason: 'SUBSCRIPTION_REQUIRED',
        },
      });
      res.status(403).json({
        success: false,
        message: 'Active subscription required for download access',
        code: 'SUBSCRIPTION_REQUIRED',
      });
      return;
    }

    // Check file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      await auditLogService.logDownloadAttempt({
        userId: user.id,
        actorEmail: user.email,
        success: false,
        ipAddress: resolveClientIp(req),
        userAgent: resolveUserAgent(req),
        metadata: {
          fileId,
          fileName,
          subscriptionPlan: user.subscriptionPlan,
          reason: 'FILE_NOT_FOUND',
        },
      });
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    // Generate secure token (expires in 1 hour)
    const tokenData: DownloadToken = {
      userId: user.id,
      fileId,
      fileName,
      filePath,
      expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
    };

    const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '1h' });
    
    // Store token for tracking
    downloadTokens.set(token, tokenData);

    // Log token generation
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

  } catch (error) {
    console.error('Generate download token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download token',
    });
  }
};

// Secure download endpoint
export const secureDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    
    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Download token required',
      });
      return;
    }

    // Verify and decode token
    let tokenData: DownloadToken;
    try {
      tokenData = jwt.verify(token, JWT_SECRET) as DownloadToken;
    } catch (jwtError) {
      await auditLogService.logDownloadAttempt({
        success: false,
        ipAddress: resolveClientIp(req),
        userAgent: resolveUserAgent(req),
        metadata: {
          reason: 'TOKEN_INVALID',
          token,
        },
      });
      res.status(401).json({
        success: false,
        message: 'Invalid or expired download token',
        code: 'TOKEN_INVALID',
      });
      return;
    }

    // Check if token has expired (double-check)
    if (Date.now() > tokenData.expiresAt) {
      res.status(401).json({
        success: false,
        message: 'Download token has expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    // Verify user still exists and has valid subscription
    const user = await User.findByPk(tokenData.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check file still exists
    let fileStats;
    try {
      fileStats = await fs.stat(tokenData.filePath);
    } catch (error) {
      await auditLogService.logDownloadAttempt({
        userId: user.id,
        actorEmail: user.email,
        success: false,
        ipAddress: resolveClientIp(req),
        userAgent: resolveUserAgent(req),
        metadata: {
          fileId: tokenData.fileId,
          fileName: tokenData.fileName,
          subscriptionPlan: user.subscriptionPlan,
          reason: 'FILE_MISSING',
        },
      });
      res.status(404).json({
        success: false,
        message: 'File no longer available',
      });
      return;
    }

    // Final subscription check using optimized service
    const subscription = await subscriptionService.getCurrentSubscription(user.id);

    const hasActiveSubscription = subscription && subscription.isActive();
    
    if (user.subscriptionPlan !== 'free' && !hasActiveSubscription) {
      await auditLogService.logDownloadAttempt({
        userId: user.id,
        actorEmail: user.email,
        success: false,
        ipAddress: resolveClientIp(req),
        userAgent: resolveUserAgent(req),
        metadata: {
          fileId: tokenData.fileId,
          fileName: tokenData.fileName,
          subscriptionPlan: user.subscriptionPlan,
          reason: 'SUBSCRIPTION_EXPIRED',
        },
      });
      res.status(403).json({
        success: false,
        message: 'Active subscription required',
        code: 'SUBSCRIPTION_EXPIRED',
      });
      return;
    }

    await auditLogService.logDownloadAttempt({
      userId: user.id,
      actorEmail: user.email,
      success: true,
      ipAddress: resolveClientIp(req),
      userAgent: resolveUserAgent(req),
      metadata: {
        fileId: tokenData.fileId,
        fileName: tokenData.fileName,
        subscriptionPlan: user.subscriptionPlan,
        downloadSize: fileStats.size,
      },
    });

    // Remove token after use (one-time use)
    downloadTokens.delete(token);

    // Set appropriate headers for file download
    const fileName = path.basename(tokenData.fileName);
    const fileExtension = path.extname(fileName).toLowerCase();
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', fileExtension === '.pdf' ? 'application/pdf' : 'application/octet-stream');
    res.setHeader('Content-Length', fileStats.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream file to response
    const fileBuffer = await fs.readFile(tokenData.filePath);
    res.send(fileBuffer);

    console.log(`File downloaded successfully: ${tokenData.fileName} by user ${user.id}`);

  } catch (error) {
    console.error('Secure download error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed due to server error',
    });
  }
};

// Get download analytics for user
export const getDownloadAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const userAttempts = await AuditLog.findAll({
      where: {
        action: 'DOWNLOAD_ATTEMPT',
        userId: user.id,
      },
      order: [['createdAt', 'DESC']],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const totalDownloads = userAttempts.filter(a => a.success).length;
    const failedAttempts = userAttempts.filter(a => !a.success).length;
    const todayDownloads = userAttempts.filter(a => a.success && a.createdAt >= today).length;
    const monthlyDownloads = userAttempts.filter(a => a.success && a.createdAt >= thisMonth).length;

    const totalDataTransferred = userAttempts
      .filter(a => a.success && a.metadata?.downloadSize)
      .reduce((sum, a) => sum + Number(a.metadata?.downloadSize || 0), 0);

    const currentPlan = SUBSCRIPTION_LIMITS[user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;

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
        totalDataTransferred: Math.round(totalDataTransferred / (1024 * 1024)), // MB
        averageFileSize: totalDownloads > 0 ? Math.round(totalDataTransferred / totalDownloads / (1024 * 1024)) : 0, // MB
      },
      recentActivity: userAttempts
        .slice(0, 10)
        .map(attempt => ({
          fileName: attempt.metadata?.fileName || attempt.entityId || 'unknown',
          success: attempt.success,
          timestamp: attempt.createdAt,
          fileSize: attempt.metadata?.downloadSize
            ? Math.round(Number(attempt.metadata.downloadSize) / (1024 * 1024))
            : null,
        })),
    };

    res.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error('Get download analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch download analytics',
    });
  }
};

// Admin endpoint to get download audit trail
export const getDownloadAuditTrail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, startDate, endDate, limit = 100 } = req.query;

    const where: any = {
      action: 'DOWNLOAD_ATTEMPT',
    };

    if (userId) {
      where.userId = parseInt(userId as string, 10);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    const attempts = await AuditLog.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    const limitNumber = Number(limit) > 0 ? Math.min(Number(limit), 1000) : 100;

    const auditTrail = attempts
      .slice(0, limitNumber)
      .map(attempt => ({
        userId: attempt.userId,
        fileId: attempt.metadata?.fileId ?? attempt.entityId ?? null,
        fileName: attempt.metadata?.fileName ?? null,
        success: attempt.success,
        timestamp: attempt.createdAt,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        subscriptionPlan: attempt.metadata?.subscriptionPlan ?? null,
        downloadSize: attempt.metadata?.downloadSize,
        reason: attempt.metadata?.reason,
      }));

    const summary = {
      totalAttempts: attempts.length,
      successfulDownloads: attempts.filter(a => a.success).length,
      failedAttempts: attempts.filter(a => !a.success).length,
      uniqueUsers: new Set(attempts.map(a => a.userId).filter(Boolean)).size,
      totalDataTransferred: Math.round(
        attempts
          .filter(a => a.success && a.metadata?.downloadSize)
          .reduce((sum, a) => sum + Number(a.metadata?.downloadSize || 0), 0) / (1024 * 1024)
      ),
    };

    await auditLogService.logAdminAction({
      userId: req.user?.id,
      actorEmail: req.user?.email,
      success: true,
      ipAddress: resolveClientIp(req),
      userAgent: resolveUserAgent(req),
      metadata: {
        actionName: 'VIEW_DOWNLOAD_AUDIT',
        route: req.originalUrl,
        entityType: 'download_audit',
        filters: {
          userId,
          startDate,
          endDate,
          limit: limitNumber,
        },
      },
    });

    res.json({
      success: true,
      data: {
        summary,
        auditTrail,
      },
    });

  } catch (error) {
    console.error('Get download audit trail error:', error);

    await auditLogService.logAdminAction({
      userId: req.user?.id,
      actorEmail: req.user?.email,
      success: false,
      ipAddress: resolveClientIp(req),
      userAgent: resolveUserAgent(req),
      metadata: {
        actionName: 'VIEW_DOWNLOAD_AUDIT',
        route: req.originalUrl,
        entityType: 'download_audit',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(() => {});

    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit trail',
    });
  }
};

// Cleanup expired tokens (should be run periodically)
export const cleanupExpiredTokens = () => {
  const now = Date.now();
  const expiredTokens: string[] = [];

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

let cleanupInterval: NodeJS.Timeout | null = null;
if (!env.isTest) {
  cleanupInterval = setInterval(cleanupExpiredTokens, 30 * 60 * 1000);
}

export const stopDownloadCleanupScheduler = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

export default {
  generateDownloadToken,
  secureDownload,
  getDownloadAnalytics,
  getDownloadAuditTrail,
  cleanupExpiredTokens,
  stopDownloadCleanupScheduler,
};
