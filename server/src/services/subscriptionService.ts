import { Request } from 'express';
import User from '../models/User';
import Subscription from '../models/Subscription';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: any;
}

export interface CachedSubscription {
  subscription: any | null;
  timestamp: number;
  userId: number;
}

/**
 * Subscription Service for caching and optimizing subscription queries
 * Reduces duplicate database queries across controllers
 */
export class SubscriptionService {
  private cache: Map<number, CachedSubscription> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  /**
   * Get user's current subscription with caching
   * @param userId - User ID
   * @returns Current subscription or null
   */
  async getCurrentSubscription(userId: number): Promise<any | null> {
    // Check cache first
    const cached = this.cache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.subscription;
    }

    // Query database if not in cache or expired
    const subscription = await Subscription.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // Update cache
    this.cache.set(userId, {
      subscription,
      timestamp: Date.now(),
      userId
    });

    return subscription;
  }

  /**
   * Get user with their current subscription using eager loading
   * Optimizes N+1 query problem when user and subscription are needed together
   * @param userId - User ID
   * @returns User with subscription data
   */
  async getUserWithSubscription(userId: number): Promise<{
    user: any | null;
    subscription: any | null;
  }> {
    const user = await User.findByPk(userId);
    if (!user) {
      return { user: null, subscription: null };
    }

    const subscription = await this.getCurrentSubscription(userId);
    
    return { user, subscription };
  }

  /**
   * Check if user has active subscription (cached)
   * @param userId - User ID
   * @returns Boolean indicating if user has active subscription
   */
  async hasActiveSubscription(userId: number): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    return subscription ? subscription.isActive() : false;
  }

  /**
   * Invalidate cache for specific user
   * Call this when subscription data changes
   * @param userId - User ID
   */
  invalidateUserCache(userId: number): void {
    this.cache.delete(userId);
  }

  /**
   * Clear all cached subscriptions
   * Useful during development or maintenance
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for monitoring
   * @returns Cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{
      userId: number;
      timestamp: number;
      age: number;
    }>;
  } {
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

  /**
   * Clean up expired cache entries
   * Automatically called periodically
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: number[] = [];

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

  /**
   * Batch get multiple users' subscriptions
   * Optimizes when multiple users' subscription data is needed
   * @param userIds - Array of user IDs
   * @returns Map of userId to subscription
   */
  async batchGetSubscriptions(userIds: number[]): Promise<Map<number, any | null>> {
    const result = new Map<number, any | null>();
    const uncachedIds: number[] = [];

    // Check cache for each user
    userIds.forEach(userId => {
      const cached = this.cache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        result.set(userId, cached.subscription);
      } else {
        uncachedIds.push(userId);
      }
    });

    // Batch query uncached users
    if (uncachedIds.length > 0) {
      const subscriptions = await Subscription.findAll({
        where: {
          userId: uncachedIds
        },
        order: [['userId', 'ASC'], ['createdAt', 'DESC']]
      });

      // Group by userId and get latest for each user
      const latestByUser = new Map<number, any>();
      subscriptions.forEach(sub => {
        if (!latestByUser.has(sub.userId)) {
          latestByUser.set(sub.userId, sub);
        }
      });

      // Update cache and result
      uncachedIds.forEach(userId => {
        const subscription = latestByUser.get(userId) || null;
        
        // Update cache
        this.cache.set(userId, {
          subscription,
          timestamp: Date.now(),
          userId
        });

        // Add to result
        result.set(userId, subscription);
      });
    }

    return result;
  }
}

// Create singleton instance
export const subscriptionService = new SubscriptionService();

let cacheCleanupInterval: NodeJS.Timeout | null = null;

if (!env.isTest) {
  cacheCleanupInterval = setInterval(() => {
    subscriptionService.cleanupExpiredCache();
  }, 10 * 60 * 1000);
}

export const stopSubscriptionCacheCleanup = (): void => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
    cacheCleanupInterval = null;
  }
};

export default subscriptionService;
