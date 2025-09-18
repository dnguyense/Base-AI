import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
    usage?: {
        current: number;
        limit: number;
        remaining: number;
        plan: string;
    };
    subscriptionInfo?: {
        plan: string;
        status: string;
        limits: any;
        usage: {
            daily: {
                count: number;
            };
            monthly: {
                count: number;
            };
        };
        features: string[];
    };
}
export declare const SUBSCRIPTION_LIMITS: {
    free: {
        dailyCompressions: number;
        monthlyCompressions: number;
        maxFileSize: number;
        features: string[];
    };
    basic: {
        dailyCompressions: number;
        monthlyCompressions: number;
        maxFileSize: number;
        features: string[];
    };
    pro: {
        dailyCompressions: number;
        monthlyCompressions: number;
        maxFileSize: number;
        features: string[];
    };
    enterprise: {
        dailyCompressions: number;
        monthlyCompressions: number;
        maxFileSize: number;
        features: string[];
    };
};
export declare const requireSubscription: (minPlan?: keyof typeof SUBSCRIPTION_LIMITS) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireFeature: (feature: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkUsageLimit: (limitType: "daily" | "monthly", operation: "compression") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkFileSizeLimit: () => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSubscriptionInfo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    requireSubscription: (minPlan?: keyof typeof SUBSCRIPTION_LIMITS) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    requireFeature: (feature: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    checkUsageLimit: (limitType: "daily" | "monthly", operation: "compression") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    checkFileSizeLimit: () => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getSubscriptionInfo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    SUBSCRIPTION_LIMITS: {
        free: {
            dailyCompressions: number;
            monthlyCompressions: number;
            maxFileSize: number;
            features: string[];
        };
        basic: {
            dailyCompressions: number;
            monthlyCompressions: number;
            maxFileSize: number;
            features: string[];
        };
        pro: {
            dailyCompressions: number;
            monthlyCompressions: number;
            maxFileSize: number;
            features: string[];
        };
        enterprise: {
            dailyCompressions: number;
            monthlyCompressions: number;
            maxFileSize: number;
            features: string[];
        };
    };
};
export default _default;
//# sourceMappingURL=subscription.d.ts.map