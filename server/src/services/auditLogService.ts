import { Op } from 'sequelize';
import AuditLog, { AuditLogCreationAttributes, AuditAction } from '../models/AuditLog';

export interface DownloadAuditMetadata {
  fileId?: string;
  fileName?: string;
  subscriptionPlan?: string;
  downloadSize?: number;
  reason?: string;
  token?: string;
}

export interface SubscriptionAuditMetadata {
  subscriptionId?: number | string;
  stripeSubscriptionId?: string;
  plan?: string;
  interval?: string;
  status?: string;
  previousStatus?: string;
  amount?: number;
  currency?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface AdminAuditMetadata {
  actionName: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, any>;
  details?: Record<string, any>;
  filters?: Record<string, any>;
  error?: string;
}

const log = async (entry: AuditLogCreationAttributes): Promise<AuditLog> => {
  return AuditLog.create(entry);
};

export const auditLogService = {
  async logDownloadAttempt(params: {
    userId?: number;
    actorEmail?: string | null;
    success: boolean;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: DownloadAuditMetadata;
  }): Promise<AuditLog> {
    const { userId, actorEmail, success, ipAddress, userAgent, metadata } = params;
    return log({
      userId,
      actorEmail: actorEmail ?? null,
      action: 'DOWNLOAD_ATTEMPT',
      entityType: 'download',
      entityId: metadata?.fileId ?? null,
      success,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      metadata: metadata ? { ...metadata } : null,
    });
  },

  async logSubscriptionChange(params: {
    userId: number;
    actorEmail?: string | null;
    success: boolean;
    metadata: SubscriptionAuditMetadata;
  }): Promise<AuditLog> {
    const { userId, actorEmail, success, metadata } = params;
    const { subscriptionId, stripeSubscriptionId, ...rest } = metadata;

    return log({
      userId,
      actorEmail: actorEmail ?? null,
      action: 'SUBSCRIPTION_CHANGE',
      entityType: 'subscription',
      entityId: (subscriptionId ?? stripeSubscriptionId ?? null) as string | null,
      success,
      metadata: {
        ...rest,
        subscriptionId,
        stripeSubscriptionId,
      },
    });
  },

  async logAdminAction(params: {
    userId?: number;
    actorEmail?: string | null;
    success: boolean;
    metadata: AdminAuditMetadata;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLog> {
    const { userId, actorEmail, success, metadata, ipAddress, userAgent } = params;
    return log({
      userId,
      actorEmail: actorEmail ?? null,
      action: 'ADMIN_ACTION',
      entityType: metadata.entityType || 'admin',
      entityId: metadata.entityId ?? null,
      success,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      metadata,
    });
  },

  async countDownloadAttempts(params: {
    userId: number;
    success?: boolean;
    start?: Date;
    end?: Date;
  }): Promise<number> {
    const { userId, success, start, end } = params;
    const where: any = {
      action: 'DOWNLOAD_ATTEMPT' as AuditAction,
      userId,
    };

    if (typeof success === 'boolean') {
      where.success = success;
    }

    if (start || end) {
      where.createdAt = {};
      if (start) {
        where.createdAt[Op.gte] = start;
      }
      if (end) {
        where.createdAt[Op.lte] = end;
      }
    }

    return AuditLog.count({ where });
  },

  async getDownloadAttempts(params: {
    userId: number;
    start?: Date;
    end?: Date;
  }): Promise<AuditLog[]> {
    const { userId, start, end } = params;
    const where: any = {
      action: 'DOWNLOAD_ATTEMPT' as AuditAction,
      userId,
    };

    if (start || end) {
      where.createdAt = {};
      if (start) {
        where.createdAt[Op.gte] = start;
      }
      if (end) {
        where.createdAt[Op.lte] = end;
      }
    }

    return AuditLog.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  },
};

export type AuditLogService = typeof auditLogService;
