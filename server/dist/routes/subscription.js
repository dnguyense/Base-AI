"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const subscription_1 = require("../controllers/subscription");
const subscription_2 = require("../middleware/subscription");
const router = (0, express_1.Router)();
router.get('/plans', subscription_1.getSubscriptionPlans);
router.use(auth_1.authenticateToken);
router.use(subscription_2.getSubscriptionInfo);
router.get('/current', subscription_1.getCurrentSubscription);
router.get('/billing-history', subscription_1.getBillingHistory);
router.get('/usage', subscription_1.getUsageStatistics);
router.post('/cancel', subscription_1.cancelSubscription);
router.post('/reactivate', subscription_1.reactivateSubscription);
router.post('/update-plan', subscription_1.updateSubscriptionPlan);
router.post('/track-usage/:operationType', (0, subscription_2.checkUsageLimit)('daily', 'compression'), (0, subscription_2.checkUsageLimit)('monthly', 'compression'), async (req, res) => {
    res.json({
        success: true,
        message: 'Usage tracked successfully',
        data: req.usage,
    });
});
router.get('/features/batch-processing', (0, subscription_2.requireFeature)('batch_processing'), (req, res) => {
    res.json({
        success: true,
        message: 'Batch processing feature available',
        data: { feature: 'batch_processing' },
    });
});
router.get('/features/api-access', (0, subscription_2.requireFeature)('api_access'), (req, res) => {
    res.json({
        success: true,
        message: 'API access feature available',
        data: { feature: 'api_access' },
    });
});
exports.default = router;
//# sourceMappingURL=subscription.js.map