import { Router } from 'express';
import { getAdminSystemHealth } from '../controllers/adminHealthController.js';
import {
  exportSubmissions,
  getIntegrationsStatus,
  retryAllFailedEmails,
  retryAllFailedSheets,
  retrySubmissionEmails,
  retrySubmissionSheetsSync,
  testEmailIntegration,
  testSheetsIntegration,
} from '../controllers/adminIntegrationController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { adminCsrfGuard } from '../middleware/securityMiddleware.js';

const router = Router();

router.use(requireAdminAuth);
router.use(adminCsrfGuard);

router.get('/system-health', getAdminSystemHealth);
router.get('/integrations/status', getIntegrationsStatus);
router.post('/integrations/test-email', testEmailIntegration);
router.post('/integrations/test-sheets', testSheetsIntegration);
router.post('/integrations/retry-failed-email', retryAllFailedEmails);
router.post('/integrations/retry-failed-sheets', retryAllFailedSheets);

router.post('/sync/retry/:sid', retrySubmissionSheetsSync);
router.post('/email/retry/:sid', retrySubmissionEmails);

router.get('/export', exportSubmissions);

export default router;
