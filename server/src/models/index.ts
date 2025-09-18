import sequelize from '../config/database';
import User from './User';
import Subscription from './Subscription';
import ProcessedFiles from './ProcessedFiles';
import { env } from '../config/env';

// Define model associations
User.hasOne(Subscription, {
  foreignKey: 'userId',
  as: 'subscription',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Subscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(ProcessedFiles, {
  foreignKey: 'userId',
  as: 'processedFiles',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

ProcessedFiles.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Export models and sequelize instance
export {
  sequelize,
  User,
  Subscription,
  ProcessedFiles,
};

// Export model types for use in other files
export type { UserAttributes } from './User';
export type { SubscriptionAttributes } from './Subscription';
export type { ProcessedFilesAttributes } from './ProcessedFiles';

// Initialize all models
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({
      alter: env.nodeEnv === 'development', // Only alter in development
      force: env.isTest, // Force recreate for in-memory test database
    });
    console.log('✅ Database models synchronized successfully');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Export default for convenience
export default {
  sequelize,
  User,
  Subscription,
  ProcessedFiles,
  initializeDatabase,
};
