import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { env } from '../config/env';

// Subscription attributes interface
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
  amount: number; // in cents
  currency: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for model creation
interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes,
  'id' | 'trialStart' | 'trialEnd' | 'canceledAt' | 'cancelAtPeriodEnd' | 'metadata' | 'createdAt' | 'updatedAt'
> {}

// Subscription model class
class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: number;
  public userId!: number;
  public stripeCustomerId!: string;
  public stripeSubscriptionId!: string;
  public stripePriceId!: string;
  public status!: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  public plan!: 'basic' | 'pro' | 'enterprise';
  public interval!: 'month' | 'year';
  public currentPeriodStart!: Date;
  public currentPeriodEnd!: Date;
  public trialStart?: Date;
  public trialEnd?: Date;
  public canceledAt?: Date;
  public cancelAtPeriodEnd!: boolean;
  public amount!: number;
  public currency!: string;
  public metadata?: Record<string, any>;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public isActive(): boolean {
    return this.status === 'active' || this.status === 'trialing';
  }

  public isExpired(): boolean {
    const now = new Date();
    return this.currentPeriodEnd < now;
  }

  public daysUntilRenewal(): number {
    const now = new Date();
    const diffTime = this.currentPeriodEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getMonthlyPrice(): number {
    if (this.interval === 'year') {
      return Math.round(this.amount / 12);
    }
    return this.amount;
  }

  public getAnnualSavings(): number {
    if (this.interval === 'year') {
      const monthlyPrice = this.getPlanMonthlyPrice();
      const annualPrice = this.amount;
      return (monthlyPrice * 12) - annualPrice;
    }
    return 0;
  }

  private getPlanMonthlyPrice(): number {
    // Base monthly prices in cents
    const monthlyPrices = {
      basic: 999,   // $9.99
      pro: 1999,    // $19.99
      enterprise: 4999, // $49.99
    };
    return monthlyPrices[this.plan] || 0;
  }

  public toJSON(): SubscriptionAttributes {
    const values = Object.assign({}, this.get());
    return values;
  }
}

// Define Subscription model
Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stripe customer ID',
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stripe subscription ID',
    },
    stripePriceId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stripe price ID',
    },
    status: {
      type: env.isTest
        ? DataTypes.STRING
        : DataTypes.ENUM(
          'incomplete',
          'incomplete_expired',
          'trialing',
          'active',
          'past_due',
          'canceled',
          'unpaid'
        ),
      allowNull: false,
      defaultValue: 'incomplete',
      validate: {
        isIn: [['incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid']]
      }
    },
    plan: {
      type: env.isTest
        ? DataTypes.STRING
        : DataTypes.ENUM('basic', 'pro', 'enterprise'),
      allowNull: false,
      validate: {
        isIn: [['basic', 'pro', 'enterprise']]
      }
    },
    interval: {
      type: env.isTest
        ? DataTypes.STRING
        : DataTypes.ENUM('month', 'year'),
      allowNull: false,
      defaultValue: 'month',
      validate: {
        isIn: [['month', 'year']]
      }
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    trialStart: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trialEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Subscription amount in cents',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'usd',
    },
    metadata: {
      type: env.isTest
        ? DataTypes.TEXT
        : DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional metadata from Stripe',
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
    modelName: 'Subscription',
    tableName: 'subscriptions',
    indexes: env.isTest ? [] : [
      {
        unique: true,
        fields: ['stripe_subscription_id'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['stripe_customer_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['plan'],
      },
      {
        fields: ['current_period_end'],
      },
    ],
  }
);

export default Subscription;
