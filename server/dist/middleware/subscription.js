"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionInfo = exports.checkFileSizeLimit = exports.checkUsageLimit = exports.requireFeature = exports.requireSubscription = exports.SUBSCRIPTION_LIMITS = void 0;
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
exports.SUBSCRIPTION_LIMITS = {
    free: {
        dailyCompressions: 5,
        monthlyCompressions: 10,
        maxFileSize: 5 * 1024 * 1024,
        features: ['basic_compression']
    },
    basic: {
        dailyCompressions: 20,
        monthlyCompressions: 100,
        maxFileSize: 25 * 1024 * 1024,
        features: ['basic_compression', 'priority_processing', 'advanced_settings']
    },
    pro: {
        dailyCompressions: 100,
        monthlyCompressions: 1000,
        maxFileSize: 100 * 1024 * 1024,
        features: ['basic_compression', 'priority_processing', 'advanced_settings', 'batch_processing', 'api_access']
    },
    enterprise: {
        dailyCompressions: 1000,
        monthlyCompressions: 10000,
        maxFileSize: 500 * 1024 * 1024,
        features: ['basic_compression', 'priority_processing', 'advanced_settings', 'batch_processing', 'api_access', 'white_label', 'custom_integrations']
    }
};
const requireSubscription = (minPlan = 'basic') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const user = await User_1.default.findByPk(req.user.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
            const userPlanIndex = planHierarchy.indexOf(user.subscriptionPlan);
            const requiredPlanIndex = planHierarchy.indexOf(minPlan);
            if (userPlanIndex < requiredPlanIndex) {
                res.status(403).json({
                    success: false,
                    message: `${minPlan} subscription or higher required`,
                    userPlan: user.subscriptionPlan,
                    requiredPlan: minPlan,
                });
                return;
            }
            if (user.subscriptionPlan !== 'free') {
                const subscription = await Subscription_1.default.findOne({
                    where: { userId: user.id },
                    order: [['createdAt', 'DESC']],
                });
                if (!subscription || !subscription.isActive()) {
                    res.status(403).json({
                        success: false,
                        message: 'Active subscription required',
                        subscriptionStatus: subscription?.status || 'none',
                    });
                    return;
                }
            }
            next();
        }
        catch (error) {
            console.error('Subscription middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
            return;
        }
    };
};
exports.requireSubscription = requireSubscription;
const requireFeature = (feature) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const user = await User_1.default.findByPk(req.user.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const userPlan = user.subscriptionPlan;
            const planFeatures = exports.SUBSCRIPTION_LIMITS[userPlan]?.features || [];
            if (!planFeatures.includes(feature)) {
                res.status(403).json({
                    success: false,
                    message: `Feature '${feature}' not available in your current plan`,
                    userPlan: user.subscriptionPlan,
                    availableFeatures: planFeatures,
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Feature access middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
            return;
        }
    };
};
exports.requireFeature = requireFeature;
const checkUsageLimit = (limitType, operation) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const user = await User_1.default.findByPk(req.user.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const userPlan = user.subscriptionPlan;
            const planLimits = exports.SUBSCRIPTION_LIMITS[userPlan];
            if (!planLimits) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid subscription plan',
                });
                return;
            }
            let usageCount = 0;
            let limitValue = 0;
            const now = new Date();
            if (limitType === 'daily') {
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const { count } = await user.getUsageCount('compression', startOfDay, now);
                usageCount = count;
                limitValue = planLimits.dailyCompressions;
            }
            else if (limitType === 'monthly') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const { count } = await user.getUsageCount('compression', startOfMonth, now);
                usageCount = count;
                limitValue = planLimits.monthlyCompressions;
            }
            if (usageCount >= limitValue) {
                res.status(429).json({
                    success: false,
                    message: `${limitType} limit exceeded`,
                    usage: {
                        current: usageCount,
                        limit: limitValue,
                        resetTime: limitType === 'daily' ?
                            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) :
                            new Date(now.getFullYear(), now.getMonth() + 1, 1)
                    },
                    upgradeMessage: userPlan === 'free' ? 'Upgrade to a paid plan for higher limits' : 'Upgrade your plan for higher limits',
                });
                return;
            }
            req.usage = {
                current: usageCount,
                limit: limitValue,
                remaining: limitValue - usageCount,
                plan: userPlan,
            };
            next();
        }
        catch (error) {
            console.error('Usage limit middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
            return;
        }
    };
};
exports.checkUsageLimit = checkUsageLimit;
const checkFileSizeLimit = () => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const user = await User_1.default.findByPk(req.user.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const userPlan = user.subscriptionPlan;
            const planLimits = exports.SUBSCRIPTION_LIMITS[userPlan];
            if (!planLimits) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid subscription plan',
                });
                return;
            }
            const files = req.files;
            if (files && files.pdf) {
                const fileSize = Array.isArray(files.pdf) ? files.pdf[0].size : files.pdf.size;
                if (fileSize > planLimits.maxFileSize) {
                    const maxSizeMB = Math.round(planLimits.maxFileSize / (1024 * 1024));
                    const fileSizeMB = Math.round(fileSize / (1024 * 1024));
                    res.status(413).json({
                        success: false,
                        message: `File size exceeds plan limit`,
                        fileSize: fileSizeMB,
                        maxSize: maxSizeMB,
                        plan: userPlan,
                        upgradeMessage: `Upgrade your plan to process files up to ${maxSizeMB}MB`,
                    });
                    return;
                }
            }
            next();
        }
        catch (error) {
            console.error('File size limit middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
            return;
        }
    };
};
exports.checkFileSizeLimit = checkFileSizeLimit;
const getSubscriptionInfo = async (req, res, next) => {
    try {
        if (!req.user) {
            return next();
        }
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            return next();
        }
        const userPlan = user.subscriptionPlan;
        const planLimits = exports.SUBSCRIPTION_LIMITS[userPlan];
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const dailyUsage = await user.getUsageCount('compression', startOfDay, now);
        const monthlyUsage = await user.getUsageCount('compression', startOfMonth, now);
        req.subscriptionInfo = {
            plan: userPlan,
            status: user.subscriptionStatus,
            limits: planLimits,
            usage: {
                daily: dailyUsage,
                monthly: monthlyUsage,
            },
            features: planLimits.features,
        };
        next();
    }
    catch (error) {
        console.error('Get subscription info error:', error);
        next();
    }
};
exports.getSubscriptionInfo = getSubscriptionInfo;
exports.default = {
    requireSubscription: exports.requireSubscription,
    requireFeature: exports.requireFeature,
    checkUsageLimit: exports.checkUsageLimit,
    checkFileSizeLimit: exports.checkFileSizeLimit,
    getSubscriptionInfo: exports.getSubscriptionInfo,
    SUBSCRIPTION_LIMITS: exports.SUBSCRIPTION_LIMITS,
};
//# sourceMappingURL=subscription.js.map