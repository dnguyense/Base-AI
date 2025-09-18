"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionPlan = exports.reactivateSubscription = exports.cancelSubscription = exports.getUsageStatistics = exports.getBillingHistory = exports.getCurrentSubscription = exports.getSubscriptionPlans = void 0;
const stripe_1 = __importDefault(require("stripe"));
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const subscription_1 = require("../middleware/subscription");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-07-30.basil',
});
const getSubscriptionPlans = async (req, res) => {
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
                limits: subscription_1.SUBSCRIPTION_LIMITS.free,
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
                limits: subscription_1.SUBSCRIPTION_LIMITS.basic,
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
                limits: subscription_1.SUBSCRIPTION_LIMITS.pro,
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
                limits: subscription_1.SUBSCRIPTION_LIMITS.enterprise,
                popular: false
            }
        ];
        res.json({
            success: true,
            data: { plans },
        });
    }
    catch (error) {
        console.error('Get subscription plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription plans',
        });
    }
};
exports.getSubscriptionPlans = getSubscriptionPlans;
const getCurrentSubscription = async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const subscription = await Subscription_1.default.findOne({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']],
        });
        const currentPlan = subscription_1.SUBSCRIPTION_LIMITS[user.subscriptionPlan] || subscription_1.SUBSCRIPTION_LIMITS.free;
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
    }
    catch (error) {
        console.error('Get current subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription details',
        });
    }
};
exports.getCurrentSubscription = getCurrentSubscription;
const getBillingHistory = async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (!user.stripeCustomerId) {
            res.json({
                success: true,
                data: {
                    invoices: [],
                    hasMore: false,
                },
            });
            return;
        }
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
    }
    catch (error) {
        console.error('Get billing history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch billing history',
        });
    }
};
exports.getBillingHistory = getBillingHistory;
const getUsageStatistics = async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const currentPlan = subscription_1.SUBSCRIPTION_LIMITS[user.subscriptionPlan] || subscription_1.SUBSCRIPTION_LIMITS.free;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const dailyUsage = Math.floor(Math.random() * (currentPlan.dailyCompressions * 0.7));
        const monthlyUsage = Math.floor(Math.random() * (currentPlan.monthlyCompressions * 0.5));
        const usageData = {
            current: {
                plan: user.subscriptionPlan,
                limits: currentPlan,
                usage: {
                    daily: {
                        used: dailyUsage,
                        limit: currentPlan.dailyCompressions,
                        remaining: Math.max(0, currentPlan.dailyCompressions - dailyUsage),
                        resetTime: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
                    },
                    monthly: {
                        used: monthlyUsage,
                        limit: currentPlan.monthlyCompressions,
                        remaining: Math.max(0, currentPlan.monthlyCompressions - monthlyUsage),
                        resetTime: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1),
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
    }
    catch (error) {
        console.error('Get usage statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch usage statistics',
        });
    }
};
exports.getUsageStatistics = getUsageStatistics;
const cancelSubscription = async (req, res) => {
    try {
        const { immediately = false } = req.body;
        const subscription = await Subscription_1.default.findOne({
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
        const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: !immediately,
            ...(immediately && { cancel_at: Math.floor(Date.now() / 1000) }),
        });
        await subscription.update({
            cancelAtPeriodEnd: !immediately,
            ...(immediately && {
                status: 'canceled',
                canceledAt: new Date()
            }),
        });
        if (immediately) {
            const user = await User_1.default.findByPk(req.user.id);
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
    }
    catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription',
        });
    }
};
exports.cancelSubscription = cancelSubscription;
const reactivateSubscription = async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findOne({
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
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
        });
        await subscription.update({
            cancelAtPeriodEnd: false,
            canceledAt: undefined,
        });
        res.json({
            success: true,
            message: 'Subscription reactivated successfully',
            data: {
                subscription: subscription.toJSON(),
            },
        });
    }
    catch (error) {
        console.error('Reactivate subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reactivate subscription',
        });
    }
};
exports.reactivateSubscription = reactivateSubscription;
const updateSubscriptionPlan = async (req, res) => {
    try {
        const { newPlan, interval = 'month' } = req.body;
        if (!['basic', 'pro', 'enterprise'].includes(newPlan)) {
            res.status(400).json({
                success: false,
                message: 'Invalid subscription plan',
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
        const subscription = await Subscription_1.default.findOne({
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
        const priceIdKey = `STRIPE_${newPlan.toUpperCase()}_${interval.toUpperCase()}LY_PRICE_ID`;
        const newPriceId = process.env[priceIdKey];
        if (!newPriceId) {
            res.status(400).json({
                success: false,
                message: `Price configuration not found for ${newPlan} ${interval} plan`,
            });
            return;
        }
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
        await subscription.update({
            plan: newPlan,
            interval: interval,
            stripePriceId: newPriceId,
            amount: updatedSubscription.items?.data?.[0]?.price?.unit_amount || 0,
            currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
            metadata: updatedSubscription.metadata,
        });
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
    }
    catch (error) {
        console.error('Update subscription plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update subscription plan',
        });
    }
};
exports.updateSubscriptionPlan = updateSubscriptionPlan;
exports.default = {
    getSubscriptionPlans: exports.getSubscriptionPlans,
    getCurrentSubscription: exports.getCurrentSubscription,
    getBillingHistory: exports.getBillingHistory,
    getUsageStatistics: exports.getUsageStatistics,
    cancelSubscription: exports.cancelSubscription,
    reactivateSubscription: exports.reactivateSubscription,
    updateSubscriptionPlan: exports.updateSubscriptionPlan,
};
//# sourceMappingURL=subscription.js.map