"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.reactivateSubscription = exports.cancelSubscription = exports.getCurrentSubscription = exports.getSubscriptionPlans = exports.createCheckoutSession = exports.createCheckoutValidation = void 0;
const stripe_1 = __importDefault(require("stripe"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const email_1 = require("../services/email");
const subscriptionService_1 = require("../services/subscriptionService");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-07-30.basil',
});
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SUBSCRIPTION_PLANS = {
    basic: {
        monthly: { priceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID, amount: 999 },
        yearly: { priceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID, amount: 9990 }
    },
    pro: {
        monthly: { priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID, amount: 1999 },
        yearly: { priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID, amount: 19990 }
    },
    enterprise: {
        monthly: { priceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID, amount: 4999 },
        yearly: { priceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID, amount: 49990 }
    }
};
exports.createCheckoutValidation = [
    (0, express_validator_1.body)('plan')
        .isIn(['basic', 'pro', 'enterprise'])
        .withMessage('Invalid plan selected'),
    (0, express_validator_1.body)('interval')
        .isIn(['month', 'year'])
        .withMessage('Invalid billing interval'),
];
const createStripeCustomer = async (user) => {
    const customer = await stripe.customers.create({
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
        metadata: {
            userId: user.id.toString(),
        },
    });
    await user.update({ stripeCustomerId: customer.id });
    return customer;
};
const createCheckoutSession = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }
        const { plan, interval } = req.body;
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await createStripeCustomer(user);
            customerId = customer.id;
        }
        const planConfig = SUBSCRIPTION_PLANS[plan];
        const priceConfig = planConfig[interval];
        if (!priceConfig.priceId) {
            res.status(400).json({
                success: false,
                message: `Stripe price ID not configured for ${plan} ${interval} plan`,
            });
            return;
        }
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/pricing`,
            metadata: {
                userId: user.id.toString(),
                plan,
                interval,
            },
            subscription_data: {
                metadata: {
                    userId: user.id.toString(),
                    plan,
                    interval,
                },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
        });
        res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url,
            },
        });
    }
    catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session',
        });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for personal use',
                features: [
                    '20 compressions per day',
                    '100 compressions per month',
                    'Priority processing',
                    'Advanced compression settings'
                ],
                pricing: {
                    monthly: { amount: 999, currency: 'usd' },
                    yearly: { amount: 9990, currency: 'usd', savings: 1998 }
                }
            },
            {
                id: 'pro',
                name: 'Pro',
                description: 'For professionals and small teams',
                features: [
                    '100 compressions per day',
                    '1,000 compressions per month',
                    'Batch processing',
                    'API access',
                    'Priority support'
                ],
                pricing: {
                    monthly: { amount: 1999, currency: 'usd' },
                    yearly: { amount: 19990, currency: 'usd', savings: 3998 }
                },
                popular: true
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'For large teams and organizations',
                features: [
                    '1,000 compressions per day',
                    '10,000 compressions per month',
                    'White-label solutions',
                    'Custom integrations',
                    'Dedicated support'
                ],
                pricing: {
                    monthly: { amount: 4999, currency: 'usd' },
                    yearly: { amount: 49990, currency: 'usd', savings: 9998 }
                }
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
        const subscription = await subscriptionService_1.subscriptionService.getCurrentSubscription(user.id);
        if (!subscription) {
            res.json({
                success: true,
                data: {
                    subscription: null,
                    status: 'none',
                },
            });
            return;
        }
        res.json({
            success: true,
            data: {
                subscription: subscription.toJSON(),
                status: subscription.status,
            },
        });
    }
    catch (error) {
        console.error('Get current subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription',
        });
    }
};
exports.getCurrentSubscription = getCurrentSubscription;
const cancelSubscription = async (req, res) => {
    try {
        const { immediately = false } = req.body;
        const subscription = await subscriptionService_1.subscriptionService.getCurrentSubscription(req.user.id);
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
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        res.status(400).json({
            success: false,
            message: 'Missing Stripe signature',
        });
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).json({
            success: false,
            message: 'Invalid webhook signature',
        });
        return;
    }
    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({ success: true, received: true });
    }
    catch (error) {
        console.error('Webhook handling error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook handling failed',
        });
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
const handleSubscriptionUpdate = async (stripeSubscription) => {
    const userId = parseInt(stripeSubscription.metadata.userId);
    const plan = stripeSubscription.metadata.plan;
    const interval = stripeSubscription.metadata.interval;
    if (!userId || !plan || !interval) {
        console.error('Missing metadata in subscription:', stripeSubscription.id);
        return;
    }
    const user = await User_1.default.findByPk(userId);
    if (!user) {
        console.error('User not found for subscription:', stripeSubscription.id);
        return;
    }
    const [subscription] = await Subscription_1.default.findOrCreate({
        where: { stripeSubscriptionId: stripeSubscription.id },
        defaults: {
            userId,
            stripeCustomerId: stripeSubscription.customer,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: stripeSubscription.items.data[0]?.price?.id || '',
            status: stripeSubscription.status,
            plan: plan,
            interval: interval,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : undefined,
            trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
            amount: stripeSubscription.items.data[0]?.price?.unit_amount || 0,
            currency: stripeSubscription.items.data[0]?.price?.currency || 'usd',
            metadata: stripeSubscription.metadata,
        },
    });
    await subscription.update({
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : undefined,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
        canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : undefined,
        metadata: stripeSubscription.metadata,
    });
    await user.update({
        subscriptionStatus: stripeSubscription.status,
        subscriptionPlan: plan,
    });
    if (stripeSubscription.status === 'active') {
        try {
            await (0, email_1.sendSubscriptionEmail)(user.email, plan, subscription.amount, user.firstName);
        }
        catch (emailError) {
            console.error('Failed to send subscription email:', emailError);
        }
    }
};
const handleSubscriptionDeleted = async (stripeSubscription) => {
    const subscription = await Subscription_1.default.findOne({
        where: { stripeSubscriptionId: stripeSubscription.id },
    });
    if (!subscription) {
        console.error('Subscription not found for deletion:', stripeSubscription.id);
        return;
    }
    await subscription.update({
        status: 'canceled',
        canceledAt: new Date(),
    });
    const user = await User_1.default.findByPk(subscription.userId);
    if (user) {
        await user.update({
            subscriptionStatus: 'canceled',
            subscriptionPlan: 'free',
        });
    }
};
const handlePaymentSucceeded = async (invoice) => {
    if (invoice.subscription) {
        const subscription = await Subscription_1.default.findOne({
            where: { stripeSubscriptionId: invoice.subscription },
        });
        if (subscription) {
            console.log(`Payment succeeded for subscription: ${subscription.id}`);
        }
    }
};
const handlePaymentFailed = async (invoice) => {
    if (invoice.subscription) {
        const subscription = await Subscription_1.default.findOne({
            where: { stripeSubscriptionId: invoice.subscription },
        });
        if (subscription) {
            console.log(`Payment failed for subscription: ${subscription.id}`);
        }
    }
};
exports.default = {
    createCheckoutSession: exports.createCheckoutSession,
    getSubscriptionPlans: exports.getSubscriptionPlans,
    getCurrentSubscription: exports.getCurrentSubscription,
    cancelSubscription: exports.cancelSubscription,
    reactivateSubscription: exports.reactivateSubscription,
    handleStripeWebhook: exports.handleStripeWebhook,
};
//# sourceMappingURL=payment.js.map