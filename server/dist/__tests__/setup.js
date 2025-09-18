"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("../models");
dotenv_1.default.config({ path: '.env.test' });
beforeAll(async () => {
    console.log('Setting up test environment...');
    await (0, models_1.initializeDatabase)();
});
beforeEach(async () => {
    await models_1.sequelize.sync({ force: true });
});
afterAll(async () => {
    console.log('Cleaning up test environment...');
    await models_1.sequelize.close();
});
jest.setTimeout(10000);
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
//# sourceMappingURL=setup.js.map