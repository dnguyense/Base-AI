"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldLogs = exports.getWebhookLogs = exports.webhookLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
const generateWebhookId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `wh_${timestamp}_${random}`;
};
const logWebhookEvent = (data) => {
    const logEntry = {
        ...data,
        timestamp: new Date().toISOString(),
    };
    console.log('📥 Webhook Event:', JSON.stringify(logEntry, null, 2));
    const logFile = path_1.default.join(logsDir, `webhook-${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';
    fs_1.default.appendFile(logFile, logLine, (err) => {
        if (err) {
            console.error('Failed to write webhook log:', err);
        }
    });
};
const webhookLogger = (req, res, next) => {
    const webhookId = generateWebhookId();
    const startTime = Date.now();
    req.webhookId = webhookId;
    req.webhookTimestamp = new Date();
    const stripeSignature = req.headers['stripe-signature'];
    const userAgent = req.headers['user-agent'];
    const contentLength = req.headers['content-length'];
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
    const originalJson = res.json;
    res.json = function (data) {
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
exports.webhookLogger = webhookLogger;
const getWebhookLogs = async (date) => {
    try {
        const logDate = date || new Date().toISOString().split('T')[0];
        const logFile = path_1.default.join(logsDir, `webhook-${logDate}.log`);
        if (!fs_1.default.existsSync(logFile)) {
            return [];
        }
        const content = fs_1.default.readFileSync(logFile, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line);
        return lines.map(line => {
            try {
                return JSON.parse(line);
            }
            catch (e) {
                return { error: 'Failed to parse log line', line };
            }
        });
    }
    catch (error) {
        console.error('Failed to read webhook logs:', error);
        return [];
    }
};
exports.getWebhookLogs = getWebhookLogs;
const cleanupOldLogs = () => {
    try {
        const files = fs_1.default.readdirSync(logsDir);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        files.forEach(file => {
            if (file.startsWith('webhook-') && file.endsWith('.log')) {
                const dateStr = file.replace('webhook-', '').replace('.log', '');
                const fileDate = new Date(dateStr);
                if (fileDate < thirtyDaysAgo) {
                    const filePath = path_1.default.join(logsDir, file);
                    fs_1.default.unlinkSync(filePath);
                    console.log(`Deleted old webhook log: ${file}`);
                }
            }
        });
    }
    catch (error) {
        console.error('Failed to cleanup old webhook logs:', error);
    }
};
exports.cleanupOldLogs = cleanupOldLogs;
exports.default = exports.webhookLogger;
//# sourceMappingURL=webhookLogger.js.map