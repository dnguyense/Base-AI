import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
    subscription?: any;
}
export declare const generateDownloadToken: (req: AuthRequest, res: Response) => Promise<void>;
export declare const secureDownload: (req: Request, res: Response) => Promise<void>;
export declare const getDownloadAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDownloadAuditTrail: (req: Request, res: Response) => Promise<void>;
export declare const cleanupExpiredTokens: () => void;
declare const _default: {
    generateDownloadToken: (req: AuthRequest, res: Response) => Promise<void>;
    secureDownload: (req: Request, res: Response) => Promise<void>;
    getDownloadAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
    getDownloadAuditTrail: (req: Request, res: Response) => Promise<void>;
    cleanupExpiredTokens: () => void;
};
export default _default;
//# sourceMappingURL=download.d.ts.map