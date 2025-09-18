import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { register, login } from '../../controllers/auth';
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
});
