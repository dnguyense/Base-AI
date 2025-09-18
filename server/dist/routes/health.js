"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
            external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
        },
        system: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version
        }
    };
    res.status(200).json(healthCheck);
});
router.get('/detailed', async (req, res) => {
    try {
        const healthCheck = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            services: {
                api: 'OK',
                database: 'Not Connected',
                redis: 'Not Connected',
                fileSystem: 'OK'
            },
            performance: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        };
        res.status(200).json({
            success: true,
            data: healthCheck
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: {
                message: 'Health check failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.js.map