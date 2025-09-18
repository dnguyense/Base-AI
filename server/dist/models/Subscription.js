"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Subscription extends sequelize_1.Model {
    isActive() {
        return this.status === 'active' || this.status === 'trialing';
    }
    isExpired() {
        const now = new Date();
        return this.currentPeriodEnd < now;
    }
    daysUntilRenewal() {
        const now = new Date();
        const diffTime = this.currentPeriodEnd.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getMonthlyPrice() {
        if (this.interval === 'year') {
            return Math.round(this.amount / 12);
        }
        return this.amount;
    }
    getAnnualSavings() {
        if (this.interval === 'year') {
            const monthlyPrice = this.getPlanMonthlyPrice();
            const annualPrice = this.amount;
            return (monthlyPrice * 12) - annualPrice;
        }
        return 0;
    }
    getPlanMonthlyPrice() {
        const monthlyPrices = {
            basic: 999,
            pro: 1999,
            enterprise: 4999,
        };
        return monthlyPrices[this.plan] || 0;
    }
    toJSON() {
        const values = Object.assign({}, this.get());
        return values;
    }
}
Subscription.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    stripeCustomerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Stripe customer ID',
    },
    stripeSubscriptionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Stripe subscription ID',
    },
    stripePriceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Stripe price ID',
    },
    status: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.STRING
            : sequelize_1.DataTypes.ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'),
        allowNull: false,
        defaultValue: 'incomplete',
        validate: {
            isIn: [['incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid']]
        }
    },
    plan: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.STRING
            : sequelize_1.DataTypes.ENUM('basic', 'pro', 'enterprise'),
        allowNull: false,
        validate: {
            isIn: [['basic', 'pro', 'enterprise']]
        }
    },
    interval: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.STRING
            : sequelize_1.DataTypes.ENUM('month', 'year'),
        allowNull: false,
        defaultValue: 'month',
        validate: {
            isIn: [['month', 'year']]
        }
    },
    currentPeriodStart: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    currentPeriodEnd: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    trialStart: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    trialEnd: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    canceledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    cancelAtPeriodEnd: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    amount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: 'Subscription amount in cents',
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'usd',
    },
    metadata: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.TEXT
            : sequelize_1.DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional metadata from Stripe',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    indexes: process.env.NODE_ENV === 'test' ? [] : [
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
});
exports.default = Subscription;
//# sourceMappingURL=Subscription.js.map