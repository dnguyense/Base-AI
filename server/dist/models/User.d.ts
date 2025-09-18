import { Model, Optional } from 'sequelize';
export interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    subscriptionId?: string;
    stripeCustomerId?: string;
    subscriptionStatus: 'none' | 'active' | 'past_due' | 'canceled' | 'unpaid';
    subscriptionPlan: 'free' | 'basic' | 'pro' | 'enterprise';
    subscriptionEndDate?: Date;
    dailyCompressions: number;
    monthlyCompressions: number;
    totalCompressions: number;
    lastCompressionReset: Date;
    createdAt: Date;
    updatedAt: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'firstName' | 'lastName' | 'isEmailVerified' | 'emailVerificationToken' | 'passwordResetToken' | 'passwordResetExpires' | 'subscriptionId' | 'stripeCustomerId' | 'subscriptionEndDate' | 'dailyCompressions' | 'monthlyCompressions' | 'totalCompressions' | 'lastCompressionReset' | 'createdAt' | 'updatedAt'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    subscriptionId?: string;
    stripeCustomerId?: string;
    subscriptionStatus: 'none' | 'active' | 'past_due' | 'canceled' | 'unpaid';
    subscriptionPlan: 'free' | 'basic' | 'pro' | 'enterprise';
    subscriptionEndDate?: Date;
    dailyCompressions: number;
    monthlyCompressions: number;
    totalCompressions: number;
    lastCompressionReset: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    validatePassword(password: string): Promise<boolean>;
    hashPassword(): Promise<void>;
    getFullName(): string;
    canCompress(): boolean;
    getCompressionLimits(): {
        daily: number;
        monthly: number;
    };
    incrementCompressionCount(): Promise<void>;
    getUsageCount(operationType: string, startDate: Date, endDate: Date): Promise<{
        count: number;
    }>;
    toJSON(): Omit<UserAttributes, 'password' | 'emailVerificationToken' | 'passwordResetToken'>;
    toJSONBasic(): {
        id: string;
        email: string;
        firstName: string | undefined;
        lastName: string | undefined;
        subscriptionPlan: "free" | "basic" | "pro" | "enterprise";
        subscriptionStatus: "none" | "active" | "past_due" | "canceled" | "unpaid";
    };
}
export default User;
//# sourceMappingURL=User.d.ts.map