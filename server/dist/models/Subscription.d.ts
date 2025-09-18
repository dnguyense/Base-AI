import { Model, Optional } from 'sequelize';
export interface SubscriptionAttributes {
    id: number;
    userId: number;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
    plan: 'basic' | 'pro' | 'enterprise';
    interval: 'month' | 'year';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialStart?: Date;
    trialEnd?: Date;
    canceledAt?: Date;
    cancelAtPeriodEnd: boolean;
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'trialStart' | 'trialEnd' | 'canceledAt' | 'cancelAtPeriodEnd' | 'metadata' | 'createdAt' | 'updatedAt'> {
}
declare class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
    id: number;
    userId: number;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
    plan: 'basic' | 'pro' | 'enterprise';
    interval: 'month' | 'year';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialStart?: Date;
    trialEnd?: Date;
    canceledAt?: Date;
    cancelAtPeriodEnd: boolean;
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    isActive(): boolean;
    isExpired(): boolean;
    daysUntilRenewal(): number;
    getMonthlyPrice(): number;
    getAnnualSavings(): number;
    private getPlanMonthlyPrice;
    toJSON(): SubscriptionAttributes;
}
export default Subscription;
//# sourceMappingURL=Subscription.d.ts.map