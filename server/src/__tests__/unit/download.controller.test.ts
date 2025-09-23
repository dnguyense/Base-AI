import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as fsPromises from 'fs/promises';
import User from '../../models/User';
import { generateDownloadToken, secureDownload, stopDownloadCleanupScheduler } from '../../controllers/download';
import AuditLog from '../../models/AuditLog';

jest.mock('fs/promises', () => {
  const access = jest.fn();
  const readFile = jest.fn();
  const stat = jest.fn();
  return {
    __esModule: true,
    default: {
      access,
      readFile,
      stat,
    },
    access,
    readFile,
    stat,
  };
});
jest.mock('../../services/subscriptionService', () => ({
  subscriptionService: {
    getCurrentSubscription: jest.fn(),
  },
}));

const { subscriptionService } = require('../../services/subscriptionService');

const mockResponse = () => {
  const res = {} as Response & {
    status: jest.Mock;
    json: jest.Mock;
    setHeader: jest.Mock;
    send: jest.Mock;
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.send = jest.fn();
  return res;
};

const createUser = async (overrides: Record<string, any> = {}) => {
  const defaults = {
    email: `qa-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,
    password: 'Password123!',
    isEmailVerified: true,
    subscriptionStatus: 'active',
    subscriptionPlan: 'free',
    dailyCompressions: 0,
    monthlyCompressions: 0,
    totalCompressions: 0,
    lastCompressionReset: new Date(),
  };
  return User.create({ ...defaults, ...overrides });
};

describe('Download Controller', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    await AuditLog.destroy({ where: {} });
  });

  afterAll(() => {
    stopDownloadCleanupScheduler();
  });


  describe('generateDownloadToken', () => {
    it('returns 400 when required body fields missing', async () => {
      const req = {
        body: { fileId: 'abc' },
        user: { id: 1 },
      } as unknown as Request;
      const res = mockResponse();

      await generateDownloadToken(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns 404 when user not found', async () => {
      const req = {
        body: { fileId: 'abc', fileName: 'file.pdf', filePath: '/tmp/file.pdf' },
        user: { id: 9999 },
      } as unknown as Request;
      const res = mockResponse();

      await generateDownloadToken(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User not found' }));
    });

    it('returns 403 when subscription inactive for paid plan', async () => {
      const user = await createUser({ subscriptionPlan: 'pro' });
      const req = {
        body: { fileId: 'abc', fileName: 'file.pdf', filePath: '/tmp/file.pdf' },
        user: { id: Number(user.id) } as any,
      } as unknown as Request;
      const res = mockResponse();

      (subscriptionService.getCurrentSubscription as jest.Mock).mockResolvedValueOnce({ isActive: () => false });
      (fsPromises.access as jest.Mock).mockResolvedValueOnce(undefined);

      await generateDownloadToken(req as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'SUBSCRIPTION_REQUIRED' }));
    });

    it('returns 404 when file missing', async () => {
      const user = await createUser();
      const req = {
        body: { fileId: 'abc', fileName: 'file.pdf', filePath: '/tmp/missing.pdf' },
        user: { id: Number(user.id) } as any,
      } as unknown as Request;
      const res = mockResponse();

      (subscriptionService.getCurrentSubscription as jest.Mock).mockResolvedValueOnce(null);
      (fsPromises.access as jest.Mock).mockRejectedValueOnce(new Error('not found'));

      await generateDownloadToken(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'File not found' }));
    });

    it('issues a signed download token on success', async () => {
      const user = await createUser();
      const req = {
        body: { fileId: 'abc', fileName: 'file.pdf', filePath: '/tmp/file.pdf' },
        user: { id: Number(user.id) } as any,
      } as unknown as Request;
      const res = mockResponse();

      (subscriptionService.getCurrentSubscription as jest.Mock).mockResolvedValueOnce(null);
      const accessMock = fsPromises.access as jest.Mock;
      accessMock.mockResolvedValueOnce(undefined);
      const jwtSpy = jest.spyOn(jwt, 'sign').mockReturnValue('signed-token');

      await generateDownloadToken(req as any, res);
      const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
      const payload = (res.json as jest.Mock).mock.calls[0]?.[0];

      expect(statusCall).toBeUndefined();
      expect(payload).toMatchObject({ success: true });
      expect(accessMock).toHaveBeenCalledWith('/tmp/file.pdf');
      expect(jwtSpy).toHaveBeenCalledWith(expect.objectContaining({ userId: Number(user.id) }), expect.any(String), expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ downloadToken: 'signed-token' }),
      }));

      jwtSpy.mockRestore();
    });
  });

  describe('secureDownload', () => {
    it('rejects missing token', async () => {
      const req = { params: {} } as unknown as Request;
      const res = mockResponse();

      await secureDownload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Download token required' }));
    });

    it('rejects invalid token', async () => {
      const req = { params: { token: 'invalid' }, ip: '127.0.0.1', get: () => 'agent' } as unknown as Request;
      const res = mockResponse();

      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      await secureDownload(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'TOKEN_INVALID' }));
    });
  });
});
