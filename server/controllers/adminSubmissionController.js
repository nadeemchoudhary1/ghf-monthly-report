import {
  getAdminDashboardData,
  getAdminSubmissionDetail,
  listAdminSubmissions,
  updateAdminSubmissionReview,
} from '../services/adminSubmissionService.js';

export async function fetchDashboard(req, res) {
  try {
    const data = await getAdminDashboardData({
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('[ADMIN] Dashboard error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics.',
    });
  }
}

export async function fetchSubmissions(req, res) {
  try {
    const data = await listAdminSubmissions({
      page: req.query.page,
      limit: req.query.limit,
      q: req.query.q,
      month: req.query.month,
      city: req.query.city,
      rs: req.query.rs,
      sort: req.query.sort,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('[ADMIN] List submissions error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to load submissions.',
    });
  }
}

export async function fetchSubmissionDetail(req, res) {
  try {
    const submission = await getAdminSubmissionDetail(req.params.sid);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }
    return res.status(200).json({ success: true, submission });
  } catch (err) {
    console.error('[ADMIN] Fetch detail error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to load submission details.',
    });
  }
}

export async function saveSubmissionReview(req, res) {
  try {
    const result = await updateAdminSubmissionReview(
      req.params.sid,
      {
        rs: req.body?.rs,
        rv: req.body?.rv,
      },
      req.admin?.username
    );

    if (!result.ok) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
        errors: result.errors,
      });
    }

    return res.status(200).json({
      success: true,
      submission: result.submission,
    });
  } catch (err) {
    console.error('[ADMIN] Save review error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to save review.',
    });
  }
}
