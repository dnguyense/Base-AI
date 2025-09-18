"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const responseOptimization_1 = require("./middleware/responseOptimization");
const health_1 = __importDefault(require("./routes/health"));
const api_1 = __importDefault(require("./routes/api"));
const auth_1 = __importDefault(require("./routes/auth"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const pdf_1 = __importDefault(require("./routes/pdf"));
const cleanup_1 = __importDefault(require("./routes/cleanup"));
const errors_1 = __importDefault(require("./routes/errors"));
const models_1 = require("./models");
const fileCleanupService_1 = require("./services/fileCleanupService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.NODE_ENV === 'production'
    ? (process.env.PORT || 8000)
    : (process.env.PORT || 5000);
if (process.env.NODE_ENV !== 'test') {
    app.use((0, helmet_1.default)());
}
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'test' ? true : (process.env.FRONTEND_URL || 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, compression_1.default)());
app.use((0, responseOptimization_1.compressionOptimization)());
app.use((0, responseOptimization_1.etagMiddleware)());
app.use((0, responseOptimization_1.cacheControlMiddleware)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test'
});
app.use('/api', limiter);
app.use('/api', (0, responseOptimization_1.paginationMiddleware)(20, 100));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/health', health_1.default);
app.use('/api/v1', api_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/subscription', subscription_1.default);
app.use('/api/v1/pdf', pdf_1.default);
app.use('/api/v1/cleanup', cleanup_1.default);
app.use('/api/v1/errors', errors_1.default);
app.get('/', (req, res) => {
    res.json({
        message: 'PDF Compressor Pro API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, models_1.initializeDatabase)();
        console.log('🧹 Initializing file cleanup service...');
        fileCleanupService_1.fileCleanupService.startScheduler();
        fileCleanupService_1.fileCleanupService.on('cleanupCompleted', (stats) => {
            console.log(`🧹 Cleanup completed: ${stats.filesDeleted} files deleted, ${Math.round(stats.spaceFreeKB / 1024)}MB freed`);
        });
        fileCleanupService_1.fileCleanupService.on('error', (error) => {
            console.error('🧹 File cleanup error:', error);
        });
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Database: Connected and synchronized`);
            console.log(`🧹 File cleanup service: Active (runs every 1 hour)`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
if (process.env.NODE_ENV !== 'test' || process.env.E2E_TEST === 'true') {
    startServer();
}
exports.default = app;
//# sourceMappingURL=index.js.map