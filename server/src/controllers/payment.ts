// @ts-nocheck
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Subscription from '../models/Subscription';
import { sendSubscriptionEmail } from '../services/email';
import { subscriptionService } from '../services/subscriptionService';
import { env } from '../config/env';

// Stripe configuration
const stripe = new Stripe(env.stripe.secretKey || '', {
  apiVersion: '2025-07-30.basil',
});

const STRIPE_WEBHOOK_SECRET = env.stripe.webhookSecret;
const CLIENT_URL = env.app.clientUrl;

interface AuthRequest extends Request {
  user?: any;
}

// Subscription plan configurations
const SUBSCRIPTION_PLANS = {
  basic: {
    month: { priceId: env.stripe.priceIds.basicMonthly, amount: 999 },
    year: { priceId: env.stripe.priceIds.basicYearly, amount: 9990 }
  },
  pro: {
    month: { priceId: env.stripe.priceIds.proMonthly, amount: 1999 },
    year: { priceId: env.stripe.priceIds.proYearly, amount: 19990 }
  },
  enterprise: {
    month: { priceId: env.stripe.priceIds.enterpriseMonthly, amount: 4999 },
    year: { priceId: env.stripe.priceIds.enterpriseYearly, amount: 49990 }
  }
};

// Validation rules
export const createCheckoutValidation = [
  body('plan')
    .isIn(['basic', 'pro', 'enterprise'])
    .withMessage('Invalid plan selected'),
  body('interval')
    .isIn(['month', 'year'])
    .withMessage('Invalid billing interval'),
];

// Create Stripe customer
const createStripeCustomer = async (user: any): Promise<Stripe.Customer> => {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
    metadata: {
      userId: user.id.toString(),
    },
  });

  // Update user with Stripe customer ID
  await user.update({ stripeCustomerId: customer.id });
  return customer;
};

// Create checkout session
export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { plan, interval } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await createStripeCustomer(user);
      customerId = customer.id;
    }

    // Get price configuration
    const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    const priceConfig = planConfig[interval as keyof typeof planConfig];

    if (!priceConfig.priceId) {
      res.status(400).json({
        success: false,
        message: `Stripe price ID not configured for ${plan} ${interval} plan`,
      });
      return;
    }

    // Create checkout session
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
  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
    });
  }
};

// Get subscription plans
export const getSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
    });
  }
};

// Get user's current subscription
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

    // Get subscription using optimized cached service
    const subscription = await subscriptionService.getCurrentSubscription(user.id);

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
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { immediately = false } = req.body;
    
    // Get subscription using optimized cached service
    const subscription = await subscriptionService.getCurrentSubscription(req.user.id);

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

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        subscription: subscription.toJSON(),
      },
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
    });
  }
};

// Handle Stripe webhooks
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).json({
      success: false,
      message: 'Missing Stripe signature',
    });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
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
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook handling failed',
    });
  }
};

// Handle subscription creation/update
const handleSubscriptionUpdate = async (stripeSubscription: Stripe.Subscription) => {
  const userId = parseInt(stripeSubscription.metadata.userId);
  const plan = stripeSubscription.metadata.plan;
  const interval = stripeSubscription.metadata.interval;

  if (!userId || !plan || !interval) {
    console.error('Missing metadata in subscription:', stripeSubscription.id);
    return;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    console.error('User not found for subscription:', stripeSubscription.id);
    return;
  }

  // Find or create subscription record
  const [subscription] = await Subscription.findOrCreate({
    where: { stripeSubscriptionId: stripeSubscription.id },
    defaults: {
      userId,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0]?.price?.id || '',
      status: stripeSubscription.status as 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid',
      plan: plan as 'basic' | 'pro' | 'enterprise',
      interval: interval as 'month' | 'year',
      currentPeriodStart: new Date((stripeSubscription.current_period_start as number) * 1000),
      currentPeriodEnd: new Date((stripeSubscription.current_period_end as number) * 1000),
      trialStart: stripeSubscription.trial_start ? new Date((stripeSubscription.trial_start as number) * 1000) : undefined,
      trialEnd: stripeSubscription.trial_end ? new Date((stripeSubscription.trial_end as number) * 1000) : undefined,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
      amount: (stripeSubscription.items.data[0]?.price?.unit_amount as number) || 0,
      currency: stripeSubscription.items.data[0]?.price?.currency || 'usd',
      metadata: stripeSubscription.metadata,
    },
  });

  // Update existing subscription
  await subscription.update({
    status: stripeSubscription.status as 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid',
    currentPeriodStart: new Date((stripeSubscription.current_period_start as number) * 1000),
    currentPeriodEnd: new Date((stripeSubscription.current_period_end as number) * 1000),
    trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : undefined,
    trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
    canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : undefined,
    metadata: stripeSubscription.metadata,
  });

  // Update user subscription status
  await user.update({
    subscriptionStatus: stripeSubscription.status as 'none' | 'active' | 'past_due' | 'canceled' | 'unpaid',
    subscriptionPlan: plan,
  });

  // Send subscription confirmation email
  if (stripeSubscription.status === 'active') {
    try {
      await sendSubscriptionEmail(
        user.email,
        plan,
        subscription.amount,
        user.firstName
      );
    } catch (emailError) {
      console.error('Failed to send subscription email:', emailError);
    }
  }
};

// Handle subscription deletion
const handleSubscriptionDeleted = async (stripeSubscription: Stripe.Subscription) => {
  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.error('Subscription not found for deletion:', stripeSubscription.id);
    return;
  }

  // Update subscription status
  await subscription.update({
    status: 'canceled',
    canceledAt: new Date(),
  });

  // Update user subscription status
  const user = await User.findByPk(subscription.userId);
  if (user) {
    await user.update({
      subscriptionStatus: 'canceled',
      subscriptionPlan: 'free',
    });
  }
};

// Handle successful payment
const handlePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  if (invoice.subscription) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (subscription) {
      console.log(`Payment succeeded for subscription: ${subscription.id}`);
      // Additional logic for successful payment can be added here
    }
  }
};

// Handle failed payment
const handlePaymentFailed = async (invoice: Stripe.Invoice) => {
  if (invoice.subscription) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (subscription) {
      console.log(`Payment failed for subscription: ${subscription.id}`);
      // Additional logic for failed payment can be added here
      // e.g., send notification email, update subscription status
    }
  }
};

export default {
  createCheckoutSession,
  getSubscriptionPlans,
  getCurrentSubscription,
  cancelSubscription,
  reactivateSubscription,
  handleStripeWebhook,
};
