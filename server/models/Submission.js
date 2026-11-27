import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    sid: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    sv: {
      type: Number,
      required: true,
      min: 1,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    // Compact numeric-ID -> compact value map (no repeated labels or empty fields)
    a: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    // Review status: 0 = Pending Review, 1 = Reviewed, 2 = Approved
    rs: {
      type: Number,
      required: true,
      default: 0,
      enum: [0, 1, 2],
    },
    // Responsible review answers (Section 9 numeric IDs "62".."71")
    rv: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: null,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    minimize: false,
  }
);

// Minimal required indexes for MongoDB Atlas M0 efficiency
submissionSchema.index({ sid: 1 }, { unique: true });
submissionSchema.index({ month: 1 });
submissionSchema.index({ createdAt: -1 });

const Submission =
  mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission;
