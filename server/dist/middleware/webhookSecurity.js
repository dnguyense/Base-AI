"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityStatus = exports.webhookSecurity = exports.idempotencyCheck = exports.validateWebhookRequest = exports.ipWhitelist = exports.verifyWebhookSignature = exports.webhookRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.webhookRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many webhook requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        const stripeIPs = [
            '54.187.174.169',
            '54.187.205.235',
            '54.187.216.72',
            '54.241.31.99',
            '54.241.31.102',
            '54.241.34.107'
        ];
        return stripeIPs.includes(req.ip || '');
    }
});
const verifyWebhookSignature = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        console.warn('Webhook request missing Stripe signature', {
            webhookId: req.webhookId,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
            success: false,
            message: 'Missing webhook signature',
        });
    }
    const elements = signature.split(',');
    const timestampElement = elements.find(element => element.startsWith('t='));
    const signatureElements = elements.filter(element => element.startsWith('v1='));
    if (!timestampElement || signatureElements.length === 0) {
        console.warn('Invalid webhook signature format', {
            webhookId: req.webhookId,
            signature,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
            success: false,
            message: 'Invalid signature format',
        });
    }
    const timestamp = parseInt(timestampElement.replace('t=', ''), 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const tolerance = 5 * 60;
    if (currentTime - timestamp > tolerance) {
        console.warn('Webhook timestamp too old', {
            webhookId: req.webhookId,
            timestamp,
            currentTime,
            difference: currentTime - timestamp,
            tolerance,
            ip: req.ip,
        });
        return res.status(400).json({
            success: false,
            message: 'Webhook timestamp too old',
        });
    }
    req.webhookSignature = signature;
    req.webhookTimestamp = new Date(timestamp * 1000);
    next();
};
exports.verifyWebhookSignature = verifyWebhookSignature;
const ipWhitelist = (req, res, next) => {
    const allowedIPs = [];
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }
    const clientIP = req.ip || req.connection.remoteAddress || '';
    if (allowedIPs.length === 0) {
        return next();
    }
    if (!allowedIPs.includes(clientIP)) {
        console.warn('Webhook request from unauthorized IP', {
            ip: clientIP,
            timestamp: new Date().toISOString(),
            headers: req.headers,
        });
        return res.status(403).json({
            success: false,
            message: 'Unauthorized IP address',
        });
    }
    next();
};
exports.ipWhitelist = ipWhitelist;
const validateWebhookRequest = (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
        console.warn('Invalid webhook content type', {
            webhookId: req.webhookId,
            contentType,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
            success: false,
            message: 'Invalid content type. Expected application/json',
        });
    }
    if (!req.body) {
        console.warn('Empty webhook body', {
            webhookId: req.webhookId,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
            success: false,
            message: 'Empty request body',
        });
    }
    if (typeof req.body === 'object' && (!req.body.id || !req.body.type)) {
        console.warn('Invalid webhook body structure', {
            webhookId: req.webhookId,
            hasId: !!req.body.id,
            hasType: !!req.body.type,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
            success: false,
            message: 'Invalid webhook event structure',
        });
    }
    next();
};
exports.validateWebhookRequest = validateWebhookRequest;
const processedWebhooks = new Map();
const idempotencyCheck = (req, res, next) => {
    if (!req.body || !req.body.id) {
        return next();
    }
    const eventId = req.body.id;
    const currentTime = Date.now();
    if (processedWebhooks.has(eventId)) {
        const processedTime = processedWebhooks.get(eventId);
        const timeDiff = currentTime - processedTime;
        if (timeDiff < 60 * 60 * 1000) {
            console.info('Duplicate webhook event ignored', {
                eventId,
                webhookId: req.webhookId,
                timeSinceProcessed: timeDiff,
                ip: req.ip,
            });
            return res.json({
                success: true,
                message: 'Event already processed',
                eventId,
            });
        }
    }
    processedWebhooks.set(eventId, currentTime);
    const twoHoursAgo = currentTime - (2 * 60 * 60 * 1000);
    for (const [id, timestamp] of processedWebhooks.entries()) {
        if (timestamp < twoHoursAgo) {
            processedWebhooks.delete(id);
        }
    }
    next();
};
exports.idempotencyCheck = idempotencyCheck;
exports.webhookSecurity = [
    exports.webhookRateLimit,
    exports.ipWhitelist,
    exports.verifyWebhookSignature,
    exports.validateWebhookRequest,
    exports.idempotencyCheck,
];
const getSecurityStatus = () => {
    return {
        rateLimit: {
            enabled: true,
            windowMs: 15 * 60 * 1000,
            max: 100,
        },
        signatureVerification: {
            enabled: true,
            tolerance: 5 * 60,
        },
        ipWhitelist: {
            enabled: process.env.NODE_ENV === 'production',
            allowedIPs: process.env.NODE_ENV === 'production' ? 'configured' : 'development_mode',
        },
        idempotency: {
            enabled: true,
            cacheSize: processedWebhooks.size,
            cacheDuration: '1 hour',
        },
    };
};
exports.getSecurityStatus = getSecurityStatus;
exports.default = exports.webhookSecurity;
//# sourceMappingURL=webhookSecurity.js.map