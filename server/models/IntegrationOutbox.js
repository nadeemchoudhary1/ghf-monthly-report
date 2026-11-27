import mongoose from 'mongoose';

/**
 * Lightweight outbox status summary per submission.
 * Stored separately from Submission.a (zero duplicate copies of member answers).
 * Status codes: 0 = Pending, 1 = Completed, 2 = Failed / Retry Required, null = Not Applicable (e.g. no email)
 */
const integrationOutboxSchema = new mongoose.Schema(
  {
    sid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 64,
    },
    emailAdmin: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, null],
    },
    emailMember: {
      type: Number,
      default: null,
      enum: [0, 1, 2, null],
    },
    sheetSync: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, null],
    },
    lastAttempt: {
      type: Date,
      default: null,
    },
    lastSuccessAt: {
      type: Date,
      default: null,
    },
    lastError: {
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

integrationOutboxSchema.index({ updatedAt: -1 });

const IntegrationOutbox =
  mongoose.models.IntegrationOutbox ||
  mongoose.model('IntegrationOutbox', integrationOutboxSchema);

export default IntegrationOutbox;
