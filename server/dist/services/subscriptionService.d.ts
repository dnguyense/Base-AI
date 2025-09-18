import { Request } from 'express';
export interface AuthRequest extends Request {
    user?: any;
}
export interface CachedSubscription {
    subscription: any | null;
    timestamp: number;
    userId: number;
}
export declare class SubscriptionService {
    private cache;
    private readonly CACHE_TTL;
    getCurrentSubscription(userId: number): Promise<any | null>;
    getUserWithSubscription(userId: number): Promise<{
        user: any | null;
        subscription: any | null;
    }>;
    hasActiveSubscription(userId: number): Promise<boolean>;
    invalidateUserCache(userId: number): void;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        entries: Array<{
            userId: number;
            timestamp: number;
            age: number;
        }>;
    };
    cleanupExpiredCache(): void;
    batchGetSubscriptions(userIds: number[]): Promise<Map<number, any | null>>;
}
export declare const subscriptionService: SubscriptionService;
export default subscriptionService;
//# sourceMappingURL=subscriptionService.d.ts.map