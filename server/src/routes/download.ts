import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  generateDownloadToken, 
  secureDownload, 
  getDownloadAnalytics, 
  getDownloadAuditTrail 
} from '../controllers/download';

const router = express.Router();

/**
 * @route POST /api/v1/download/token
 * @description Generate secure download token for compressed file
 * @access Private (requires authentication)
 */
router.post('/token', authenticateToken, generateDownloadToken);

/**
 * @route GET /api/v1/download/:token
 * @description Download file using secure token
 * @access Public (token-based authentication)
 */
router.get('/:token', secureDownload);

/**
 * @route GET /api/v1/download/analytics/user
 * @description Get download analytics for authenticated user
 * @access Private (requires authentication)
 */
router.get('/analytics/user', authenticateToken, getDownloadAnalytics);

/**
 * @route GET /api/v1/download/audit/trail
 * @description Get download audit trail (admin only)
 * @access Private (admin authentication required)
 * @note This endpoint should have admin middleware in production
 */
router.get('/audit/trail', authenticateToken, requireAdmin, getDownloadAuditTrail);

export default router;
