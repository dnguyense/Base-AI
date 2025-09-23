// @ts-nocheck
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Op } from 'sequelize';
import User from '../models/User';
import Subscription from '../models/Subscription';
import { SUBSCRIPTION_LIMITS } from '../middleware/subscription';
import { env } from '../config/env';
import { auditLogService } from '../services/auditLogService';


// Stripe configuration
const stripe = new Stripe(env.stripe.secretKey || '', {
  apiVersion: '2025-07-30.basil',
});

interface AuthRequest extends Request {
  user?: any;
  subscription?: any;
}

// Get subscription plans (public endpoint)
export const getSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for trying out our service',
        price: 0,
        features: [
          '5 compressions per day',
          '10 compressions per month',
          'Up to 5MB file size',
          'Basic compression'
        ],
        limits: SUBSCRIPTION_LIMITS.free,
        popular: false
      },
      {
        id: 'basic',
        name: 'Basic',
        description: 'Perfect for personal use',
        price: 999,
        features: [
          '20 compressions per day',
          '100 compressions per month',
          'Up to 25MB file size',
          'Priority processing',
          'Advanced compression settings'
        ],
        limits: SUBSCRIPTION_LIMITS.basic,
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'For professionals and small teams',
        price: 1999,
        features: [
          '100 compressions per day',
          '1,000 compressions per month',
          'Up to 100MB file size',
          'Batch processing',
          'API access',
          'Priority support'
        ],
        limits: SUBSCRIPTION_LIMITS.pro,
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large teams and organizations',
        price: 4999,
        features: [
          '1,000 compressions per day',
          '10,000 compressions per month',
          'Up to 500MB file size',
          'White-label solutions',
          'Custom integrations',
          'Dedicated support'
        ],
        limits: SUBSCRIPTION_LIMITS.enterprise,
        popular: false
      }
    ];

    res.json({
      success: true,
      data: { plans },
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
    });
  }
};

// Get current user's subscription details
export const getCurrentSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const subscription = await Subscription.findOne({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
    });

    const currentPlan = SUBSCRIPTION_LIMITS[user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;

    const subscriptionData = {
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      limits: currentPlan,
      subscription: subscription ? {
        id: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        amount: subscription.amount,
        currency: subscription.currency,
        interval: subscription.interval,
        trialEnd: subscription.trialEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      } : null,
    };

    res.json({
      success: true,
      data: subscriptionData,
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details',
    });
  }
};

// Get billing history
export const getBillingHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (!(user as any).stripeCustomerId) {
      res.json({
        success: true,
        data: {
          invoices: [],
          hasMore: false,
        },
      });
      return;
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 10,
      status: 'paid',
    });

    const formattedInvoices = invoices.data.map(invoice => {
      return {
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        paidAt: invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
        description: invoice.description,
        invoiceUrl: invoice.hosted_invoice_url,
        downloadUrl: invoice.invoice_pdf,
        subscriptionId: typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id || null,
      };
    });

    res.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        hasMore: invoices.has_more,
      },
    });
  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing history',
    });
  }
};

// Get usage statistics
export const getUsageStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const currentPlan = SUBSCRIPTION_LIMITS[user.subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;
    
    // Calculate usage periods
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // This is a placeholder - in a real implementation, you'd have a ProcessedFiles table
    // For now, we'll return mock usage data based on the subscription limits
    const dailyUsage = Math.floor(Math.random() * (currentPlan.dailyCompressions * 0.7)); // Mock 0-70% usage
    const monthlyUsage = Math.floor(Math.random() * (currentPlan.monthlyCompressions * 0.5)); // Mock 0-50% usage

    const usageData = {
      current: {
        plan: user.subscriptionPlan,
        limits: currentPlan,
        usage: {
          daily: {
            used: dailyUsage,
            limit: currentPlan.dailyCompressions,
            remaining: Math.max(0, currentPlan.dailyCompressions - dailyUsage),
            resetTime: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          },
          monthly: {
            used: monthlyUsage,
            limit: currentPlan.monthlyCompressions,
            remaining: Math.max(0, currentPlan.monthlyCompressions - monthlyUsage),
            resetTime: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1), // Next month
          },
        },
      },
      history: {
        lastWeek: {
          compressions: Math.floor(Math.random() * 50),
          totalSizeReduced: Math.floor(Math.random() * 500) + 'MB',
        },
        lastMonth: {
          compressions: monthlyUsage,
          totalSizeReduced: Math.floor(monthlyUsage * 2.5) + 'MB',
        },
      },
    };

    res.json({
      success: true,
      data: usageData,
    });
  } catch (error) {
    console.error('Get usage statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage statistics',
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { immediately = false } = req.body;
    
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!subscription || !subscription.isActive()) {
      res.status(404).json({
        success: false,
        message: 'Active subscription not found',
      });
      return;
    }

    // Cancel subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: !immediately,
        ...(immediately && { cancel_at: Math.floor(Date.now() / 1000) }),
      }
    );

    // Update local subscription
    await subscription.update({
      cancelAtPeriodEnd: !immediately,
      ...(immediately && { 
        status: 'canceled',
        canceledAt: new Date()
      }),
    });

    await auditLogService.logSubscriptionChange({
      userId: subscription.userId,
      actorEmail: req.user?.email,
      success: true,
      metadata: {
        subscriptionId: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        plan: subscription.plan,
        status: immediately ? 'canceled' : subscription.status,
        interval: subscription.interval,
        reason: immediately ? 'cancel_immediate' : 'cancel_period_end',
      },
    });

    // Update user subscription status if canceled immediately
    if (immediately) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        await user.update({
          subscriptionStatus: 'canceled',
          subscriptionPlan: 'free',
        });
      }
    }

    res.json({
      success: true,
      message: immediately 
        ? 'Subscription canceled immediately'
        : 'Subscription will cancel at the end of the current billing period',
      data: {
        subscription: subscription.toJSON(),
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    await auditLogService.logSubscriptionChange({
      userId: req.user?.id,
      actorEmail: req.user?.email,
      success: false,
      metadata: {
        reason: 'cancel_subscription_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
    });
  }
};

// Reactivate subscription
export const reactivateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
      return;
    }

    if (!subscription.cancelAtPeriodEnd) {
      res.status(400).json({
        success: false,
        message: 'Subscription is not scheduled for cancellation',
      });
      return;
    }

    // Reactivate subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update local subscription
    await subscription.update({
      cancelAtPeriodEnd: false,
      canceledAt: undefined,
    });

    await auditLogService.logSubscriptionChange({
      userId: subscription.userId,
      actorEmail: req.user?.email,
      success: true,
      metadata: {
        subscriptionId: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        plan: subscription.plan,
        status: subscription.status,
        interval: subscription.interval,
        reason: 'reactivate_subscription',
      },
    });

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        subscription: subscription.toJSON(),
      },
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    await auditLogService.logSubscriptionChange({
      userId: req.user?.id,
      actorEmail: req.user?.email,
      success: false,
      metadata: {
        reason: 'reactivate_subscription_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
    });
  }
};

// Update subscription plan (upgrade/downgrade)
export const updateSubscriptionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newPlan, interval = 'month' } = req.body;

    if (!['basic', 'pro', 'enterprise'].includes(newPlan)) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription plan',
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

    const subscription = await Subscription.findOne({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!subscription || !subscription.isActive()) {
      res.status(404).json({
        success: false,
        message: 'Active subscription not found',
      });
      return;
    }

    // Get new price ID from environment variables
    const priceKey = `${newPlan}${interval === 'month' ? 'Monthly' : 'Yearly'}` as keyof typeof env.stripe.priceIds;
    const newPriceId = env.stripe.priceIds[priceKey];

    if (!newPriceId) {
      res.status(400).json({
        success: false,
        message: `Price configuration not found for ${newPlan} ${interval} plan`,
      });
      return;
    }

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: stripeSubscription.items.data[0]?.id,
        price: newPriceId,
      }],
      proration_behavior: 'always_invoice',
      metadata: {
        ...stripeSubscription.metadata,
        plan: newPlan,
        interval: interval,
      },
    });

    // Update local subscription
    await subscription.update({
      plan: newPlan as 'basic' | 'pro' | 'enterprise',
      interval: interval as 'month' | 'year',
      stripePriceId: newPriceId,
      amount: updatedSubscription.items?.data?.[0]?.price?.unit_amount || 0,
      currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
      metadata: updatedSubscription.metadata,
    });

    await auditLogService.logSubscriptionChange({
      userId: subscription.userId,
      actorEmail: req.user?.email,
      success: true,
      metadata: {
        subscriptionId: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        plan: newPlan,
        interval,
        status: subscription.status,
        reason: 'update_subscription_plan',
        metadata: updatedSubscription.metadata,
      },
    });

    // Update user subscription plan
    await user.update({
      subscriptionPlan: newPlan,
    });

    res.json({
      success: true,
      message: `Subscription updated to ${newPlan} plan successfully`,
      data: {
        subscription: subscription.toJSON(),
      },
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    await auditLogService.logSubscriptionChange({
      userId: req.user?.id,
      actorEmail: req.user?.email,
      success: false,
      metadata: {
        reason: 'update_subscription_plan_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription plan',
    });
  }
};

export default {
  getSubscriptionPlans,
  getCurrentSubscription,
  getBillingHistory,
  getUsageStatistics,
  cancelSubscription,
  reactivateSubscription,
  updateSubscriptionPlan,
};
