"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
class User extends sequelize_1.Model {
    async validatePassword(password) {
        return bcryptjs_1.default.compare(password, this.password);
    }
    async hashPassword() {
        if (this.changed('password')) {
            const salt = await bcryptjs_1.default.genSalt(12);
            this.password = await bcryptjs_1.default.hash(this.password, salt);
        }
    }
    getFullName() {
        return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email;
    }
    canCompress() {
        const now = new Date();
        if (this.lastCompressionReset.toDateString() !== now.toDateString()) {
            this.dailyCompressions = 0;
            this.lastCompressionReset = now;
        }
        const limits = this.getCompressionLimits();
        return this.dailyCompressions < limits.daily && this.monthlyCompressions < limits.monthly;
    }
    getCompressionLimits() {
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
    async incrementCompressionCount() {
        this.dailyCompressions += 1;
        this.monthlyCompressions += 1;
        this.totalCompressions += 1;
        await this.save();
    }
    async getUsageCount(operationType, startDate, endDate) {
        const now = new Date();
        if (startDate.toDateString() === now.toDateString()) {
            if (this.lastCompressionReset.toDateString() !== now.toDateString()) {
                return { count: 0 };
            }
            return { count: this.dailyCompressions };
        }
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (startDate.getTime() === startOfMonth.getTime()) {
            return { count: this.monthlyCompressions };
        }
        return { count: 0 };
    }
    toJSON() {
        const values = Object.assign({}, this.get());
        delete values.password;
        delete values.emailVerificationToken;
        delete values.passwordResetToken;
        if (values.id) {
            values.id = values.id.toString();
        }
        return values;
    }
    toJSONBasic() {
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
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            len: [3, 255],
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255],
        },
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [1, 100],
        },
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [1, 100],
        },
    },
    isEmailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    emailVerificationToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    passwordResetToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    passwordResetExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    subscriptionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Stripe subscription ID',
    },
    stripeCustomerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Stripe customer ID',
    },
    subscriptionStatus: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.STRING
            : sequelize_1.DataTypes.ENUM('none', 'active', 'past_due', 'canceled', 'unpaid'),
        allowNull: false,
        defaultValue: 'none',
        validate: {
            isIn: [['none', 'active', 'past_due', 'canceled', 'unpaid']]
        }
    },
    subscriptionPlan: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.STRING
            : sequelize_1.DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
        allowNull: false,
        defaultValue: 'free',
        validate: {
            isIn: [['free', 'basic', 'pro', 'enterprise']]
        }
    },
    subscriptionEndDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    dailyCompressions: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    monthlyCompressions: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalCompressions: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    lastCompressionReset: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
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
    modelName: 'User',
    tableName: 'users',
    indexes: process.env.NODE_ENV === 'test' ? [] : [
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
        beforeSave: async (user) => {
            await user.hashPassword();
        },
    },
});
exports.default = User;
//# sourceMappingURL=User.js.map