"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = exports.connectDatabase = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
if (process.env.NODE_ENV === 'test') {
    dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env.test') });
}
else {
    dotenv_1.default.config();
}
let sequelize;
if (process.env.NODE_ENV === 'test') {
    sequelize = new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        },
    });
}
else {
    sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        },
    });
}
exports.default = sequelize;
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('✅ Database synced successfully');
    }
    catch (error) {
        console.error('❌ Database sync failed:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
//# sourceMappingURL=database.js.map