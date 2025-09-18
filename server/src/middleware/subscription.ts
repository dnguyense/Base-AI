import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Subscription from '../models/Subscription';

interface AuthRequest extends Request {
  user?: any;
  usage?: {
    current: number;
    limit: number;
    remaining: number;
    plan: string;
  };
  subscriptionInfo?: {
    plan: string;
    status: string;
    limits: any;
    usage: {
      daily: { count: number };
      monthly: { count: number };
    };
    features: string[];
  };
}

// Subscription access levels
export const SUBSCRIPTION_LIMITS = {
  free: {
    dailyCompressions: 5,
    monthlyCompressions: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    features: ['basic_compression']
  },
  basic: {
    dailyCompressions: 20,
    monthlyCompressions: 100,
    maxFileSize: 25 * 1024 * 1024, // 25MB
    features: ['basic_compression', 'priority_processing', 'advanced_settings']
  },
  pro: {
    dailyCompressions: 100,
    monthlyCompressions: 1000,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    features: ['basic_compression', 'priority_processing', 'advanced_settings', 'batch_processing', 'api_access']
  },
  enterprise: {
    dailyCompressions: 1000,
    monthlyCompressions: 10000,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    features: ['basic_compression', 'priority_processing', 'advanced_settings', 'batch_processing', 'api_access', 'white_label', 'custom_integrations']
  }
};

// Check if user has active subscription
export const requireSubscription = (minPlan: keyof typeof SUBSCRIPTION_LIMITS = 'basic') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
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

      // Check if user has required subscription level
      const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
      const userPlanIndex = planHierarchy.indexOf(user.subscriptionPlan);
      const requiredPlanIndex = planHierarchy.indexOf(minPlan);

      if (userPlanIndex < requiredPlanIndex) {
        res.status(403).json({
          success: false,
          message: `${minPlan} subscription or higher required`,
          userPlan: user.subscriptionPlan,
          requiredPlan: minPlan,
        });
        return;
      }

      // Check if subscription is active (not just plan level)
      if (user.subscriptionPlan !== 'free') {
        const subscription = await Subscription.findOne({
          where: { userId: user.id },
          order: [['createdAt', 'DESC']],
        });

        if (!subscription || !subscription.isActive()) {
          res.status(403).json({
            success: false,
            message: 'Active subscription required',
            subscriptionStatus: subscription?.status || 'none',
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Subscription middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  };
};

// Check feature access
export const requireFeature = (feature: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
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

      const userPlan = user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS;
      const planFeatures = SUBSCRIPTION_LIMITS[userPlan]?.features || [];

      if (!planFeatures.includes(feature)) {
        res.status(403).json({
          success: false,
          message: `Feature '${feature}' not available in your current plan`,
          userPlan: user.subscriptionPlan,
          availableFeatures: planFeatures,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Feature access middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  };
};

// Check usage limits
export const checkUsageLimit = (limitType: 'daily' | 'monthly', operation: 'compression') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
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

      const userPlan = user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS;
      const planLimits = SUBSCRIPTION_LIMITS[userPlan];

      if (!planLimits) {
        res.status(400).json({
          success: false,
          message: 'Invalid subscription plan',
        });
        return;
      }

      // Get usage count based on limit type
      let usageCount = 0;
      let limitValue = 0;
      const now = new Date();

      if (limitType === 'daily') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const { count } = await user.getUsageCount('compression', startOfDay, now);
        usageCount = count;
        limitValue = planLimits.dailyCompressions;
      } else if (limitType === 'monthly') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const { count } = await user.getUsageCount('compression', startOfMonth, now);
        usageCount = count;
        limitValue = planLimits.monthlyCompressions;
      }

      if (usageCount >= limitValue) {
        res.status(429).json({
          success: false,
          message: `${limitType} limit exceeded`,
          usage: {
            current: usageCount,
            limit: limitValue,
            resetTime: limitType === 'daily' ? 
              new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) :
              new Date(now.getFullYear(), now.getMonth() + 1, 1)
          },
          upgradeMessage: userPlan === 'free' ? 'Upgrade to a paid plan for higher limits' : 'Upgrade your plan for higher limits',
        });
        return;
      }

      // Add usage info to request for tracking
      req.usage = {
        current: usageCount,
        limit: limitValue,
        remaining: limitValue - usageCount,
        plan: userPlan,
      };

      next();
    } catch (error) {
      console.error('Usage limit middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  };
};

// Check file size limit
export const checkFileSizeLimit = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
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

      const userPlan = user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS;
      const planLimits = SUBSCRIPTION_LIMITS[userPlan];

      if (!planLimits) {
        res.status(400).json({
          success: false,
          message: 'Invalid subscription plan',
        });
        return;
      }

      // Check if file size exceeds plan limit
      const files = req.files as any;
      if (files && files.pdf) {
        const fileSize = Array.isArray(files.pdf) ? files.pdf[0].size : files.pdf.size;
        
        if (fileSize > planLimits.maxFileSize) {
          const maxSizeMB = Math.round(planLimits.maxFileSize / (1024 * 1024));
          const fileSizeMB = Math.round(fileSize / (1024 * 1024));
          
          res.status(413).json({
            success: false,
            message: `File size exceeds plan limit`,
            fileSize: fileSizeMB,
            maxSize: maxSizeMB,
            plan: userPlan,
            upgradeMessage: `Upgrade your plan to process files up to ${maxSizeMB}MB`,
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('File size limit middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  };
};

// Get user subscription info
export const getSubscriptionInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next();
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next();
    }

    const userPlan = user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS;
    const planLimits = SUBSCRIPTION_LIMITS[userPlan];

    // Get current usage
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyUsage = await user.getUsageCount('compression', startOfDay, now);
    const monthlyUsage = await user.getUsageCount('compression', startOfMonth, now);

    req.subscriptionInfo = {
      plan: userPlan,
      status: user.subscriptionStatus,
      limits: planLimits,
      usage: {
        daily: dailyUsage,
        monthly: monthlyUsage,
      },
      features: planLimits.features,
    };

    next();
  } catch (error) {
    console.error('Get subscription info error:', error);
    next();
  }
};

export default {
  requireSubscription,
  requireFeature,
  checkUsageLimit,
  checkFileSizeLimit,
  getSubscriptionInfo,
  SUBSCRIPTION_LIMITS,
};