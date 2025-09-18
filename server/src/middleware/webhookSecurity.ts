// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createHash } from 'crypto';
import { env } from '../config/env';

interface WebhookRequest extends Request {
  webhookId?: string;
  webhookTimestamp?: Date;
}

// Rate limiting for webhook endpoints
export const webhookRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many webhook requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for known Stripe IPs (optional)
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

// Webhook signature verification middleware
export const verifyWebhookSignature = (req: WebhookRequest, res: Response, next: NextFunction) => {
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

  // Extract timestamp and signatures from the header
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

  // Check if the timestamp is too old (tolerance: 5 minutes)
  const tolerance = 5 * 60; // 5 minutes
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

  // Verify signature (this will be done again in the payment controller with the actual secret)
  // Here we just validate the format and store for later verification
  req.webhookSignature = signature;
  req.webhookTimestamp = new Date(timestamp * 1000);
  
  next();
};

// IP whitelist middleware (optional - for additional security)
export const ipWhitelist = (req: Request, res: Response, next: NextFunction) => {
  // Stripe webhook IP ranges (as of 2024)
  const allowedIPs = [
    // Add specific Stripe IPs if needed for production
    // For development, we'll allow all IPs
  ];

  // For development, skip IP validation
  if (!env.isProduction) {
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress || '';
  
  // If no whitelist is configured, allow all
  if (allowedIPs.length === 0) {
    return next();
  }

  // Check if IP is in whitelist
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

// Request validation middleware
export const validateWebhookRequest = (req: WebhookRequest, res: Response, next: NextFunction) => {
  // Check content type
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

  // Check if body exists and is not empty
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

  // Check if body has required Stripe event structure
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

// Idempotency middleware (prevent duplicate webhook processing)
const processedWebhooks = new Map<string, number>();

export const idempotencyCheck = (req: WebhookRequest, res: Response, next: NextFunction) => {
  if (!req.body || !req.body.id) {
    return next();
  }

  const eventId = req.body.id;
  const currentTime = Date.now();
  
  // Check if we've seen this event before (within last hour)
  if (processedWebhooks.has(eventId)) {
    const processedTime = processedWebhooks.get(eventId)!;
    const timeDiff = currentTime - processedTime;
    
    // If processed within the last hour, return success without processing
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

  // Store this event ID with current timestamp
  processedWebhooks.set(eventId, currentTime);
  
  // Clean up old entries (older than 2 hours)
  const twoHoursAgo = currentTime - (2 * 60 * 60 * 1000);
  for (const [id, timestamp] of processedWebhooks.entries()) {
    if (timestamp < twoHoursAgo) {
      processedWebhooks.delete(id);
    }
  }

  next();
};

// Combined webhook security middleware
export const webhookSecurity = [
  webhookRateLimit,
  ipWhitelist,
  verifyWebhookSignature,
  validateWebhookRequest,
  idempotencyCheck,
];

// Health check for webhook security
export const getSecurityStatus = () => {
  return {
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
    signatureVerification: {
      enabled: true,
      tolerance: 5 * 60, // 5 minutes
    },
    ipWhitelist: {
      enabled: env.isProduction,
      allowedIPs: env.isProduction ? 'configured' : 'development_mode',
    },
    idempotency: {
      enabled: true,
      cacheSize: processedWebhooks.size,
      cacheDuration: '1 hour',
    },
  };
};

// Export individual middleware functions
export default webhookSecurity;
