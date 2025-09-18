"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const download_1 = require("../controllers/download");
const router = express_1.default.Router();
router.post('/token', auth_1.authenticateToken, download_1.generateDownloadToken);
router.get('/:token', download_1.secureDownload);
router.get('/analytics/user', auth_1.authenticateToken, download_1.getDownloadAnalytics);
router.get('/audit/trail', download_1.getDownloadAuditTrail);
exports.default = router;
//# sourceMappingURL=download.js.map