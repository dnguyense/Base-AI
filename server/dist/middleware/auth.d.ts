import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: any;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireActiveSubscription: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireEmailVerification: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const checkCompressionLimits: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePlan: (minPlan: "free" | "basic" | "pro" | "enterprise") => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const rateLimitAuth: (maxAttempts: number, windowMs: number) => (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    requireActiveSubscription: (req: AuthRequest, res: Response, next: NextFunction) => void;
    requireEmailVerification: (req: AuthRequest, res: Response, next: NextFunction) => void;
    checkCompressionLimits: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    requirePlan: (minPlan: "free" | "basic" | "pro" | "enterprise") => (req: AuthRequest, res: Response, next: NextFunction) => void;
    requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
    rateLimitAuth: (maxAttempts: number, windowMs: number) => (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map