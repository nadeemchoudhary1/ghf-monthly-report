import mongoose from 'mongoose';

/**
 * Persistent MongoDB job queue for independent background execution & retries.
 * Survives Render Free Tier restarts / sleep cycles without losing pending deliveries.
 * Does NOT duplicate form payloads; workers fetch the submission via `sid` when processing.
 */
const syncJobSchema = new mongoose.Schema(
  {
    // Unique event identifier: e.g. GHF-202611-XXXX_ADMIN, _MEMBER, _SHEETS
    eventKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 96,
    },
    sid: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    type: {
      type: String,
      required: true,
      enum: ['admin_email', 'member_email', 'google_sheets'],
    },
    // 0 = Pending, 1 = Completed, 2 = Failed / Retry Required
    status: {
      type: Number,
      required: true,
      default: 0,
      enum: [0, 1, 2],
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    nextAttemptAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    providerMessageId: {
      type: String,
      default: null,
      maxlength: 200,
    },
    lastErrorCode: {
      type: String,
      default: null,
      maxlength: 120,
    },
    lastErrorMessage: {
      type: String,
      default: null,
      maxlength: 400,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

syncJobSchema.index({ status: 1, nextAttemptAt: 1 });
syncJobSchema.index({ sid: 1, type: 1 });

const SyncJob =
  mongoose.models.SyncJob || mongoose.model('SyncJob', syncJobSchema);

export default SyncJob;
