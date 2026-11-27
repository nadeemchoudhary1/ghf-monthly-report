import { isDatabaseConnected } from '../config/database.js';
import IntegrationOutbox from '../models/IntegrationOutbox.js';
import Submission from '../models/Submission.js';
import SyncJob from '../models/SyncJob.js';
import {
  buildAdminNotificationEmail,
  buildMemberConfirmationEmail,
} from '../utils/emailTemplates.js';
import {
  getEmailConfigSummary,
  sendEmail,
} from './emailService.js';
import {
  getGoogleSheetsConfigSummary,
  syncSubmissionToGoogleSheets,
} from './googleSheetsService.js';
import { logEvent } from '../utils/logger.js';

const MAX_AUTO_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 10_000;
const MAX_BACKOFF_MS = 30 * 60_000; // 30 minutes
const STALE_LOCK_MS = 2 * 60_000; // 2 minutes lock timeout for crashed workers
const POLL_INTERVAL_MS = 20_000;

let workerInterval = null;
let isCycleRunning = false;

export function getExponentialBackoffMs(attempts = 1) {
  const exp = Math.min(Math.max(0, attempts - 1), 8);
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * Math.pow(2, exp));
}

function getOutboxFieldForJobType(type) {
  if (type === 'admin_email') return 'emailAdmin';
  if (type === 'member_email') return 'emailMember';
  if (type === 'google_sheets') return 'sheetSync';
  return null;
}

/**
 * Create outbox summary & idempotent SyncJob records right after MongoDB insertion.
 * Never blocks the public POST /api/submissions response.
 */
export async function enqueueJobsForSubmission(submission) {
  const sid = submission.sid;
  const memberEmail = submission.a?.['72'] ? String(submission.a['72']).trim() : '';

  await IntegrationOutbox.findOneAndUpdate(
    { sid },
    {
      $setOnInsert: {
        sid,
        emailAdmin: 0,
        emailMember: memberEmail ? 0 : null,
        sheetSync: 0,
        lastAttempt: null,
        lastSuccessAt: null,
        lastError: null,
      },
    },
    { upsert: true, new: true }
  );

  const now = new Date();
  const jobsToUpsert = [
    { eventKey: `${sid}_ADMIN`, sid, type: 'admin_email' },
    ...(memberEmail
      ? [{ eventKey: `${sid}_MEMBER`, sid, type: 'member_email' }]
      : []),
    { eventKey: `${sid}_SHEETS`, sid, type: 'google_sheets' },
  ];

  await Promise.all(
    jobsToUpsert.map((job) =>
      SyncJob.updateOne(
        { eventKey: job.eventKey },
        {
          $setOnInsert: {
            ...job,
            status: 0,
            attempts: 0,
            nextAttemptAt: now,
            lockedAt: null,
          },
        },
        { upsert: true }
      )
    )
  );

  setImmediate(() => {
    processPendingJobs({ limit: 5 }).catch((err) => {
      console.error('[WORKER] Immediate dispatch error:', err?.message || 'Unknown error');
    });
  });
}

/**
 * Mark Google Sheets synchronization as pending after Admin saves Section 9 review.
 * Updates the existing row in place using the same eventKey.
 */
export async function enqueueSheetsReviewSync(sid) {
  const now = new Date();

  await IntegrationOutbox.findOneAndUpdate(
    { sid },
    {
      $set: { sheetSync: 0 },
      $setOnInsert: {
        sid,
        emailAdmin: 1,
        emailMember: null,
      },
    },
    { upsert: true }
  );

  await SyncJob.findOneAndUpdate(
    { eventKey: `${sid}_SHEETS` },
    {
      $set: {
        status: 0,
        attempts: 0,
        nextAttemptAt: now,
        lockedAt: null,
        lastErrorCode: null,
        lastErrorMessage: null,
      },
      $setOnInsert: {
        eventKey: `${sid}_SHEETS`,
        sid,
        type: 'google_sheets',
      },
    },
    { upsert: true }
  );

  setImmediate(() => {
    processPendingJobs({ limit: 3 }).catch((err) => {
      console.error('[WORKER] Review sync trigger error:', err?.message || 'Unknown error');
    });
  });
}

async function claimNextDueJob() {
  const now = new Date();
  const staleLockCutoff = new Date(now.getTime() - STALE_LOCK_MS);

  return SyncJob.findOneAndUpdate(
    {
      status: { $in: [0, 2] },
      nextAttemptAt: { $lte: now },
      attempts: { $lt: MAX_AUTO_ATTEMPTS },
      $or: [{ lockedAt: null }, { lockedAt: { $lt: staleLockCutoff } }],
    },
    {
      $set: { lockedAt: now, lastAttemptAt: now },
    },
    {
      sort: { nextAttemptAt: 1, createdAt: 1 },
      new: true,
    }
  ).lean();
}

async function executeJob(job) {
  const submission = await Submission.findOne({ sid: job.sid }).lean();
  if (!submission) {
    throw Object.assign(new Error(`Submission ${job.sid} not found.`), {
      code: 'SUBMISSION_NOT_FOUND',
    });
  }

  const outboxField = getOutboxFieldForJobType(job.type);

  if (job.type === 'admin_email') {
    // Duplicate guard: skip if already recorded as sent
    const outbox = await IntegrationOutbox.findOne({ sid: job.sid }).lean();
    if (outbox?.emailAdmin === 1 || job.providerMessageId) {
      return { messageId: job.providerMessageId || 'already_recorded' };
    }

    const adminEmail = process.env.GHF_ADMIN_EMAIL?.trim();
    if (!adminEmail) {
      throw Object.assign(new Error('GHF_ADMIN_EMAIL is not configured.'), {
        code: 'ADMIN_EMAIL_MISSING',
      });
    }

    const { subject, html } = buildAdminNotificationEmail(submission);
    const result = await sendEmail({
      to: adminEmail,
      subject,
      html,
      idempotencyKey: job.eventKey,
    });
    return { messageId: result?.messageId || 'sent', outboxField };
  }

  if (job.type === 'member_email') {
    const outbox = await IntegrationOutbox.findOne({ sid: job.sid }).lean();
    if (outbox?.emailMember === 1 || job.providerMessageId) {
      return { messageId: job.providerMessageId || 'already_recorded' };
    }

    const memberEmail = submission.a?.['72']
      ? String(submission.a['72']).trim()
      : '';
    if (!memberEmail) {
      return { messageId: 'skipped_no_member_email', skipOutboxNull: true };
    }

    const { subject, html } = buildMemberConfirmationEmail(submission);
    const result = await sendEmail({
      to: memberEmail,
      subject,
      html,
      idempotencyKey: job.eventKey,
    });
    return { messageId: result?.messageId || 'sent', outboxField };
  }

  if (job.type === 'google_sheets') {
    await syncSubmissionToGoogleSheets(submission);
    return { messageId: 'sheets_synced', outboxField };
  }

  throw new Error(`Unknown job type: ${job.type}`);
}

export async function processPendingJobs({ limit = 5 } = {}) {
  if (!isDatabaseConnected() || isCycleRunning) {
    return { processed: 0 };
  }

  isCycleRunning = true;
  let processed = 0;

  try {
    for (let i = 0; i < limit; i++) {
      const job = await claimNextDueJob();
      if (!job) break;

      processed += 1;
      const outboxField = getOutboxFieldForJobType(job.type);

      try {
        const result = await executeJob(job);
        const now = new Date();

        try {
          await SyncJob.updateOne(
            { _id: job._id },
            {
              $set: {
                status: 1,
                lockedAt: null,
                completedAt: now,
                providerMessageId: result?.messageId || 'ok',
                lastErrorCode: null,
                lastErrorMessage: null,
              },
            }
          );

          if (outboxField) {
            await IntegrationOutbox.updateOne(
              { sid: job.sid },
              {
                $set: {
                  [outboxField]: result?.skipOutboxNull ? null : 1,
                  lastAttempt: now,
                  lastSuccessAt: now,
                  lastError: null,
                },
              },
              { upsert: true }
            );
          }
        } catch (dbErr) {
          // Provider accepted message but DB recording failed -> log uncertain delivery state
          console.error(
            `[WORKER] Uncertain delivery state for ${job.eventKey}:`,
            dbErr?.message || 'DB update failed after delivery'
          );
          await SyncJob.updateOne(
            { _id: job._id },
            {
              $set: {
                lockedAt: null,
                providerMessageId: result?.messageId || 'uncertain_delivery',
                lastErrorCode: 'UNCERTAIN_DELIVERY_DB_ERR',
                lastErrorMessage: String(dbErr?.message || 'DB update failed').slice(0, 380),
              },
            }
          ).catch(() => {});
        }
      } catch (err) {
        const nextAttempts = (job.attempts || 0) + 1;
        const backoffMs = getExponentialBackoffMs(nextAttempts);
        const nextAttemptAt = new Date(Date.now() + backoffMs);
        const errCode = String(err?.code || 'DELIVERY_ERROR').slice(0, 120);
        const errMsg = String(err?.message || 'Delivery failed').slice(0, 380);

        logEvent('warn', 'background_job_failed', {
          sid: job.sid,
          eventKey: job.eventKey,
          type: job.type,
          attempts: nextAttempts,
          errCode,
          nextAttemptAt: nextAttemptAt.toISOString(),
        });

        await SyncJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: 2,
              attempts: nextAttempts,
              nextAttemptAt,
              lockedAt: null,
              lastErrorCode: errCode,
              lastErrorMessage: errMsg,
            },
          }
        );

        if (outboxField) {
          await IntegrationOutbox.updateOne(
            { sid: job.sid },
            {
              $set: {
                [outboxField]: 2,
                lastAttempt: new Date(),
                lastError: errMsg,
              },
            },
            { upsert: true }
          );
        }
      }
    }
  } finally {
    isCycleRunning = false;
  }

  return { processed };
}

/**
 * Admin manual retry for a specific Submission ID (either email jobs or google_sheets).
 * Completed emails are NOT resent unless never completed.
 */
export async function retrySubmissionJobs(sid, types) {
  const now = new Date();
  const submission = await Submission.findOne({ sid }).lean();
  if (!submission) {
    return { ok: false, notFound: true, message: 'Submission not found.' };
  }

  const targetTypes = Array.isArray(types) ? types : [types];

  for (const type of targetTypes) {
    if (type === 'member_email' && !submission.a?.['72']) {
      continue;
    }

    const suffix =
      type === 'admin_email' ? 'ADMIN' : type === 'member_email' ? 'MEMBER' : 'SHEETS';
    const eventKey = `${sid}_${suffix}`;
    const existingJob = await SyncJob.findOne({ eventKey }).lean();

    // Duplicate email prevention: never resend already-completed emails
    if (
      (type === 'admin_email' || type === 'member_email') &&
      existingJob?.status === 1
    ) {
      continue;
    }

    await SyncJob.findOneAndUpdate(
      { eventKey },
      {
        $set: {
          status: 0,
          attempts: 0,
          nextAttemptAt: now,
          lockedAt: null,
          lastErrorCode: null,
          lastErrorMessage: null,
        },
        $setOnInsert: {
          eventKey,
          sid,
          type,
        },
      },
      { upsert: true }
    );

    const outboxField = getOutboxFieldForJobType(type);
    if (outboxField) {
      await IntegrationOutbox.updateOne(
        { sid },
        { $set: { [outboxField]: 0 } },
        { upsert: true }
      );
    }
  }

  await processPendingJobs({ limit: 5 });
  const outbox = await IntegrationOutbox.findOne({ sid }).select('-_id -__v').lean();
  return { ok: true, outbox };
}

/**
 * Admin retry for all failed jobs of given type(s) (used in Settings -> Integrations).
 */
export async function retryFailedJobsByType(types) {
  const now = new Date();
  const targetTypes = Array.isArray(types) ? types : [types];

  const result = await SyncJob.updateMany(
    {
      type: { $in: targetTypes },
      status: 2,
    },
    {
      $set: {
        status: 0,
        attempts: 0,
        nextAttemptAt: now,
        lockedAt: null,
      },
    }
  );

  for (const type of targetTypes) {
    const outboxField = getOutboxFieldForJobType(type);
    if (outboxField) {
      await IntegrationOutbox.updateMany(
        { [outboxField]: 2 },
        { $set: { [outboxField]: 0 } }
      );
    }
  }

  const processed = await processPendingJobs({ limit: 15 });
  return {
    resetCount: result.modifiedCount || 0,
    processedCount: processed.processed,
  };
}

export async function getIntegrationStatusSummary() {
  const emailSummary = getEmailConfigSummary();
  const sheetsSummary = getGoogleSheetsConfigSummary();

  const [
    pendingEmailJobs,
    failedEmailJobs,
    lastSuccessEmail,
    pendingSheetJobs,
    failedSheetJobs,
    lastSuccessSheet,
  ] = await Promise.all([
    SyncJob.countDocuments({ type: { $in: ['admin_email', 'member_email'] }, status: 0 }),
    SyncJob.countDocuments({ type: { $in: ['admin_email', 'member_email'] }, status: 2 }),
    SyncJob.findOne({ type: { $in: ['admin_email', 'member_email'] }, status: 1 })
      .sort({ completedAt: -1 })
      .select('completedAt')
      .lean(),
    SyncJob.countDocuments({ type: 'google_sheets', status: 0 }),
    SyncJob.countDocuments({ type: 'google_sheets', status: 2 }),
    SyncJob.findOne({ type: 'google_sheets', status: 1 })
      .sort({ completedAt: -1 })
      .select('completedAt')
      .lean(),
  ]);

  return {
    email: {
      configured: emailSummary.configured,
      provider: emailSummary.provider,
      adminEmailConfigured: emailSummary.adminEmailConfigured,
      pendingNotifications: pendingEmailJobs,
      failedNotifications: failedEmailJobs,
      lastSuccessfulNotification: lastSuccessEmail?.completedAt || null,
    },
    googleSheets: {
      configured: sheetsSummary.configured,
      connected: sheetsSummary.configured,
      pendingRecords: pendingSheetJobs,
      failedRecords: failedSheetJobs,
      lastSuccessfulSync: lastSuccessSheet?.completedAt || null,
    },
  };
}

export function startSyncWorker() {
  if (workerInterval) return;

  // Immediate sweep on startup to resume jobs interrupted by Render restarts
  setTimeout(() => {
    processPendingJobs({ limit: 10 }).catch(() => {});
  }, 2000);

  workerInterval = setInterval(() => {
    processPendingJobs({ limit: 5 }).catch((err) => {
      console.error('[WORKER] Scheduled sweep error:', err?.message || 'Unknown error');
    });
  }, POLL_INTERVAL_MS);

  if (typeof workerInterval.unref === 'function') {
    workerInterval.unref();
  }
}

export function stopSyncWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }
}
