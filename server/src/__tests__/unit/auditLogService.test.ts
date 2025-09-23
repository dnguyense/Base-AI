import AuditLog from '../../models/AuditLog';
import User from '../../models/User';
import { auditLogService } from '../../services/auditLogService';

describe('auditLogService', () => {
  let testUser: User;

  beforeAll(async () => {
    await AuditLog.sync();
  });

  beforeEach(async () => {
    await AuditLog.sync({ force: true });
    testUser = await User.create({
      email: `audit-${Date.now()}@example.com`,
      password: 'Password123!',
      isEmailVerified: true,
      subscriptionStatus: 'active',
      subscriptionPlan: 'free',
      dailyCompressions: 0,
      monthlyCompressions: 0,
      totalCompressions: 0,
      lastCompressionReset: new Date(),
    });
  });

  it('logs download attempts and counts them', async () => {
    await auditLogService.logDownloadAttempt({
      userId: Number(testUser.id),
      actorEmail: 'user@example.com',
      success: true,
      metadata: {
        fileId: 'file-1',
        fileName: 'sample.pdf',
        downloadSize: 1024,
      },
    });

    await auditLogService.logDownloadAttempt({
      userId: Number(testUser.id),
      actorEmail: 'user@example.com',
      success: false,
      metadata: {
        fileId: 'file-2',
        reason: 'TEST_FAILURE',
      },
    });

    const attempts = await auditLogService.getDownloadAttempts({ userId: Number(testUser.id) });
    expect(attempts).toHaveLength(2);

    const successfulCount = await auditLogService.countDownloadAttempts({ userId: Number(testUser.id), success: true });
    expect(successfulCount).toBe(1);
  });

  it('records admin actions with metadata', async () => {
    await auditLogService.logAdminAction({
      userId: Number(testUser.id),
      actorEmail: 'admin@example.com',
      success: true,
      metadata: {
        actionName: 'TEST_ADMIN_ACTION',
        entityType: 'test',
        details: { foo: 'bar' },
      },
    });

    const records = await AuditLog.findAll({ where: { action: 'ADMIN_ACTION' } });
    expect(records).toHaveLength(1);
    expect(records[0].metadata).toMatchObject({ actionName: 'TEST_ADMIN_ACTION' });
  });
});
