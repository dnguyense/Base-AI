"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_1 = require("../controllers/payment");
const webhookLogger_1 = require("../middleware/webhookLogger");
const webhookSecurity_1 = require("../middleware/webhookSecurity");
const router = express_1.default.Router();
router.post('/stripe', express_1.default.raw({ type: 'application/json' }), webhookSecurity_1.webhookSecurity, webhookLogger_1.webhookLogger, payment_1.handleStripeWebhook);
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Webhook endpoint is healthy',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=webhook.js.map