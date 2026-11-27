import { Router } from 'express';
import {
  fetchDashboard,
  fetchSubmissionDetail,
  fetchSubmissions,
  saveSubmissionReview,
} from '../controllers/adminSubmissionController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { adminCsrfGuard } from '../middleware/securityMiddleware.js';

const router = Router();

// Every admin submission & dashboard endpoint is strictly protected by JWT cookie auth + CSRF guard
router.use(requireAdminAuth);
router.use(adminCsrfGuard);

router.get('/dashboard', fetchDashboard);
router.get('/submissions', fetchSubmissions);
router.get('/submissions/:sid', fetchSubmissionDetail);
router.patch('/submissions/:sid/review', saveSubmissionReview);

export default router;
