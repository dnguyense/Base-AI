"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const download_1 = __importDefault(require("./download"));
const auth_1 = __importDefault(require("./auth"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.json({
        message: 'PDF Compressor Pro API v1',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/v1/auth (Active)',
            pdf: '/api/v1/pdf (Active)',
            user: '/api/v1/user (Coming soon)',
            subscription: '/api/v1/subscription (Coming soon)'
        },
        documentation: 'API documentation will be available soon',
        timestamp: new Date().toISOString()
    });
});
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test endpoint working',
        headers: req.headers,
        timestamp: new Date().toISOString()
    });
});
router.use('/auth', auth_1.default);
router.use('/download', download_1.default);
exports.default = router;
//# sourceMappingURL=api.js.map