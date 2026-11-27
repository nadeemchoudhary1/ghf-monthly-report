import { createOrGetSubmission } from '../services/submissionService.js';
import { logEvent } from '../utils/logger.js';

export async function submitAssessment(req, res) {
  try {
    const result = await createOrGetSubmission(req.validatedSubmission);
    if (!result.body?.success) {
      logEvent('warn', 'submission_failed', {
        requestId: req.requestId,
        sid: req.validatedSubmission?.sid,
        statusCode: result.statusCode,
      });
    }
    return res.status(result.statusCode).json(result.body);
  } catch (err) {
    logEvent('error', 'submission_controller_error', {
      requestId: req.requestId,
      sid: req.validatedSubmission?.sid,
      message: err?.message || 'Unknown error',
    });
    return res.status(503).json({
      success: false,
      status: 'failed',
      message: 'Temporary submission failure',
    });
  }
}
