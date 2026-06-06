const mongoose = require('mongoose');

const APPLICATION_STATUS = ['pending', 'confirmed', 'rejected'];

const applicationSchema = new mongoose.Schema(
  {
    // ── GitHub References ─────────────────────────────────────────────────────
    githubIssueNumber: {
      type: Number,
      required: [true, 'GitHub issue number is required'],
    },

    githubIssueUrl: {
      type: String,
      required: [true, 'GitHub issue URL is required'],
      trim: true,
    },

    githubRepoFullName: {
      type: String,
      required: [true, 'Repository full name is required'],
      trim: true,
    },

    // ── Applicant Info ────────────────────────────────────────────────────────
    applicantGithubUsername: {
      type: String,
      required: [true, 'Applicant GitHub username is required'],
      trim: true,
    },

    applicantGithubId: {
      type: String,
      trim: true,
      default: null,
    },

    applicantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      // Links to the DealVault platform User if they have an account
    },

    // ── Application Content ───────────────────────────────────────────────────
    applicationLetter: {
      type: String,
      required: [true, 'Application letter is required'],
      trim: true,
      minlength: [10, 'Application letter must be at least 10 characters'],
      maxlength: [2000, 'Application letter cannot exceed 2000 characters'],
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUS,
        message: `Status must be one of: ${APPLICATION_STATUS.join(', ')}`,
      },
      default: 'pending',
    },

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Reference to platform Issue ───────────────────────────────────────────
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Prevent duplicate applications from same user on same issue
applicationSchema.index(
  { githubRepoFullName: 1, githubIssueNumber: 1, applicantGithubUsername: 1 },
  { unique: true }
);
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicantGithubUsername: 1 });
applicationSchema.index({ issue: 1 });

module.exports = mongoose.model('Application', applicationSchema);
