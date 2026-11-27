import { getDatabaseStatus, isDatabaseConnected } from '../config/database.js';
import Submission from '../models/Submission.js';
import SyncJob from '../models/SyncJob.js';
import { getIntegrationStatusSummary } from '../services/syncWorker.js';

export async function getAdminSystemHealth(_req, res) {
  try {
    const dbConnected = isDatabaseConnected();
    const dbStatus = getDatabaseStatus();

    const [
      totalSubmissions,
      pendingJobs,
      failedJobs,
      completedJobs,
      recentJobFailures,
      integrations,
    ] = await Promise.all([
      dbConnected ? Submission.countDocuments({}) : 0,
      dbConnected ? SyncJob.countDocuments({ status: 0 }) : 0,
      dbConnected ? SyncJob.countDocuments({ status: 2 }) : 0,
      dbConnected ? SyncJob.countDocuments({ status: 1 }) : 0,
      dbConnected
        ? SyncJob.find({ status: 2 })
            .sort({ lastAttemptAt: -1 })
            .limit(10)
            .select('-_id sid type attempts lastAttemptAt lastErrorCode')
            .lean()
        : [],
      dbConnected
        ? getIntegrationStatusSummary()
        : {
            email: { configured: false, provider: 'unknown' },
            googleSheets: { configured: false, connected: false },
          },
    ]);

    return res.status(200).json({
      success: true,
      backend: {
        status: 'online',
        uptimeSeconds: Math.round(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
      },
      database: {
        status: dbStatus,
        connected: dbConnected,
        totalSubmissions,
      },
      integrations,
      jobs: {
        pending: pendingJobs,
        failed: failedJobs,
        completed: completedJobs,
        recentFailures: recentJobFailures,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system health.',
    });
  }
}
