"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitAuth = exports.requireAdmin = exports.requirePlan = exports.checkCompressionLimits = exports.requireEmailVerification = exports.requireActiveSubscription = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticateToken = async (req, res, next) => {
    try {
        console.log('🔍 Auth middleware - Authorization header:', req.headers.authorization);
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        console.log('🔍 Auth middleware - Extracted token:', token ? 'Token present' : 'No token');
        if (!token) {
            console.log('❌ Auth middleware - No token provided');
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
        }
        console.log('🔍 Auth middleware - JWT_SECRET:', JWT_SECRET);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('✅ Auth middleware - Token decoded successfully, userId:', decoded.userId);
        const user = await User_1.default.findByPk(decoded.userId);
        console.log('🔍 Auth middleware - User found:', user ? 'Yes' : 'No');
        if (!user) {
            console.log('❌ Auth middleware - User not found in database');
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token',
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Access token has expired',
            });
        }
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            req.user = null;
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.default.findByPk(decoded.userId);
        req.user = user || null;
        next();
    }
    catch (error) {
        req.user = null;
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireActiveSubscription = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const user = req.user;
        if (user.subscriptionStatus !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required',
                data: {
                    subscriptionStatus: user.subscriptionStatus,
                    subscriptionPlan: user.subscriptionPlan,
                },
            });
        }
        next();
    }
    catch (error) {
        console.error('Subscription check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.requireActiveSubscription = requireActiveSubscription;
const requireEmailVerification = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const user = req.user;
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email verification required',
                data: {
                    isEmailVerified: false,
                },
            });
        }
        next();
    }
    catch (error) {
        console.error('Email verification check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.requireEmailVerification = requireEmailVerification;
const checkCompressionLimits = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const user = req.user;
        if (!user.canCompress()) {
            const limits = user.getCompressionLimits();
            res.status(429).json({
                success: false,
                message: 'Compression limit reached',
                data: {
                    limits,
                    current: {
                        daily: user.dailyCompressions,
                        monthly: user.monthlyCompressions,
                    },
                    subscriptionPlan: user.subscriptionPlan,
                },
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Compression limits check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
        return;
    }
};
exports.checkCompressionLimits = checkCompressionLimits;
const requirePlan = (minPlan) => {
    const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const user = req.user;
            const userPlanIndex = planHierarchy.indexOf(user.subscriptionPlan);
            const requiredPlanIndex = planHierarchy.indexOf(minPlan);
            if (userPlanIndex < requiredPlanIndex) {
                res.status(403).json({
                    success: false,
                    message: `${minPlan} plan or higher required`,
                    data: {
                        currentPlan: user.subscriptionPlan,
                        requiredPlan: minPlan,
                    },
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Plan requirement check error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
            return;
        }
    };
};
exports.requirePlan = requirePlan;
const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const user = req.user;
        const isAdmin = user.email.includes('admin') || user.email.includes('support');
        if (!isAdmin) {
            res.status(403).json({
                success: false,
                message: 'Admin access required',
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
        return;
    }
};
exports.requireAdmin = requireAdmin;
const rateLimitAuth = (maxAttempts, windowMs) => {
    const attempts = new Map();
    return (req, res, next) => {
        const clientIp = req.ip || 'unknown';
        const now = Date.now();
        for (const [ip, data] of attempts.entries()) {
            if (now > data.resetTime) {
                attempts.delete(ip);
            }
        }
        let clientData = attempts.get(clientIp);
        if (!clientData) {
            clientData = { count: 0, resetTime: now + windowMs };
            attempts.set(clientIp, clientData);
        }
        if (clientData.count >= maxAttempts) {
            const remainingTime = Math.ceil((clientData.resetTime - now) / 1000);
            res.status(429).json({
                success: false,
                message: `Too many attempts. Try again in ${remainingTime} seconds.`,
                data: {
                    retryAfter: remainingTime,
                },
            });
            return;
        }
        clientData.count++;
        next();
    };
};
exports.rateLimitAuth = rateLimitAuth;
exports.default = {
    authenticateToken: exports.authenticateToken,
    optionalAuth: exports.optionalAuth,
    requireActiveSubscription: exports.requireActiveSubscription,
    requireEmailVerification: exports.requireEmailVerification,
    checkCompressionLimits: exports.checkCompressionLimits,
    requirePlan: exports.requirePlan,
    requireAdmin: exports.requireAdmin,
    rateLimitAuth: exports.rateLimitAuth,
};
//# sourceMappingURL=auth.js.map