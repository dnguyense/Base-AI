import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const createCheckoutValidation: import("express-validator").ValidationChain[];
export declare const createCheckoutSession: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSubscriptionPlans: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reactivateSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const handleStripeWebhook: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    createCheckoutSession: (req: AuthRequest, res: Response) => Promise<void>;
    getSubscriptionPlans: (req: Request, res: Response) => Promise<void>;
    getCurrentSubscription: (req: AuthRequest, res: Response) => Promise<void>;
    cancelSubscription: (req: AuthRequest, res: Response) => Promise<void>;
    reactivateSubscription: (req: AuthRequest, res: Response) => Promise<void>;
    handleStripeWebhook: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=payment.d.ts.map