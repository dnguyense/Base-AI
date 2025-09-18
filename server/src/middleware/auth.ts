import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { env } from '../config/env';

const JWT_SECRET = env.jwt.secret;

export interface AuthRequest extends Request {
  user?: any;
}

// Authentication middleware
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      }) as any;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // Find user in database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      }) as any;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
      }) as any;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired',
      }) as any;
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    }) as any;
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // Find user in database
    const user = await User.findByPk(decoded.userId);
    req.user = user || null;
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    next();
  }
};

// Subscription status middleware
export const requireActiveSubscription = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      }) as any;
    }

    const user = req.user as User;
    
    // Check if user has an active subscription
    if (user.subscriptionStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        data: {
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan,
        },
      }) as any;
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    }) as any;
  }
};

// Email verification middleware
export const requireEmailVerification = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      }) as any;
    }

    const user = req.user as User;
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required',
        data: {
          isEmailVerified: false,
        },
      }) as any;
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    }) as any;
  }
};

// Compression limits middleware
export const checkCompressionLimits = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = req.user as User;
    
    // Check if user can compress files
    if (!user.canCompress()) {
      const limits = user.getCompressionLimits();
      res.status(429).json({
        success: false,
        message: 'Compression limit reached',
        data: {
          limits,
          current: {
            daily: user.dailyCompressions,
            monthly: user.monthlyCompressions,
          },
          subscriptionPlan: user.subscriptionPlan,
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Compression limits check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
};

// Plan-based access control
export const requirePlan = (minPlan: 'free' | 'basic' | 'pro' | 'enterprise') => {
  const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
  
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = req.user as User;
      const userPlanIndex = planHierarchy.indexOf(user.subscriptionPlan);
      const requiredPlanIndex = planHierarchy.indexOf(minPlan);

      if (userPlanIndex < requiredPlanIndex) {
        res.status(403).json({
          success: false,
          message: `${minPlan} plan or higher required`,
          data: {
            currentPlan: user.subscriptionPlan,
            requiredPlan: minPlan,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Plan requirement check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  };
};

// Admin role middleware (for future admin features)
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = req.user as User;
    
    // Check if user is admin (this field would need to be added to User model)
    // For now, we'll check if email matches admin pattern
    const isAdmin = user.email.includes('admin') || user.email.includes('support');
    
    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
};

// Rate limiting middleware for sensitive operations
export const rateLimitAuth = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean expired entries
    for (const [ip, data] of attempts.entries()) {
      if (now > data.resetTime) {
        attempts.delete(ip);
      }
    }
    
    // Get current attempt data
    let clientData = attempts.get(clientIp);
    if (!clientData) {
      clientData = { count: 0, resetTime: now + windowMs };
      attempts.set(clientIp, clientData);
    }
    
    // Check if limit exceeded
    if (clientData.count >= maxAttempts) {
      const remainingTime = Math.ceil((clientData.resetTime - now) / 1000);
      res.status(429).json({
        success: false,
        message: `Too many attempts. Try again in ${remainingTime} seconds.`,
        data: {
          retryAfter: remainingTime,
        },
      });
      return;
    }
    
    // Increment attempt count
    clientData.count++;
    
    next();
  };
};

export default {
  authenticateToken,
  optionalAuth,
  requireActiveSubscription,
  requireEmailVerification,
  checkCompressionLimits,
  requirePlan,
  requireAdmin,
  rateLimitAuth,
};
