import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import * as crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email';
import type { StringValue } from 'ms';
import { env } from '../config/env';

// JWT Configuration
const JWT_SECRET: string = env.jwt.secret;
const JWT_EXPIRES_IN: StringValue = env.jwt.expiresIn as StringValue;
const JWT_REFRESH_SECRET: string = env.jwt.refreshSecret;
const JWT_REFRESH_EXPIRES_IN: StringValue = env.jwt.refreshExpiresIn as StringValue;

const logAuthError = (context: string, error: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (env.isProduction) {
    console.error(`${context}: ${message}`);
  } else {
    console.error(`${context}:`, error);
  }
};

interface AuthRequest extends Request {
  user?: any;
}

// Generate JWT tokens
const generateTokens = (userId: number): { accessToken: string; refreshToken: string } => {
  const payload = { userId };
  
  const accessToken = jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  
  return { accessToken, refreshToken };
};

// Validation rules
const strongPasswordValidator = () =>
  body('password')
    .isStrongPassword({ minLength: 10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage('Password must be at least 10 characters and include upper, lower, number, and symbol characters');

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  strongPasswordValidator(),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

export const newPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  strongPasswordValidator(),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .isString()
    .notEmpty()
    .withMessage('Refresh token is required'),
];

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array()[0].msg;
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
      return;
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Generate email verification token
    const emailVerificationToken = randomBytes(32).toString('hex');

    // Create new user
    const user = await User.create({
      email,
      password, // Will be hashed by the beforeSave hook
      firstName,
      lastName,
      emailVerificationToken,
      subscriptionStatus: 'none',
      subscriptionPlan: 'free',
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationToken);
    } catch (emailError) {
      logAuthError('Failed to send verification email', emailError);
      // Don't fail registration if email sending fails
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Return user data without sensitive information
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
  } catch (error) {
    logAuthError('Registration error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array()[0].msg;
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Return user data without sensitive information
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
  } catch (error) {
    logAuthError('Login error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: refreshTokenInput } = req.body as { refreshToken?: string };

    if (!refreshTokenInput || typeof refreshTokenInput !== 'string') {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshTokenInput, JWT_REFRESH_SECRET) as { userId: number };
    
    // Check if user still exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    logAuthError('Token refresh error', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

export const validateToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRecord = await User.findByPk(req.user.id);
    if (!userRecord) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const userResponse = userRecord.toJSONBasic();

    res.json({
      success: true,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    logAuthError('Validate token error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
      return;
    }

    // Find user by verification token
    const user = await User.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
      return;
    }

    // Update user as verified
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null as any,
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    logAuthError('Email verification error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array()[0].msg;
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
      return;
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists for security
      res.json({
        success: true,
        message: 'If an account with this email exists, password reset instructions sent.',
      });
      return;
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset token
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      logAuthError('Failed to send password reset email', emailError);
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
  } catch (error) {
    logAuthError('Password reset request error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array()[0].msg;
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
      return;
    }

    const { token, password } = req.body;

    // Find user by reset token
    const user = await User.findOne({
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

    // Update password and clear reset tokens
    await user.update({
      password, // Will be hashed by the beforeSave hook
      passwordResetToken: null as any,
      passwordResetExpires: null as any,
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logAuthError('Password reset error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);
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
  } catch (error) {
    logAuthError('Get profile error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update user profile
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
  } catch (error) {
    logAuthError('Update profile error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Logout (client-side token invalidation)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing tokens from storage. However, we can log the logout event.
    
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logAuthError('Logout error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
