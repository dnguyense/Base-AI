"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.ProcessedFiles = exports.Subscription = exports.User = exports.sequelize = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.sequelize = database_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Subscription_1 = __importDefault(require("./Subscription"));
exports.Subscription = Subscription_1.default;
const ProcessedFiles_1 = __importDefault(require("./ProcessedFiles"));
exports.ProcessedFiles = ProcessedFiles_1.default;
User_1.default.hasOne(Subscription_1.default, {
    foreignKey: 'userId',
    as: 'subscription',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Subscription_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
User_1.default.hasMany(ProcessedFiles_1.default, {
    foreignKey: 'userId',
    as: 'processedFiles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
ProcessedFiles_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
const initializeDatabase = async () => {
    try {
        await database_1.default.authenticate();
        console.log('✅ Database connection established successfully');
        await database_1.default.sync({
            alter: process.env.NODE_ENV === 'development',
            force: process.env.NODE_ENV === 'test'
        });
        console.log('✅ Database models synchronized successfully');
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
exports.default = {
    sequelize: database_1.default,
    User: User_1.default,
    Subscription: Subscription_1.default,
    ProcessedFiles: ProcessedFiles_1.default,
    initializeDatabase: exports.initializeDatabase,
};
//# sourceMappingURL=index.js.map