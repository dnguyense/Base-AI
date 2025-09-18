"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updateProfile = exports.getProfile = exports.resetPassword = exports.requestPasswordReset = exports.verifyEmail = exports.refreshToken = exports.login = exports.register = exports.newPasswordValidation = exports.passwordResetValidation = exports.loginValidation = exports.registerValidation = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const crypto = __importStar(require("crypto"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../services/email");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d');
const generateTokens = (userId) => {
    const payload = { userId };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
};
exports.registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters'),
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name must be between 1 and 100 characters'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
exports.passwordResetValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
];
exports.newPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters'),
];
const register = async (req, res) => {
    try {
        console.log('🔍 Registration - Request body:', req.body);
        const errors = (0, express_validator_1.validationResult)(req);
        console.log('🔍 Registration - Validation errors check:', errors.isEmpty() ? 'No errors' : 'Has errors');
        if (!errors.isEmpty()) {
            console.log('❌ Registration - Validation errors:', errors.array());
            const errorMessage = errors.array()[0].msg;
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
            return;
        }
        const { email, password, firstName, lastName } = req.body;
        console.log('✅ Registration - Validation passed, extracting fields');
        console.log('🔧 Registration - Email:', email);
        console.log('🔧 Registration - Password length:', password ? password.length : 'undefined');
        console.log('🔧 Registration - FirstName:', firstName);
        console.log('🔧 Registration - LastName:', lastName);
        console.log('🔍 Registration - Checking if user exists with email:', email);
        const existingUser = await User_1.default.findOne({ where: { email } });
        console.log('🔍 Registration - User exists check result:', existingUser ? 'User exists' : 'No existing user');
        if (existingUser) {
            console.log('❌ Registration - User already exists, returning error');
            res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
            return;
        }
        const emailVerificationToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const user = await User_1.default.create({
            email,
            password,
            firstName,
            lastName,
            emailVerificationToken,
            subscriptionStatus: 'none',
            subscriptionPlan: 'free',
        });
        try {
            await (0, email_1.sendVerificationEmail)(email, emailVerificationToken);
        }
        catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }
        const { accessToken, refreshToken } = generateTokens(user.id);
        const userResponse = user.toJSONBasic();
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                tokens: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array()[0].msg;
            res.status(400).json({
                success: false,
                error: errorMessage,
            });
            return;
        }
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        const { accessToken, refreshToken } = generateTokens(user.id);
        const userResponse = user.toJSONBasic();
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                tokens: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token is required',
            });
            return;
        }
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User_1.default.findByPk(decoded.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const tokens = generateTokens(user.id);
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                tokens,
            },
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
};
exports.refreshToken = refreshToken;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Verification token is required',
            });
            return;
        }
        const user = await User_1.default.findOne({
            where: { emailVerificationToken: token },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
            });
            return;
        }
        await user.update({
            isEmailVerified: true,
            emailVerificationToken: null,
        });
        res.json({
            success: true,
            message: 'Email verified successfully',
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.verifyEmail = verifyEmail;
const requestPasswordReset = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array()[0].msg;
            res.status(400).json({
                success: false,
                error: errorMessage,
            });
            return;
        }
        const { email } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            res.json({
                success: true,
                message: 'If an account with this email exists, password reset instructions sent.',
            });
            return;
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.update({
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
        });
        try {
            await (0, email_1.sendPasswordResetEmail)(email, resetToken);
        }
        catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send password reset email',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Password reset instructions sent to your email',
        });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array()[0].msg;
            res.status(400).json({
                success: false,
                error: errorMessage,
            });
            return;
        }
        const { token, password } = req.body;
        const user = await User_1.default.findOne({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    [require('sequelize').Op.gt]: new Date(),
                },
            },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
            return;
        }
        await user.update({
            password,
            passwordResetToken: null,
            passwordResetExpires: null,
        });
        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.resetPassword = resetPassword;
const getProfile = async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const userResponse = user.toJSONBasic();
        res.json({
            success: true,
            data: {
                user: userResponse,
            },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        await user.update({
            firstName,
            lastName,
        });
        const userResponse = user.toJSONBasic();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: userResponse,
            },
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.updateProfile = updateProfile;
const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map