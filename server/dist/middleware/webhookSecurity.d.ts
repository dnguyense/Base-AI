import { Request, Response, NextFunction } from 'express';
interface WebhookRequest extends Request {
    webhookId?: string;
    webhookTimestamp?: Date;
}
export declare const webhookRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const verifyWebhookSignature: (req: WebhookRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const ipWhitelist: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateWebhookRequest: (req: WebhookRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const idempotencyCheck: (req: WebhookRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const webhookSecurity: (import("express-rate-limit").RateLimitRequestHandler | ((req: WebhookRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>))[];
export declare const getSecurityStatus: () => {
    rateLimit: {
        enabled: boolean;
        windowMs: number;
        max: number;
    };
    signatureVerification: {
        enabled: boolean;
        tolerance: number;
    };
    ipWhitelist: {
        enabled: boolean;
        allowedIPs: string;
    };
    idempotency: {
        enabled: boolean;
        cacheSize: number;
        cacheDuration: string;
    };
};
export default webhookSecurity;
//# sourceMappingURL=webhookSecurity.d.ts.map