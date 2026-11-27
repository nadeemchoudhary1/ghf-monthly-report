import { Router } from 'express';
import { submitAssessment } from '../controllers/submissionController.js';
import { validateSubmissionPayload } from '../middleware/validationMiddleware.js';

const router = Router();

// Public submission endpoint ONLY (no GET/listing/viewing routes in Phase 2)
router.post('/', validateSubmissionPayload, submitAssessment);

export default router;
