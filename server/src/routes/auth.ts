import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  registerValidation,
  login,
  loginValidation,
  refreshToken,
  refreshTokenValidation,
  validateToken,
  verifyEmail,
  requestPasswordReset,
  passwordResetValidation,
  resetPassword,
  newPasswordValidation,
  getProfile,
  updateProfile,
  logout
} from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More strict rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
router.post('/register', registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh-token', refreshTokenValidation, refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, passwordResetValidation, requestPasswordReset);
router.post('/reset-password', newPasswordValidation, resetPassword);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);
router.get('/validate', authenticateToken, validateToken);

// Test endpoint for development
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;
