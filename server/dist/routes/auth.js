"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = express_1.default.Router();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/register', auth_1.registerValidation, auth_1.register);
router.post('/login', authLimiter, auth_1.loginValidation, auth_1.login);
router.post('/refresh-token', auth_1.refreshToken);
router.get('/verify-email/:token', auth_1.verifyEmail);
router.post('/forgot-password', passwordResetLimiter, auth_1.passwordResetValidation, auth_1.requestPasswordReset);
router.post('/reset-password', auth_1.newPasswordValidation, auth_1.resetPassword);
router.get('/profile', auth_2.authenticateToken, auth_1.getProfile);
router.put('/profile', auth_2.authenticateToken, auth_1.updateProfile);
router.post('/logout', auth_2.authenticateToken, auth_1.logout);
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes are working',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map