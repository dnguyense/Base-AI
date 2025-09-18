import dotenv from 'dotenv';
import { initializeDatabase, sequelize } from '../models';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup test database or mock services
  console.log('Setting up test environment...');
  await initializeDatabase();
});

beforeEach(async () => {
  // Clean database before each test
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Cleanup test database or mock services
  console.log('Cleaning up test environment...');
  await sequelize.close();
  const downloadController = require('../controllers/download');
  downloadController.stopDownloadCleanupScheduler?.();

  const subscriptionModule = require('../services/subscriptionService');
  subscriptionModule.stopSubscriptionCacheCleanup?.();

  const fileCleanupModule = require('../services/fileCleanupService');
  fileCleanupModule.fileCleanupService?.stopScheduler();
});

// Global test timeout
jest.setTimeout(10000);

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-id' }))
  }))
}));

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn()
      }
    }
  }))
}));
