import express from 'express';
import { body } from 'express-validator';
import { handleStripeWebhook } from '../controllers/payment';
import { webhookLogger } from '../middleware/webhookLogger';
import { webhookSecurity } from '../middleware/webhookSecurity';

const router = express.Router();

// Stripe webhook endpoint
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }), // Raw body needed for Stripe signature verification
  webhookSecurity, // Custom middleware for additional security
  webhookLogger, // Log all webhook events
  handleStripeWebhook
);

// Health check for webhook endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;