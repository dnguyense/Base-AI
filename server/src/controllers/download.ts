import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';
import { Op } from 'sequelize';
import User from '../models/User';
import Subscription from '../models/Subscription';
import { SUBSCRIPTION_LIMITS } from '../middleware/subscription';
import { subscriptionService } from '../services/subscriptionService';
import { env } from '../config/env';

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

interface DownloadAttempt {
  userId: number;
  fileId: string;
  fileName: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  subscriptionPlan: string;
  downloadSize?: number;
}

// In-memory storage for download attempts (in production, use database)
const downloadAttempts: DownloadAttempt[] = [];
const downloadTokens: Map<string, DownloadToken> = new Map();

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
      
      const todayAttempts = downloadAttempts.filter(attempt => 
        attempt.userId === user.id && 
        attempt.success && 
        attempt.timestamp >= today
      ).length;

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

    // Check if user has active subscription for premium features
    const hasActiveSubscription = subscription && subscription.isActive();
    
    if (user.subscriptionPlan !== 'free' && !hasActiveSubscription) {
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
      // Log unauthorized access attempt
      const attempt: DownloadAttempt = {
        userId: 0, // Unknown user
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
      // Log failed download attempt
      const attempt: DownloadAttempt = {
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

    // Final subscription check using optimized service
    const subscription = await subscriptionService.getCurrentSubscription(user.id);

    const hasActiveSubscription = subscription && subscription.isActive();
    
    if (user.subscriptionPlan !== 'free' && !hasActiveSubscription) {
      res.status(403).json({
        success: false,
        message: 'Active subscription required',
        code: 'SUBSCRIPTION_EXPIRED',
      });
      return;
    }

    // Log successful download attempt
    const successfulAttempt: DownloadAttempt = {
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

    const userAttempts = downloadAttempts.filter(attempt => attempt.userId === user.id);
    
    // Calculate analytics
    const totalDownloads = userAttempts.filter(a => a.success).length;
    const failedAttempts = userAttempts.filter(a => !a.success).length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDownloads = userAttempts.filter(a => 
      a.success && a.timestamp >= today
    ).length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthlyDownloads = userAttempts.filter(a => 
      a.success && a.timestamp >= thisMonth
    ).length;

    const totalDataTransferred = userAttempts
      .filter(a => a.success && a.downloadSize)
      .reduce((sum, a) => sum + (a.downloadSize || 0), 0);

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
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map(attempt => ({
          fileName: attempt.fileName,
          success: attempt.success,
          timestamp: attempt.timestamp,
          fileSize: attempt.downloadSize ? Math.round(attempt.downloadSize / (1024 * 1024)) : null, // MB
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
export const getDownloadAuditTrail = async (req: Request, res: Response) => {
  try {
    // This would typically require admin authentication middleware
    const { userId, startDate, endDate, limit = 100 } = req.query;

    let filteredAttempts = downloadAttempts;

    if (userId) {
      filteredAttempts = filteredAttempts.filter(a => a.userId === parseInt(userId as string));
    }

    if (startDate) {
      const start = new Date(startDate as string);
      filteredAttempts = filteredAttempts.filter(a => a.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      filteredAttempts = filteredAttempts.filter(a => a.timestamp <= end);
    }

    const auditTrail = filteredAttempts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, parseInt(limit as string))
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
      totalDataTransferred: Math.round(
        filteredAttempts
          .filter(a => a.success && a.downloadSize)
          .reduce((sum, a) => sum + (a.downloadSize || 0), 0) / (1024 * 1024)
      ), // MB
    };

    res.json({
      success: true,
      data: {
        summary,
        auditTrail,
      },
    });

  } catch (error) {
    console.error('Get download audit trail error:', error);
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
