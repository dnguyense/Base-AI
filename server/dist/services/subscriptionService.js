"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = exports.SubscriptionService = void 0;
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
class SubscriptionService {
    constructor() {
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    async getCurrentSubscription(userId) {
        const cached = this.cache.get(userId);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.subscription;
        }
        const subscription = await Subscription_1.default.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
        this.cache.set(userId, {
            subscription,
            timestamp: Date.now(),
            userId
        });
        return subscription;
    }
    async getUserWithSubscription(userId) {
        const user = await User_1.default.findByPk(userId);
        if (!user) {
            return { user: null, subscription: null };
        }
        const subscription = await this.getCurrentSubscription(userId);
        return { user, subscription };
    }
    async hasActiveSubscription(userId) {
        const subscription = await this.getCurrentSubscription(userId);
        return subscription ? subscription.isActive() : false;
    }
    invalidateUserCache(userId) {
        this.cache.delete(userId);
    }
    clearCache() {
        this.cache.clear();
    }
    getCacheStats() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries()).map(([userId, cached]) => ({
            userId,
            timestamp: cached.timestamp,
            age: now - cached.timestamp
        }));
        return {
            size: this.cache.size,
            entries
        };
    }
    cleanupExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];
        this.cache.forEach((cached, userId) => {
            if ((now - cached.timestamp) >= this.CACHE_TTL) {
                expiredKeys.push(userId);
            }
        });
        expiredKeys.forEach(userId => this.cache.delete(userId));
        if (expiredKeys.length > 0) {
            console.log(`Cleaned up ${expiredKeys.length} expired subscription cache entries`);
        }
    }
    async batchGetSubscriptions(userIds) {
        const result = new Map();
        const uncachedIds = [];
        userIds.forEach(userId => {
            const cached = this.cache.get(userId);
            if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
                result.set(userId, cached.subscription);
            }
            else {
                uncachedIds.push(userId);
            }
        });
        if (uncachedIds.length > 0) {
            const subscriptions = await Subscription_1.default.findAll({
                where: {
                    userId: uncachedIds
                },
                order: [['userId', 'ASC'], ['createdAt', 'DESC']]
            });
            const latestByUser = new Map();
            subscriptions.forEach(sub => {
                if (!latestByUser.has(sub.userId)) {
                    latestByUser.set(sub.userId, sub);
                }
            });
            uncachedIds.forEach(userId => {
                const subscription = latestByUser.get(userId) || null;
                this.cache.set(userId, {
                    subscription,
                    timestamp: Date.now(),
                    userId
                });
                result.set(userId, subscription);
            });
        }
        return result;
    }
}
exports.SubscriptionService = SubscriptionService;
exports.subscriptionService = new SubscriptionService();
setInterval(() => {
    exports.subscriptionService.cleanupExpiredCache();
}, 10 * 60 * 1000);
exports.default = exports.subscriptionService;
//# sourceMappingURL=subscriptionService.js.map