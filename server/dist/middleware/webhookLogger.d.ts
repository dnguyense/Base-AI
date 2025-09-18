import { Request, Response, NextFunction } from 'express';
interface WebhookRequest extends Request {
    webhookId?: string;
    webhookTimestamp?: Date;
}
export declare const webhookLogger: (req: WebhookRequest, res: Response, next: NextFunction) => void;
export declare const getWebhookLogs: (date?: string) => Promise<any[]>;
export declare const cleanupOldLogs: () => void;
export default webhookLogger;
//# sourceMappingURL=webhookLogger.d.ts.map