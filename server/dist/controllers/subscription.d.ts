import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
    subscription?: any;
}
export declare const getSubscriptionPlans: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBillingHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsageStatistics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reactivateSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateSubscriptionPlan: (req: AuthRequest, res: Response) => Promise<void>;
declare const _default: {
    getSubscriptionPlans: (req: Request, res: Response) => Promise<void>;
    getCurrentSubscription: (req: AuthRequest, res: Response) => Promise<void>;
    getBillingHistory: (req: AuthRequest, res: Response) => Promise<void>;
    getUsageStatistics: (req: AuthRequest, res: Response) => Promise<void>;
    cancelSubscription: (req: AuthRequest, res: Response) => Promise<void>;
    reactivateSubscription: (req: AuthRequest, res: Response) => Promise<void>;
    updateSubscriptionPlan: (req: AuthRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=subscription.d.ts.map