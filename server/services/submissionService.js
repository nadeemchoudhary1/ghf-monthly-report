import { isDatabaseConnected } from '../config/database.js';
import Submission from '../models/Submission.js';
import { enqueueJobsForSubmission } from './syncWorker.js';

/**
 * Persist a validated compact submission with strict sid idempotency.
 * Never acknowledges success unless MongoDB confirms insertion or an existing record.
 * Schedules email and Google Sheets jobs asynchronously without blocking submission success.
 */
export async function createOrGetSubmission({ sid, sv, month, a }) {
  if (!isDatabaseConnected()) {
    return {
      statusCode: 503,
      body: {
        success: false,
        status: 'failed',
        message: 'Temporary submission failure',
      },
    };
  }

  // 1. Check if this Submission ID was already persisted
  const existing = await Submission.findOne({ sid }).select('sid').lean();
  if (existing) {
    return {
      statusCode: 200,
      body: {
        success: true,
        status: 'already_submitted',
        sid: existing.sid,
      },
    };
  }

  // 2. Insert new compact record; handle simultaneous race via unique sid index
  try {
    const created = await Submission.create({
      sid,
      sv,
      month,
      a,
      rs: 0,
      rv: {},
    });

    // Independent outbox & job scheduling (never fails the submission!)
    try {
      await enqueueJobsForSubmission(created.toObject());
    } catch (queueErr) {
      console.error(
        '[SUBMISSION] Failed to enqueue background jobs:',
        queueErr?.message || 'Unknown error'
      );
    }

    return {
      statusCode: 201,
      body: {
        success: true,
        status: 'submitted',
        sid: created.sid,
      },
    };
  } catch (err) {
    if (err?.code === 11000) {
      const confirmedExisting = await Submission.findOne({ sid }).select('sid').lean();
      if (confirmedExisting) {
        return {
          statusCode: 200,
          body: {
            success: true,
            status: 'already_submitted',
            sid: confirmedExisting.sid,
          },
        };
      }
    }

    console.error('[SUBMISSION] Persistence failed:', err?.message || 'Unknown DB error');
    return {
      statusCode: 503,
      body: {
        success: false,
        status: 'failed',
        message: 'Temporary submission failure',
      },
    };
  }
}
