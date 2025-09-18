import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { env } from '../config/env';

// User attributes interface
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
  subscriptionId?: string; // Stripe subscription ID
  stripeCustomerId?: string; // Stripe customer ID
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

// Optional attributes for model creation
interface UserCreationAttributes extends Optional<UserAttributes, 
  'id' | 'firstName' | 'lastName' | 'isEmailVerified' | 'emailVerificationToken' | 
  'passwordResetToken' | 'passwordResetExpires' | 'subscriptionId' | 'stripeCustomerId' | 'subscriptionEndDate' |
  'dailyCompressions' | 'monthlyCompressions' | 'totalCompressions' | 'lastCompressionReset' |
  'createdAt' | 'updatedAt'
> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public firstName?: string;
  public lastName?: string;
  public isEmailVerified!: boolean;
  public emailVerificationToken?: string;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public subscriptionId?: string;
  public stripeCustomerId?: string;
  public subscriptionStatus!: 'none' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  public subscriptionPlan!: 'free' | 'basic' | 'pro' | 'enterprise';
  public subscriptionEndDate?: Date;
  public dailyCompressions!: number;
  public monthlyCompressions!: number;
  public totalCompressions!: number;
  public lastCompressionReset!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public async hashPassword(): Promise<void> {
    if (this.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  public getFullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email;
  }

  public canCompress(): boolean {
    const now = new Date();
    
    // Reset daily counter if needed
    if (this.lastCompressionReset.toDateString() !== now.toDateString()) {
      this.dailyCompressions = 0;
      this.lastCompressionReset = now;
    }

    // Check limits based on subscription plan
    const limits = this.getCompressionLimits();
    return this.dailyCompressions < limits.daily && this.monthlyCompressions < limits.monthly;
  }

  public getCompressionLimits(): { daily: number; monthly: number } {
    switch (this.subscriptionPlan) {
      case 'free':
        return { daily: 3, monthly: 10 };
      case 'basic':
        return { daily: 20, monthly: 100 };
      case 'pro':
        return { daily: 100, monthly: 1000 };
      case 'enterprise':
        return { daily: 1000, monthly: 10000 };
      default:
        return { daily: 3, monthly: 10 };
    }
  }

  public async incrementCompressionCount(): Promise<void> {
    this.dailyCompressions += 1;
    this.monthlyCompressions += 1;
    this.totalCompressions += 1;
    await this.save();
  }

  public async getUsageCount(operationType: string, startDate: Date, endDate: Date): Promise<{ count: number }> {
    // For now, return the stored compression counts since we're using daily/monthly counters
    // In a production system, this could query a separate usage tracking table
    const now = new Date();
    
    // Check if this is for daily count
    if (startDate.toDateString() === now.toDateString()) {
      // Reset daily counter if needed
      if (this.lastCompressionReset.toDateString() !== now.toDateString()) {
        return { count: 0 };
      }
      return { count: this.dailyCompressions };
    }
    
    // For monthly count, return monthly compressions
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (startDate.getTime() === startOfMonth.getTime()) {
      return { count: this.monthlyCompressions };
    }
    
    // Default fallback
    return { count: 0 };
  }

  public toJSON(): Omit<UserAttributes, 'password' | 'emailVerificationToken' | 'passwordResetToken'> {
    const values = Object.assign({}, this.get()) as any;
    delete values.password;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    
    // Convert id to string for API consistency
    if (values.id) {
      values.id = values.id.toString();
    }
    
    return values;
  }

  public toJSONBasic() {
    return {
      id: this.id.toString(),
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      subscriptionPlan: this.subscriptionPlan,
      subscriptionStatus: this.subscriptionStatus
    };
  }
}

// Define User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [3, 255],
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Stripe subscription ID',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Stripe customer ID',
    },
    subscriptionStatus: {
      type: env.isTest
        ? DataTypes.STRING
        : DataTypes.ENUM('none', 'active', 'past_due', 'canceled', 'unpaid'),
      allowNull: false,
      defaultValue: 'none',
      validate: {
        isIn: [['none', 'active', 'past_due', 'canceled', 'unpaid']]
      }
    },
    subscriptionPlan: {
      type: env.isTest
        ? DataTypes.STRING
        : DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
      allowNull: false,
      defaultValue: 'free',
      validate: {
        isIn: [['free', 'basic', 'pro', 'enterprise']]
      }
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dailyCompressions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    monthlyCompressions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalCompressions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastCompressionReset: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: env.isTest ? [] : [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['subscription_status'],
      },
      {
        fields: ['subscription_plan'],
      },
      {
        fields: ['email_verification_token'],
      },
      {
        fields: ['password_reset_token'],
      },
    ],
    hooks: {
      beforeSave: async (user: User) => {
        await user.hashPassword();
      },
    },
  }
);

export default User;
