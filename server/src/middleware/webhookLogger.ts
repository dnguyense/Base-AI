import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

interface WebhookRequest extends Request {
  webhookId?: string;
  webhookTimestamp?: Date;
}

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Generate unique webhook ID
const generateWebhookId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `wh_${timestamp}_${random}`;
};

// Log webhook events to file and console
const logWebhookEvent = (data: any) => {
  const logEntry = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  // Console log for development
  console.log('📥 Webhook Event:', JSON.stringify(logEntry, null, 2));

  // File log for production
  const logFile = path.join(logsDir, `webhook-${new Date().toISOString().split('T')[0]}.log`);
  const logLine = JSON.stringify(logEntry) + '\n';
  
  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error('Failed to write webhook log:', err);
    }
  });
};

// Webhook logging middleware
export const webhookLogger = (req: WebhookRequest, res: Response, next: NextFunction) => {
  const webhookId = generateWebhookId();
  const startTime = Date.now();

  // Attach webhook metadata to request
  req.webhookId = webhookId;
  req.webhookTimestamp = new Date();

  // Extract Stripe event details
  const stripeSignature = req.headers['stripe-signature'];
  const userAgent = req.headers['user-agent'];
  const contentLength = req.headers['content-length'];

  // Log incoming webhook
  logWebhookEvent({
    type: 'webhook_received',
    webhookId,
    method: req.method,
    url: req.url,
    headers: {
      'stripe-signature': stripeSignature ? 'present' : 'missing',
      'user-agent': userAgent,
      'content-length': contentLength,
    },
    ip: req.ip || req.connection.remoteAddress,
    body_size: req.body ? JSON.stringify(req.body).length : 0,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    logWebhookEvent({
      type: 'webhook_response',
      webhookId,
      status_code: res.statusCode,
      response_time_ms: responseTime,
      response_data: data,
      success: res.statusCode < 400,
    });

    return originalJson.call(this, data);
  };

  // Handle response errors
  res.on('error', (error) => {
    logWebhookEvent({
      type: 'webhook_error',
      webhookId,
      error: {
        message: error.message,
        stack: error.stack,
      },
      response_time_ms: Date.now() - startTime,
    });
  });

  next();
};

// Get webhook logs for admin/debugging purposes
export const getWebhookLogs = async (date?: string): Promise<any[]> => {
  try {
    const logDate = date || new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `webhook-${logDate}.log`);

    if (!fs.existsSync(logFile)) {
      return [];
    }

    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return { error: 'Failed to parse log line', line };
      }
    });
  } catch (error) {
    console.error('Failed to read webhook logs:', error);
    return [];
  }
};

// Clean up old log files (keep last 30 days)
export const cleanupOldLogs = () => {
  try {
    const files = fs.readdirSync(logsDir);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      if (file.startsWith('webhook-') && file.endsWith('.log')) {
        const dateStr = file.replace('webhook-', '').replace('.log', '');
        const fileDate = new Date(dateStr);
        
        if (fileDate < thirtyDaysAgo) {
          const filePath = path.join(logsDir, file);
          fs.unlinkSync(filePath);
          console.log(`Deleted old webhook log: ${file}`);
        }
      }
    });
  } catch (error) {
    console.error('Failed to cleanup old webhook logs:', error);
  }
};

export default webhookLogger;