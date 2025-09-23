import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { register, login, refreshToken as refreshTokenController, validateToken } from '../../controllers/auth';
import User from '../../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/email';
import * as expressValidator from 'express-validator';

jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn(),
  };
});

jest.mock('../../models/User');
jest.mock('../../services/email');

const validationResultMock = expressValidator.validationResult as jest.MockedFunction<typeof expressValidator.validationResult>;

const mockResponse = () => {
  const res = {} as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  const userEmail = 'unit-test@example.com';
  const userPassword = 'StrongPass123!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('returns 400 when validation fails', async () => {
      const req = {
        body: { email: userEmail, password: userPassword },
      } as Request;
      const res = mockResponse();

      validationResultMock.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid email' }],
      } as any);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email',
      });
    });

    it('returns 400 when user already exists', async () => {
      const req = {
        body: { email: userEmail, password: userPassword },
      } as Request;
      const res = mockResponse();

      validationResultMock.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      } as any);

      (User.findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userEmail } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists',
      });
    });

    it('creates a user and returns tokens', async () => {
      const req = {
        body: {
          email: userEmail,
          password: userPassword,
          firstName: 'Unit',
          lastName: 'Test',
        },
      } as Request;
      const res = mockResponse();

      validationResultMock.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      } as any);

      (User.findOne as jest.Mock).mockResolvedValueOnce(null);

      const createdUser = {
        id: 123,
        email: userEmail,
        toJSONBasic: () => ({
          id: '123',
          email: userEmail,
          subscriptionPlan: 'free',
          subscriptionStatus: 'none',
        }),
      };

      (User.create as jest.Mock).mockResolvedValueOnce(createdUser);
      (sendVerificationEmail as jest.Mock).mockResolvedValueOnce(undefined);
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await register(req, res);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: userEmail }));
      expect(sendVerificationEmail).toHaveBeenCalledWith(userEmail, expect.any(String));
      expect(res.status).toHaveBeenCalledWith(201);
      const responsePayload = (res.json as jest.Mock).mock.calls[0][0];
      expect(responsePayload.success).toBe(true);
      expect(responsePayload.data.user.email).toBe(userEmail);
      expect(responsePayload.data.tokens).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(() => jwt.verify(responsePayload.data.tokens.accessToken, process.env.JWT_SECRET || 'test_jwt_secret_key')).not.toThrow();
    });
  });

  describe('login', () => {
    it('returns 400 when validation fails', async () => {
      const req = {
        body: { email: userEmail, password: userPassword },
      } as Request;
      const res = mockResponse();

      validationResultMock.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [{ msg: 'Validation failed' }],
      } as any);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
      });
    });

    it('returns 401 when user not found', async () => {
      const req = {
        body: { email: userEmail, password: userPassword },
      } as Request;
      const res = mockResponse();

      validationResultMock.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      } as any);

      (User.findOne as jest.Mock).mockResolvedValueOnce(null);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userEmail } });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password',
      });
    });

    it('returns 401 when password invalid', async () => {
      const req = {
        body: { email: userEmail, password: userPassword },
      } as Request;
      const res = mockResponse();

      validationResultMock.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      } as any);

      (User.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password',
      });
    });

    it('logs user in and returns tokens', async () => {
      const req = {
        body: { email: userEmail, password: userPassword },
      } as Request;
      const res = mockResponse();

      validationResultMock.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => [],
      } as any);

      const userRecord = {
        id: 456,
        validatePassword: jest.fn().mockResolvedValue(true),
        toJSONBasic: () => ({
          id: '456',
          email: userEmail,
          subscriptionPlan: 'free',
          subscriptionStatus: 'none',
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(userRecord);

      await login(req, res);

      expect(userRecord.validatePassword).toHaveBeenCalledWith(userPassword);
      const responsePayload = (res.json as jest.Mock).mock.calls[0][0];
      expect(responsePayload.success).toBe(true);
      expect(responsePayload.data.user.email).toBe(userEmail);
      expect(responsePayload.data.tokens).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });

  describe('refreshToken', () => {
    it('returns 401 when refresh token missing', async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();

      await refreshTokenController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token is required',
      });
    });

    it('issues new tokens when refresh token valid', async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();

      const userId = 999;
      const refreshTokenValue = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_key');
      req.body.refreshToken = refreshTokenValue;

      (User.findByPk as jest.Mock).mockResolvedValueOnce({ id: userId });

      await refreshTokenController(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: {
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          },
        },
      }));
    });
  });

  describe('validateToken', () => {
    it('returns user details when token valid', async () => {
      const req = {
        user: { id: 777 },
      } as unknown as Request;
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValueOnce({
        toJSONBasic: () => ({ id: 777, email: userEmail }),
      });

      await validateToken(req as any, res);

      expect(User.findByPk).toHaveBeenCalledWith(777);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: { id: 777, email: userEmail },
        },
      });
    });

    it('returns 404 when user missing', async () => {
      const req = {
        user: { id: 12345 },
      } as unknown as Request;
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValueOnce(null);

      await validateToken(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });
  });
});
