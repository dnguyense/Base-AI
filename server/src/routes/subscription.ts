import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCurrentSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionPlans,
  getBillingHistory,
  getUsageStatistics,
  updateSubscriptionPlan,
} from '../controllers/subscription';
import {
  requireSubscription,
  requireFeature,
  checkUsageLimit,
  getSubscriptionInfo,
} from '../middleware/subscription';

interface AuthRequest extends Request {
  user?: any;
  usage?: {
    current: number;
    limit: number;
    remaining: number;
    plan: string;
  };
}

const router = Router();

// Get subscription plans (public route)
router.get('/plans', getSubscriptionPlans);

// Protected routes - require authentication
router.use(authenticateToken);
router.use(getSubscriptionInfo);

// Get current user's subscription
router.get('/current', getCurrentSubscription);

// Get billing history
router.get('/billing-history', getBillingHistory);

// Get usage statistics
router.get('/usage', getUsageStatistics);

// Cancel subscription
router.post('/cancel', cancelSubscription);

// Reactivate subscription
router.post('/reactivate', reactivateSubscription);

// Update subscription plan (upgrade/downgrade)
router.post('/update-plan', updateSubscriptionPlan);

// Usage tracking endpoints
router.post('/track-usage/:operationType', 
  checkUsageLimit('daily', 'compression'),
  checkUsageLimit('monthly', 'compression'),
  async (req: AuthRequest, res: Response) => {
    // This endpoint tracks usage and returns current usage stats
    res.json({
      success: true,
      message: 'Usage tracked successfully',
      data: req.usage,
    });
  }
);

// Feature-specific routes
router.get('/features/batch-processing', 
  requireFeature('batch_processing'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Batch processing feature available',
      data: { feature: 'batch_processing' },
    });
  }
);

router.get('/features/api-access',
  requireFeature('api_access'),
  (req, res) => {
    res.json({
      success: true,
      message: 'API access feature available',
      data: { feature: 'api_access' },
    });
  }
);

export default router;