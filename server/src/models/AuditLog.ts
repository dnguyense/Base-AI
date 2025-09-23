import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type AuditAction = 'DOWNLOAD_ATTEMPT' | 'SUBSCRIPTION_CHANGE' | 'ADMIN_ACTION';

export interface AuditLogAttributes {
  id: number;
  userId?: number | null;
  actorEmail?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  success: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AuditLogCreationAttributes = Optional<AuditLogAttributes,
  'id' | 'userId' | 'actorEmail' | 'entityId' | 'success' | 'ipAddress' | 'userAgent' | 'metadata' | 'createdAt' | 'updatedAt'
>;

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public userId?: number | null;
  public actorEmail?: string | null;
  public action!: AuditAction;
  public entityType!: string;
  public entityId?: string | null;
  public success!: boolean;
  public ipAddress?: string | null;
  public userAgent?: string | null;
  public metadata?: Record<string, any> | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): AuditLogAttributes {
    return { ...this.get() } as AuditLogAttributes;
  }
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actorEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    indexes: [
      { name: 'audit_logs_action', fields: ['action'] },
      { name: 'audit_logs_user_id', fields: ['user_id'] },
      { name: 'audit_logs_entity', fields: ['entity_type', 'entity_id'] },
      { name: 'audit_logs_created_at', fields: ['created_at'] },
    ],
  }
);

export default AuditLog;
